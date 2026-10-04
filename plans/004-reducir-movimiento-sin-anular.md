# 004 — "Reducir movimiento" sin apagar todo el feedback

- **Status**: DONE
- **Commit**: 82c92e9
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 archivos

## Problem
Con `prefers-reduced-motion: reduce` todas las duraciones van a 0 ms, por lo que también desaparecen los fundidos de color y opacidad que ayudan a entender los cambios de estado.

```scss
/* src/styles/tokens.scss:152 — current */
@media (prefers-reduced-motion: reduce) {
  :root { --duration-fast: 0ms; --duration-base: 0ms; --duration-slow: 0ms; --duration-reveal: 0ms; }
}
```

## Target
Mantener duraciones cortas para color/opacidad y eliminar solo los desplazamientos:
```scss
@media (prefers-reduced-motion: reduce) {
  :root { --duration-slow: var(--duration-base); --duration-reveal: 0ms; }
}
```
y, en `src/styles/_mixins.scss`, el `card-hover` solo traslada con `(prefers-reduced-motion: no-preference)`. Los zoom de imagen y el `translateY` del botón quedan detrás de la misma condición.

## Repo conventions to follow
- Motion ya respeta la preferencia con `<MotionConfig reducedMotion="user">` (`src/app/Layout.tsx`): conserva opacidad y quita transforms. No tocarlo.

## Steps
1. Reemplazar el bloque de `tokens.scss` por el Target.
2. En `_mixins.scss`, envolver el `transform: translateY(-4px)` del `card-hover` en `@media (prefers-reduced-motion: no-preference)`.
3. En los media queries de hover del plan 003, combinar `and (prefers-reduced-motion: no-preference)` para los zoom y desplazamientos.

## Verification
- **Feel check**: DevTools → Rendering → "Emulate prefers-reduced-motion: reduce". Las tarjetas ya no suben ni hacen zoom, pero los colores de hover siguen con fundido; el acordeón abre sin deslizar contenido largo.
- **Done when**: con reduce no hay ninguna transformación animada salvo las de Motion convertidas en fundido.
