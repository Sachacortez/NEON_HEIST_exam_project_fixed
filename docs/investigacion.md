# Investigación y ejecución

## Playwright

Playwright ejecuta pruebas E2E reales sobre Chromium. Las pruebas abren la aplicación, crean partidas, interactúan con controles y verifican respuestas visibles.

## Ejecución local

```bash
npm install
npm run dev
```

La interfaz de desarrollo usa Vite en `http://localhost:5173` y Express en `http://localhost:3000`. Vite redirige `/api` al backend.

## GitHub Actions

- `lint.yml` ejecuta ESLint.
- `e2e.yml` instala Chromium y ejecuta Playwright en modo headless.
- `deploy.yml` construye el proyecto y está preparado para publicar mediante Render Deploy Hook.

## Deployment

La aplicación compilada es servida por Express. Render debe ejecutar:

```bash
npm install
npm run build
npm start
```

El servidor utiliza `process.env.PORT`.

## Variables de entorno

Para el funcionamiento básico no hay variables obligatorias. Para el workflow de deployment se utiliza el secreto opcional `RENDER_DEPLOY_HOOK_URL`.

## Limitaciones

El estado de la partida se guarda en memoria. Reiniciar el proceso del servidor elimina la partida actual. Para el alcance del examen esto es intencional y evita agregar una base de datos innecesaria.

## Nota de pruebas

Este documento no declara resultados de ejecución como hechos históricos. Los comandos deben ejecutarse en el entorno del estudiante antes de la defensa y los resultados reales deben comprobarse allí.
