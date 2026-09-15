export type PlayerId = 1 | 2;
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type ActionType = 'MOVE' | 'ATTACK' | 'DEFEND' | 'COLLECT';
export type GameStatus = 'playing' | 'finished';
export type FinishReason = 'HEALTH_ZERO' | 'TURN_LIMIT' | 'ALL_CORES_COLLECTED' | null;

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: PlayerId;
  name: string;
  position: Position;
  health: number;
  energy: number;
  score: number;
  coresCollected: number;
  defending: boolean;
}

export interface Cell {
  x: number;
  y: number;
  obstacle: boolean;
  resource: boolean;
}

export interface Board {
  width: number;
  height: number;
  cells: Cell[];
}

export interface Game {
  id: string;
  status: GameStatus;
  currentPlayer: PlayerId;
  turn: number;
  maxTurns: number;
  totalCores: number;
  remainingCores: number;
  finishReason: FinishReason;
  winner: PlayerId | 'DRAW' | null;
  message: string;
}

export interface GameState {
  game: Game;
  players: Player[];
  board: Board;
}

export interface ActionRequest {
  playerId: PlayerId;
  action: ActionType;
  direction?: Direction;
}

export interface ApiError {
  error: string;
}

export interface GameResponse {
  game: Game;
  players: Player[];
  board: Board;
  message?: string;
}

export interface ResultResponse {
  status: GameStatus;
  winner: PlayerId | 'DRAW' | null;
  reason: FinishReason;
  players: Player[];
  message: string;
}
