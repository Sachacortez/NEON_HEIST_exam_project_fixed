# Reglas del juego

## Inicio

Cada partida crea dos agentes, obstáculos y 8 Núcleos en posiciones aleatorias válidas.

## Turnos

Comienza AGENT 1. Cada acción válida consume el turno. Al comenzar el siguiente turno del jugador, recibe hasta 2 puntos de energía adicionales, sin superar 8.

## Movimiento

- Arriba, abajo, izquierda y derecha.
- Coste: 1 energía.
- No se puede salir del tablero, atravesar obstáculos ni ocupar la casilla del rival.

## Ataque

- Coste: 3 energía.
- El rival debe estar a distancia Manhattan de 2 o menos.
- Un ataque normal causa 2 de daño.
- Si el rival está defendiendo, recibe 1 de daño y su defensa se consume.

## Defensa

- Coste: 2 energía.
- Activa el estado `defending`.
- El siguiente ataque recibido hace 1 daño en lugar de 2.
- Defender también termina el turno.

## Recolección

- Coste base: 1 energía.
- Solo es válida si el jugador está sobre un Núcleo.
- El Núcleo desaparece.
- Se suman 10 puntos y 1 Núcleo recolectado.
- Se recuperan 2 puntos de energía, sin superar 8.

## Puntuación

Cada Núcleo vale 10 puntos.

## Victoria

La partida termina cuando:

1. Un jugador llega a 0 de vida. El otro gana.
2. Se recolectan todos los Núcleos. Gana quien tenga más puntos.
3. Se supera el turno 40. Gana quien tenga más puntos.

Si la puntuación es igual en una finalización por recursos o turnos, hay empate.

## Acciones inválidas

El servidor rechaza acciones si no corresponden al jugador actual, la partida terminó, falta energía o no se cumple la regla específica de la acción. El cliente muestra el error recibido.
