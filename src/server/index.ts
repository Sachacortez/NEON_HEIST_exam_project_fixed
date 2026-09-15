import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyAction, createGame, getGame, getResult } from './game.ts';
import type { ActionRequest, PlayerId } from '../shared/types.ts';

const app = express();
const port = Number(process.env.PORT) || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../../dist');

app.use(express.json());

app.get('/api/game', (_req, res) => {
  const game = getGame();
  if (!game) {
    res.status(404).json({ error: 'No existe una partida. Crea una nueva partida.' });
    return;
  }
  res.json(game);
});

app.post('/api/game', (_req, res) => {
  res.status(201).json(createGame());
});

app.post('/api/game/action', (req, res) => {
  const body = req.body as Partial<ActionRequest>;
  if (body.playerId !== 1 && body.playerId !== 2) {
    res.status(400).json({ error: 'playerId debe ser 1 o 2.' });
    return;
  }
  if (!['MOVE', 'ATTACK', 'DEFEND', 'COLLECT'].includes(body.action ?? '')) {
    res.status(400).json({ error: 'Acción inválida.' });
    return;
  }
  if (body.direction !== undefined && !['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(body.direction)) {
    res.status(400).json({ error: 'Dirección inválida.' });
    return;
  }

  try {
    const state = applyAction({
      playerId: body.playerId as PlayerId,
      action: body.action!,
      direction: body.direction
    });
    res.json(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo realizar la acción.';
    res.status(400).json({ error: message });
  }
});

app.get('/api/game/result', (_req, res) => {
  const result = getResult();
  if (!result) {
    res.status(404).json({ error: 'No existe una partida.' });
    return;
  }
  res.json(result);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(express.static(frontendPath));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`NEON HEIST server running on port ${port}`);
});
