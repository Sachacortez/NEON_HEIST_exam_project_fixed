# NEON HEIST

Juego web competitivo para dos jugadores desarrollado para el examen de la materia **CERTIFICACIÓN**.

## Descripción

Dos agentes compiten en una pequeña ciudad futurista representada por una cuadrícula. Deben recolectar Núcleos de Energía para obtener puntos y pueden atacar o defenderse. La partida se desarrolla por turnos y el backend valida las reglas principales.

**Producción:** `<PENDIENTE: agregar URL real de Render después del deployment>`

## Tecnologías

- React
- TypeScript
- Express
- REST + JSON
- `fetch()` nativo
- Vite
- CSS propio
- Playwright
- GitHub Actions

No se utilizan React Router, Redux, Axios, Bootstrap, Tailwind ni motores de juego.

## Requisitos

- Node.js 22 o superior.
- npm.

## Instalación

```bash
npm install
```

## Ejecución local

Para ejecutar frontend y backend juntos en desarrollo:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Las peticiones `/api` del frontend se redirigen al backend mediante Vite.

Para una ejecución equivalente a producción:

```bash
npm run build
npm start
```

Express sirve el frontend compilado desde `dist`, por lo que en producción frontend y backend usan el mismo dominio y puerto.

## Cómo se juega

1. Crear una partida.
2. Elegir AGENT 1 o AGENT 2 en el selector. El botón de acción solo funciona cuando ese agente tiene el turno.
3. Moverse con las flechas o `W A S D`.
4. Recolectar un Núcleo cuando el agente esté sobre él.
5. Atacar cuando el rival esté a distancia Manhattan de 2 o menos.
6. Defenderse para reducir el siguiente ataque recibido.
7. Administrar la energía.

## Reglas rápidas

| Acción | Coste | Regla |
|---|---:|---|
| MOVE | 1 | Una casilla cardinal válida |
| ATTACK | 3 | Rival a distancia <= 2, causa 2 daño |
| DEFEND | 2 | Reduce el siguiente daño de 2 a 1 |
| COLLECT | 1 | Solo sobre un Núcleo, +10 puntos |

Cada jugador recibe hasta 2 de energía al comenzar su siguiente turno, con máximo 8.

La partida termina por vida en 0, por recolectar todos los Núcleos o al superar el límite de 40 turnos. En finalizaciones por puntuación, el empate es posible.

## Estructura

```text
NEON-HEIST/
├── .github/
│   └── workflows/
│       ├── lint.yml
│       ├── e2e.yml
│       └── deploy.yml
├── docs/
│   ├── introduccion.md
│   ├── reglas.md
│   ├── api.md
│   ├── decisiones.md
│   ├── investigacion.md
│   └── ia.md
├── public/
├── scripts/
│   └── dev.mjs
├── src/
│   ├── client/
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── server/
│   │   ├── game.ts
│   │   └── index.ts
│   └── shared/
│       └── types.ts
├── tests/
│   └── neon-heist.spec.ts
├── index.html
├── package.json
├── playwright.config.ts
├── render.yaml
├── tsconfig.json
├── tsconfig.client.json
├── tsconfig.server.json
└── vite.config.ts
```

## API

### GET `/api/game`

Obtiene el estado actual.

### POST `/api/game`

Crea una nueva partida.

### POST `/api/game/action`

Ejecuta una acción. Ejemplo:

```json
{
  "playerId": 1,
  "action": "MOVE",
  "direction": "UP"
}
```

### GET `/api/game/result`

Obtiene el resultado de la partida actual.

### GET `/api/health`

Comprueba que Express esté funcionando.

Para detalles, ver [`docs/api.md`](docs/api.md).

## Scripts npm

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
npm test
npm run test:ui
```

## TypeScript

Comprobar cliente:

```bash
npx tsc -p tsconfig.client.json
```

Comprobar/compilar servidor:

```bash
npm run build:server
```

## Playwright

Pruebas headless:

```bash
npx playwright install chromium
npm test
```

Pruebas visuales en Chrome:

```bash
npm run test:ui
```

Las pruebas cubren inicio, creación de partida, tablero, dos jugadores, movimiento, una validación de interacción, consulta del resultado y finalización por límite de turnos.

## GitHub Actions

- `lint.yml`: TypeScript + ESLint.
- `e2e.yml`: instala Chromium y ejecuta Playwright headless.
- `deploy.yml`: construye el proyecto y dispara el Render Deploy Hook si existe el secreto `RENDER_DEPLOY_HOOK_URL`.

## Deployment en Render

1. Crear un Web Service desde el repositorio de GitHub.
2. Usar Node.js.
3. Build Command:

```bash
npm install && npm run build
```

4. Start Command:

```bash
npm start
```

5. No fijar manualmente el puerto. Express utiliza `process.env.PORT`.
6. Render asignará el dominio público.
7. Para permitir que GitHub Actions dispare nuevos deployments, crear un Deploy Hook en Render y guardarlo en GitHub como secreto `RENDER_DEPLOY_HOOK_URL`.

El archivo `render.yaml` contiene la configuración equivalente.

## Variables de entorno

No hay variables obligatorias para ejecutar el juego. `PORT` es proporcionada por el servicio de deployment. `RENDER_DEPLOY_HOOK_URL` es necesaria solamente si se quiere que el workflow de GitHub Actions dispare Render automáticamente.

## Arquitectura

```text
Navegador
   │
   │ fetch() + JSON
   ▼
Express REST API
   │
   │ valida reglas y modifica estado
   ▼
Estado de partida en memoria

Producción:
Express ── sirve ──> dist/ (React compilado)
```

El backend es la autoridad sobre turno, movimiento, energía, ataque, defensa, recursos y finalización.

## IA

El desarrollo puede recibir asistencia de IA, pero el estudiante debe revisar y comprender el código antes de la defensa. Ver [`docs/ia.md`](docs/ia.md).

## Nota sobre pruebas

No se inventan resultados de ejecución en la documentación. Antes de presentar el proyecto, ejecutar `npm run lint`, `npm run build` y `npm test`, revisar los resultados y corregir cualquier problema encontrado.
