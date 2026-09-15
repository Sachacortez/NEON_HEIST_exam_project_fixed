import type { ActionRequest, GameState, ResultResponse } from '../shared/types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const data: unknown = await response.json().catch(() => null);
  if (data === null || typeof data !== 'object') {
    throw new Error('Respuesta inválida del servidor.');
  }

  if (!response.ok) {
    if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
      throw new Error(data.error);
    }
    throw new Error(`Error HTTP ${response.status}.`);
  }

  return data as T;
}

export function getGame(): Promise<GameState> {
  return request<GameState>('/api/game');
}

export function createGame(): Promise<GameState> {
  return request<GameState>('/api/game', { method: 'POST' });
}

export function sendAction(action: ActionRequest): Promise<GameState> {
  return request<GameState>('/api/game/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action)
  });
}

export function getResult(): Promise<ResultResponse> {
  return request<ResultResponse>('/api/game/result');
}
