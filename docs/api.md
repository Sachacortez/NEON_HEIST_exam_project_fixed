# API REST

Todas las respuestas de la API son JSON.

## GET /api/game

Obtiene la partida actual.

Respuesta aproximada:

```json
{
  "game": {},
  "players": [],
  "board": {}
}
```

Si no existe una partida, responde `404`.

## POST /api/game

Crea una partida nueva.

No necesita body.

Responde `201` con el estado completo.

## POST /api/game/action

Ejecuta una acción validada por el servidor.

Entrada:

```json
{
  "playerId": 1,
  "action": "MOVE",
  "direction": "UP"
}
```

Para `ATTACK`, `DEFEND` y `COLLECT` no hace falta `direction`.

Respuesta: estado completo actualizado.

Ejemplo de error:

```json
{
  "error": "No es tu turno."
}
```

Los errores de validación responden `400`.

## GET /api/game/result

Devuelve el estado de finalización y las puntuaciones.

## GET /api/health

Endpoint sencillo para comprobar que Express está activo.
