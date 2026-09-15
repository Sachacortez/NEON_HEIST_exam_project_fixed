import { useEffect, useMemo, useState } from 'react';
import { createGame, getGame, getResult, sendAction } from './api';
import type { ActionRequest, Direction, GameState, Player, PlayerId } from '../shared/types';

const directions: { value: Direction; label: string }[] = [
  { value: 'UP', label: '↑' },
  { value: 'LEFT', label: '←' },
  { value: 'DOWN', label: '↓' },
  { value: 'RIGHT', label: '→' }
];

const finishReasons = {
  HEALTH_ZERO: 'Un agente quedó sin vida.',
  TURN_LIMIT: 'Se alcanzó el límite de turnos.',
  ALL_CORES_COLLECTED: 'Se recolectaron todos los Núcleos.'
};

function PlayerCard({ player, active }: { player: Player; active: boolean }) {
  return (
    <section className={`player-card player-${player.id} ${active ? 'active' : ''}`} data-testid={`player-${player.id}`}>
      <div className="player-heading">
        <span className="agent-dot" />
        <h2>{player.name}</h2>
        {active && <span className="turn-badge">TURNO</span>}
      </div>
      <div className="stat-row"><span>VIDA</span><strong>{player.health}/10</strong></div>
      <div className="meter"><span style={{ width: `${player.health * 10}%` }} /></div>
      <div className="stat-row"><span>ENERGÍA</span><strong>{player.energy}/8</strong></div>
      <div className="meter energy"><span style={{ width: `${player.energy * 12.5}%` }} /></div>
      <div className="mini-stats">
        <div><span>PUNTOS</span><strong>{player.score}</strong></div>
        <div><span>NÚCLEOS</span><strong>{player.coresCollected}</strong></div>
        <div><span>ESTADO</span><strong>{player.defending ? 'DEFENDIENDO' : 'NORMAL'}</strong></div>
      </div>
    </section>
  );
}

function Board({ state }: { state: GameState }) {
  const playerAt = useMemo(() => {
    const map = new Map<string, PlayerId>();
    state.players.forEach((player) => map.set(`${player.position.x},${player.position.y}`, player.id));
    return map;
  }, [state.players]);

  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${state.board.width}, 1fr)` }} data-testid="board">
      {state.board.cells.map((cell) => {
        const occupant = playerAt.get(`${cell.x},${cell.y}`);
        return (
          <div
            className={`cell ${cell.obstacle ? 'obstacle' : ''} ${cell.resource ? 'resource' : ''}`}
            key={`${cell.x}-${cell.y}`}
          >
            {occupant && <span className={`agent agent-${occupant}`}>{occupant}</span>}
            {cell.resource && !occupant && <span className="core">◆</span>}
            {cell.obstacle && <span className="block">▪</span>}
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerId>(1);
  const [message, setMessage] = useState('Conectando con el servidor...');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getGame()
      .then((game) => {
        setState(game);
        setSelectedPlayer(game.game.currentPlayer);
        setMessage(game.game.message);
      })
      .catch(() => {
        setMessage('No hay partida activa. Crea una nueva para comenzar.');
      });
  }, []);

  const selectedPlayerData = state?.players.find((player) => player.id === selectedPlayer);
  const opponent = state?.players.find((player) => player.id !== selectedPlayer);

  async function newGame() {
    setLoading(true);
    setError('');
    try {
      const game = await createGame();
      setState(game);
      setSelectedPlayer(game.game.currentPlayer);
      setMessage(game.game.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo crear la partida.');
    } finally {
      setLoading(false);
    }
  }

  async function action(action: ActionRequest['action'], direction?: Direction) {
    if (!state) return;
    setLoading(true);
    setError('');
    try {
      const game = await sendAction({ playerId: selectedPlayer, action, direction });
      setState(game);
      setSelectedPlayer(game.game.currentPlayer);
      setMessage(game.game.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Acción rechazada.');
    } finally {
      setLoading(false);
    }
  }

  async function showResult() {
    try {
      const result = await getResult();
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo consultar el resultado.');
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!state || loading || state.game.status === 'finished' || selectedPlayer !== state.game.currentPlayer) return;
      const keys: Record<string, Direction> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT' };
      const direction = keys[event.key];
      if (direction) {
        event.preventDefault();
        void action('MOVE', direction);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state, loading, selectedPlayer]);

  if (!state) {
    return (
      <main className="app-shell empty-state">
        <div className="boot-card">
          <p className="eyebrow">NEON HEIST // TWO-PLAYER PROTOCOL</p>
          <h1>Ciudad sin luz. <span>Dos agentes.</span></h1>
          <p>{message}</p>
          <button className="primary-button" onClick={newGame} disabled={loading}>INICIAR HEIST</button>
          {error && <p className="error">{error}</p>}
        </div>
      </main>
    );
  }

  const isMyTurn = state.game.currentPlayer === selectedPlayer && state.game.status === 'playing';
  const selectedOnCore = state.board.cells.some(
    (cell) => cell.resource && cell.x === selectedPlayerData?.position.x && cell.y === selectedPlayerData?.position.y
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">NEON HEIST // CITY GRID</p>
          <h1>STEAL THE <span>CORE</span></h1>
        </div>
        <div className="game-status" data-testid="game-status">
          <span className={`status-dot ${state.game.status}`} />
          {state.game.status === 'playing' ? `TURNO ${state.game.turn}/${state.game.maxTurns}` : 'PARTIDA TERMINADA'}
        </div>
      </header>

      <section className="game-layout">
        <aside className="side-panel left-panel">
          <div className="panel-title">OPERADORES</div>
          <PlayerCard player={state.players[0]} active={state.game.currentPlayer === 1} />
          <PlayerCard player={state.players[1]} active={state.game.currentPlayer === 2} />
          <div className="legend">
            <span><i className="legend-core">◆</i> Núcleo</span>
            <span><i className="legend-block">▪</i> Obstáculo</span>
          </div>
        </aside>

        <section className="center-panel">
          <div className="turn-banner">
            <div><small>CONTROL ACTUAL</small><strong>AGENT {state.game.currentPlayer}</strong></div>
            <div><small>NÚCLEOS RESTANTES</small><strong>{state.game.remainingCores}/{state.game.totalCores}</strong></div>
          </div>
          <Board state={state} />
          <div className="message-box" data-testid="message">
            <span className="message-icon">&gt;_</span>
            <span>{error || message}</span>
          </div>
        </section>

        <aside className="side-panel right-panel">
          <div className="panel-title">CONTROLES</div>
          <div className="player-switch">
            <span>JUGANDO COMO</span>
            <div>
              <button className={selectedPlayer === 1 ? 'selected p1' : ''} onClick={() => setSelectedPlayer(1)}>AGENT 1</button>
              <button className={selectedPlayer === 2 ? 'selected p2' : ''} onClick={() => setSelectedPlayer(2)}>AGENT 2</button>
            </div>
          </div>
          <div className="control-status">{isMyTurn ? 'TU TURNO' : `TURNO DE AGENT ${state.game.currentPlayer}`}</div>
          <div className="direction-pad">
            <button onClick={() => void action('MOVE', 'UP')} disabled={!isMyTurn || loading}>{directions[0].label}</button>
            <button onClick={() => void action('MOVE', 'LEFT')} disabled={!isMyTurn || loading}>{directions[1].label}</button>
            <button onClick={() => void action('MOVE', 'DOWN')} disabled={!isMyTurn || loading}>{directions[2].label}</button>
            <button onClick={() => void action('MOVE', 'RIGHT')} disabled={!isMyTurn || loading}>{directions[3].label}</button>
          </div>
          <p className="hint">Flechas o W A S D para moverte.</p>

          <div className="action-list">
            <button onClick={() => void action('ATTACK')} disabled={!isMyTurn || loading}>⚡ ATACAR <span>-3 ENE</span></button>
            <button onClick={() => void action('DEFEND')} disabled={!isMyTurn || loading}>◈ DEFENDER <span>-2 ENE</span></button>
            <button onClick={() => void action('COLLECT')} disabled={!isMyTurn || loading || !selectedOnCore}>◆ RECOLECTAR <span>-1 ENE</span></button>
          </div>

          <div className="rules-card">
            <strong>OBJETIVO</strong>
            <p>Consigue la mayor puntuación recolectando Núcleos. Ataca cuando estés a distancia 2 o menos y usa DEFENDER para reducir el siguiente daño recibido.</p>
          </div>
          <button className="secondary-button" onClick={showResult}>CONSULTAR RESULTADO</button>
          <button className="primary-button" onClick={newGame} disabled={loading}>NUEVA PARTIDA</button>
        </aside>
      </section>

      {state.game.status === 'finished' && (
        <div className="result-overlay">
          <div className="result-card" data-testid="result-card">
            <p className="eyebrow">HEIST COMPLETE</p>
            <h2>{state.game.winner === 'DRAW' ? 'EMPATE' : `AGENT ${state.game.winner} GANA`}</h2>
            <p>{state.game.finishReason ? finishReasons[state.game.finishReason] : 'Partida finalizada.'}</p>
            <div className="final-scores">
              {state.players.map((player) => <div key={player.id}><span>AGENT {player.id}</span><strong>{player.score}</strong></div>)}
            </div>
            <button className="primary-button" onClick={newGame}>NUEVA PARTIDA</button>
          </div>
        </div>
      )}

      <footer>
        <span>SERVER AUTHORITY: ONLINE</span>
        <span>SELECTED: AGENT {selectedPlayer}</span>
        <span>{opponent ? `RIVAL: AGENT ${opponent.id}` : ''}</span>
      </footer>
    </main>
  );
}

export default App;
