import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  const startButton = page.getByRole('button', { name: 'INICIAR HEIST' });
  const newGameButton = page.getByRole('button', { name: 'NUEVA PARTIDA' });

  if (await startButton.isVisible()) {
    await startButton.click();
  } else if (await newGameButton.isVisible()) {
    await newGameButton.click();
  }

  await expect(page.getByTestId('board')).toBeVisible();
});

test('inicia una partida y muestra el tablero con dos jugadores', async ({ page }) => {
  await expect(page.getByTestId('player-1')).toBeVisible();
  await expect(page.getByTestId('player-2')).toBeVisible();
  await expect(page.getByTestId('game-status')).toContainText('TURNO');
});

test('realiza una acción de movimiento y cambia el turno', async ({ page }) => {
  const message = page.getByTestId('message');
  const before = await message.textContent();

  const moveButtons = page.locator('.direction-pad button:not(:disabled)');

  await expect(moveButtons).toHaveCount(4);

  await moveButtons.nth(0).click();

  await expect(message).not.toHaveText(before ?? '');
  await expect(page.locator('.control-status')).toContainText('TU TURNO');
});

test('rechaza en el backend una acción enviada fuera de turno', async ({ page }) => {
  const gameResponse = await page.request.get('/api/game');

  expect(gameResponse.ok()).toBeTruthy();

  const game = await gameResponse.json();

  expect(game.game.currentPlayer).toBe(1);

  const response = await page.request.post('/api/game/action', {
    data: {
      playerId: 2,
      action: 'DEFEND'
    }
  });

  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body.error).toBe('No es tu turno.');
});

test('permite consultar el resultado mediante el backend', async ({ page }) => {
  await page.getByRole('button', { name: 'CONSULTAR RESULTADO' }).click();

  await expect(page.getByTestId('message')).toContainText('AGENT');
});

test('finaliza por límite de turnos usando acciones reales', async ({ page }) => {
  for (let i = 0; i < 40; i += 1) {
    const gameResponse = await page.request.get('/api/game');

    expect(gameResponse.ok()).toBeTruthy();

    const game = await gameResponse.json();

    if (game.game.status === 'finished') {
      break;
    }

    const playerId = game.game.currentPlayer;

    const response = await page.request.post('/api/game/action', {
      data: {
        playerId,
        action: 'DEFEND'
      }
    });

    if (!response.ok()) {
      const body = await response.json();

      if (body.error?.startsWith('Energía insuficiente')) {
        const moveDirections = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

        let moved = false;

        for (const direction of moveDirections) {
          const moveResponse = await page.request.post('/api/game/action', {
            data: {
              playerId,
              action: 'MOVE',
              direction
            }
          });

          if (moveResponse.ok()) {
            moved = true;
            break;
          }
        }

        expect(moved).toBeTruthy();
      } else {
        throw new Error(body.error ?? 'La acción fue rechazada.');
      }
    }
  }

  const resultResponse = await page.request.get('/api/game/result');

  expect(resultResponse.ok()).toBeTruthy();

  const result = await resultResponse.json();

  expect(result.status).toBe('finished');
  expect(result.reason).toBe('TURN_LIMIT');
  expect(result.message).toContain('Se alcanzó el límite de turnos.');
});