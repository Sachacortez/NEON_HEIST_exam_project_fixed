import type {
  ActionRequest,
  Board,
  Cell,
  Direction,
  GameState,
  Player,
  PlayerId
} from '../shared/types.ts';

const WIDTH = 11;
const HEIGHT = 9;
const MAX_TURNS = 40;
const OBSTACLE_COUNT = 12;
const CORE_COUNT = 8;
const MAX_HEALTH = 10;
const MAX_ENERGY = 8;
const START_ENERGY = 6;

export const ACTION_COSTS = {
  MOVE: 1,
  ATTACK: 3,
  DEFEND: 2,
  COLLECT: 1
} as const;

let currentGame: GameState | null = null;

function samePosition(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return a.x === b.x && a.y === b.y;
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomFreePosition(blocked: Set<string>): { x: number; y: number } {
  for (;;) {
    const position = { x: randomInt(WIDTH), y: randomInt(HEIGHT) };
    if (!blocked.has(key(position.x, position.y))) {
      return position;
    }
  }
}

function createBoard(playerPositions: { x: number; y: number }[]): Board {
  const blocked = new Set(playerPositions.map((position) => key(position.x, position.y)));
  const obstacleKeys = new Set<string>();

  while (obstacleKeys.size < OBSTACLE_COUNT) {
    const position = randomFreePosition(blocked);
    obstacleKeys.add(key(position.x, position.y));
    blocked.add(key(position.x, position.y));
  }

  const resourceKeys = new Set<string>();
  while (resourceKeys.size < CORE_COUNT) {
    const position = randomFreePosition(blocked);
    resourceKeys.add(key(position.x, position.y));
    blocked.add(key(position.x, position.y));
  }

  const cells: Cell[] = [];
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      cells.push({
        x,
        y,
        obstacle: obstacleKeys.has(key(x, y)),
        resource: resourceKeys.has(key(x, y))
      });
    }
  }

  return { width: WIDTH, height: HEIGHT, cells };
}

function createPlayer(id: PlayerId, position: { x: number; y: number }): Player {
  return {
    id,
    name: `AGENT ${id}`,
    position,
    health: MAX_HEALTH,
    energy: START_ENERGY,
    score: 0,
    coresCollected: 0,
    defending: false
  };
}

export function createGame(): GameState {
  const firstPosition = randomFreePosition(new Set());
  const secondPosition = randomFreePosition(new Set([key(firstPosition.x, firstPosition.y)]));
  const board = createBoard([firstPosition, secondPosition]);

  currentGame = {
    game: {
      id: `game-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      status: 'playing',
      currentPlayer: 1,
      turn: 1,
      maxTurns: MAX_TURNS,
      totalCores: CORE_COUNT,
      remainingCores: CORE_COUNT,
      finishReason: null,
      winner: null,
      message: 'Partida iniciada. Turno del AGENT 1.'
    },
    players: [createPlayer(1, firstPosition), createPlayer(2, secondPosition)],
    board
  };

  return currentGame;
}

export function getGame(): GameState | null {
  return currentGame;
}

function getPlayer(state: GameState, id: PlayerId): Player {
  const player = state.players.find((item) => item.id === id);
  if (!player) {
    throw new Error('Jugador inexistente.');
  }
  return player;
}

function getOpponent(state: GameState, id: PlayerId): Player {
  return getPlayer(state, id === 1 ? 2 : 1);
}

function getCell(state: GameState, position: { x: number; y: number }): Cell | undefined {
  return state.board.cells.find((cell) => cell.x === position.x && cell.y === position.y);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function movePosition(position: { x: number; y: number }, direction: Direction): { x: number; y: number } {
  const next = { ...position };
  if (direction === 'UP') next.y -= 1;
  if (direction === 'DOWN') next.y += 1;
  if (direction === 'LEFT') next.x -= 1;
  if (direction === 'RIGHT') next.x += 1;
  return next;
}

function finishGame(state: GameState, reason: 'HEALTH_ZERO' | 'TURN_LIMIT' | 'ALL_CORES_COLLECTED'): void {
  state.game.status = 'finished';
  state.game.finishReason = reason;

  const p1 = getPlayer(state, 1);
  const p2 = getPlayer(state, 2);
  if (reason === 'HEALTH_ZERO') {
    state.game.winner = p1.health <= 0 ? 2 : 1;
  } else if (p1.score === p2.score) {
    state.game.winner = 'DRAW';
  } else {
    state.game.winner = p1.score > p2.score ? 1 : 2;
  }
}

function describeWinner(state: GameState): string {
  if (state.game.winner === 'DRAW') return 'Empate: ambos terminaron con la misma puntuación.';
  if (state.game.winner === null) return '';
  return `Gana el AGENT ${state.game.winner}.`;
}

function finishIfNeeded(state: GameState): boolean {
  if (state.players.some((player) => player.health <= 0)) {
    finishGame(state, 'HEALTH_ZERO');
    state.game.message = `${describeWinner(state)} La partida terminó porque un agente quedó sin vida.`;
    return true;
  }

  if (state.game.remainingCores === 0) {
    finishGame(state, 'ALL_CORES_COLLECTED');
    state.game.message = `${describeWinner(state)} Se recolectaron todos los Núcleos.`;
    return true;
  }

  return false;
}

function nextTurn(state: GameState): void {
  state.game.currentPlayer = state.game.currentPlayer === 1 ? 2 : 1;
  state.game.turn += 1;

  if (state.game.turn > state.game.maxTurns) {
    finishGame(state, 'TURN_LIMIT');
    state.game.message = `${describeWinner(state)} Se alcanzó el límite de turnos.`;
    return;
  }

  const nextPlayer = getPlayer(state, state.game.currentPlayer);
  nextPlayer.energy = Math.min(MAX_ENERGY, nextPlayer.energy + 2);
  nextPlayer.defending = false;
}

export function applyAction(request: ActionRequest): GameState {
  if (!currentGame) {
    throw new Error('No existe una partida.');
  }

  const state = currentGame;
  if (state.game.status === 'finished') {
    throw new Error('La partida ya terminó.');
  }

  if (request.playerId !== state.game.currentPlayer) {
    throw new Error('No es tu turno.');
  }

  const player = getPlayer(state, request.playerId);
  const opponent = getOpponent(state, request.playerId);
  const cost = ACTION_COSTS[request.action];

  if (player.energy < cost) {
    throw new Error(`Energía insuficiente. ${request.action} necesita ${cost}.`);
  }

  if (request.action === 'MOVE') {
    if (!request.direction) throw new Error('MOVE necesita una dirección.');
    const next = movePosition(player.position, request.direction);
    if (next.x < 0 || next.x >= WIDTH || next.y < 0 || next.y >= HEIGHT) {
      throw new Error('Movimiento inválido: saldrías del tablero.');
    }
    const cell = getCell(state, next);
    if (!cell || cell.obstacle) {
      throw new Error('Movimiento inválido: hay un obstáculo.');
    }
    if (samePosition(next, opponent.position)) {
      throw new Error('Movimiento inválido: esa casilla está ocupada por el rival.');
    }
    player.position = next;
    player.energy -= cost;
    state.game.message = `AGENT ${player.id} se movió ${request.direction}.`;
  }

  if (request.action === 'ATTACK') {
    if (distance(player.position, opponent.position) > 2 || samePosition(player.position, opponent.position)) {
      throw new Error('Ataque inválido: el rival debe estar a distancia Manhattan de 2 o menos.');
    }
    player.energy -= cost;
    const damage = opponent.defending ? 1 : 2;
    opponent.health = Math.max(0, opponent.health - damage);
    opponent.defending = false;
    state.game.message = `AGENT ${player.id} atacó y causó ${damage} de daño.`;
  }

  if (request.action === 'DEFEND') {
    player.energy -= cost;
    player.defending = true;
    state.game.message = `AGENT ${player.id} está defendiendo. El próximo ataque recibido hará menos daño.`;
  }

  if (request.action === 'COLLECT') {
    const cell = getCell(state, player.position);
    if (!cell?.resource) {
      throw new Error('No hay un Núcleo de Energía en esta casilla.');
    }
    player.energy -= cost;
    player.score += 10;
    player.coresCollected += 1;
    player.energy = Math.min(MAX_ENERGY, player.energy + 2);
    cell.resource = false;
    state.game.remainingCores -= 1;
    state.game.message = `AGENT ${player.id} recolectó un Núcleo. +10 puntos.`;
  }

  if (finishIfNeeded(state)) return state;

  nextTurn(state);
  state.game.message += ` Ahora es el turno del AGENT ${state.game.currentPlayer}.`;
  return state;
}

export function getResult() {
  if (!currentGame) return null;
  return {
    status: currentGame.game.status,
    winner: currentGame.game.winner,
    reason: currentGame.game.finishReason,
    players: currentGame.players,
    message: currentGame.game.message
  };
}
