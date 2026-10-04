# Planes de animación

Generados con la skill `improve-animations` (filosofía de Emil Kowalski). Cada plan es autocontenido.

| # | Plan | Severidad | Estado |
|---|---|---|---|
| 001 | [Abrir el buscador sin animación](001-buscador-sin-animacion.md) | HIGH | DONE |
| 002 | [Reveal y menú con transform completo](002-reveal-transform-string.md) | HIGH | DONE |
| 003 | [Hover solo con mouse + feedback al presionar](003-hover-solo-con-mouse.md) | MEDIUM | DONE |
| 004 | [Reducir movimiento sin apagar el feedback](004-reducir-movimiento-sin-anular.md) | MEDIUM | DONE |
| 005 | [Duraciones de UI frecuente < 300 ms](005-duraciones-ui-frecuente.md) | MEDIUM | DONE |

**Orden recomendado:** 001 → 002 → 003 → 004 → 005. 004 depende de los media queries de 003; 005 usa el token `--ease-out` que agrega 003.

**Oportunidades (implementadas fuera de plan):** crossfade de 200 ms con `blur(2px)` al cambiar de foto en el lightbox de la galería; entrada escalonada (30–50 ms, solo opacidad) de la grilla de cursos al filtrar.
