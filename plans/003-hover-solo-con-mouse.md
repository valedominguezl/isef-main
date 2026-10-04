# 003 — Hover con movimiento solo con mouse y feedback al presionar

- **Status**: DONE
- **Commit**: 82c92e9
- **Severity**: MEDIUM
- **Category**: Accessibility / Physicality
- **Estimated scope**: 6 archivos SCSS

## Problem
En pantallas táctiles el tap dispara `:hover` y el estado queda "pegado": el botón queda subido 1 px y las fotos con zoom.

```scss
/* src/components/ui/Button.module.scss — current */
&:hover { color: var(--btn-fg); transform: translateY(-1px); box-shadow: var(--shadow-md); }
&:active { transform: translateY(0) scale(0.98); }
/* src/components/cards/CourseCard.module.scss — current */
&:hover .img { transform: scale(1.06); }
/* también NewsCard (.overlay:hover .media img), SpeakerCard (&:hover .photo img), CarreraPage (.photo:hover img) */
```
Además, la presión usa la misma transición de 250 ms que el hover; la presión debe ser más rápida.

## Target
```scss
@media (hover: hover) and (pointer: fine) {
  .btn:hover { transform: translateY(-1px); }
  .card:hover .img { transform: scale(1.06); }
}
.btn:active { transform: scale(0.97); transition: transform 160ms var(--ease-out); }
```
Y en `tokens.scss` agregar `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` (curva ease-out fuerte para UI).

## Repo conventions to follow
- Los tokens de movimiento viven en `src/styles/tokens.scss` (bloque "Movimiento").
- Ejemplo correcto ya existente: el mixin `card-hover` en `src/styles/_mixins.scss` ya está dentro de `@media (hover: hover)`.

## Steps
1. `tokens.scss`: agregar `--ease-out`.
2. `Button.module.scss`: mover `transform` del `:hover` (y el desplazamiento del ícono) a `@media (hover: hover) and (pointer: fine)`; `:active` → `transform: scale(0.97)` con `transition: transform 160ms var(--ease-out)`.
3. `CourseCard`, `NewsCard`, `SpeakerCard`, `CarreraPage`: envolver los zoom de imagen en `@media (hover: hover) and (pointer: fine)`.

## Boundaries
- Los cambios de color en hover se mantienen sin condición (no mueven nada).

## Verification
- **Mechanical**: `npm run build` OK.
- **Feel check**: con emulación táctil (DevTools → dispositivo móvil) tocar una tarjeta y volver: la foto no queda agrandada. Con mouse el zoom sigue igual. Apretar un botón: se hunde levemente y vuelve en 160 ms.
- **Done when**: ningún `:hover` con `transform` queda fuera de un media query `hover: hover`.
