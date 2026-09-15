# Introducción

## NEON HEIST

NEON HEIST es un juego competitivo para dos jugadores. Dos agentes se desplazan por una ciudad futurista representada como una cuadrícula, recolectan Núcleos de Energía y pueden atacar o defenderse.

El objetivo es terminar con más puntos. Cada acción válida consume el turno actual y el control pasa al otro agente.

## Experiencia de juego

La partida mezcla movimiento, administración de energía, posicionamiento y riesgo. Recolectar un Núcleo da puntos, pero acercarse al rival permite atacar. Defenderse protege de un ataque posterior, aunque consume energía y cede el turno.

## Tecnologías

- React + TypeScript para la interfaz.
- Express + TypeScript para la lógica del juego y API REST.
- `fetch()` nativo para la comunicación.
- CSS propio para la interfaz.
- Playwright para pruebas E2E.
- GitHub Actions para lint, E2E y deployment.
