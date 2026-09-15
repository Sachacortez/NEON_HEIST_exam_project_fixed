# Decisiones técnicas

## Arquitectura

Se utiliza una arquitectura sencilla de tres partes lógicas:

1. React muestra el juego y recibe las interacciones.
2. `api.ts` centraliza las llamadas `fetch()`.
3. Express mantiene el estado actual y valida las reglas.

No se utiliza base de datos porque el examen no exige persistencia y una partida vive en memoria durante la ejecución del servidor.

## React

React facilita separar la pantalla en componentes comprensibles: tarjeta de jugador, tablero y aplicación principal.

## Express

Express recibe las acciones y mantiene la autoridad sobre las reglas. Esto evita que el navegador pueda decidir por sí solo que un ataque es válido o que una acción cuesta menos energía.

## fetch

Se usa `fetch()` nativo porque es un requisito del examen y es suficiente para cuatro endpoints simples.

## Estado crítico en backend

El servidor decide turno, energía, movimiento, daño, defensa, recursos y finalización. React solo representa el estado que recibe.

## Diseño

Se eligió una cuadrícula 11x9, 12 obstáculos y 8 Núcleos para mantener una partida suficientemente variada sin hacer la lógica difícil de defender oralmente.

## Deployment

En producción Express sirve el contenido de `dist`, por lo que frontend y backend quedan bajo el mismo dominio y puerto. El puerto se obtiene de `process.env.PORT`.
