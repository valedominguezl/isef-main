# 001 — Abrir el buscador sin animación

- **Status**: DONE
- **Commit**: 82c92e9
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 1 archivo, ~15 líneas

## Problem
El buscador es una paleta que se abre con teclado (`/` o Ctrl/Cmd+K, `src/features/search/SearchContext.tsx`). Hoy anima 250 ms el fondo y 400 ms el panel, retrasando el momento en que la persona empieza a escribir. Una acción de teclado de alta frecuencia no debe animar (referencia: Raycast).

```tsx
/* src/features/search/SearchOverlay.tsx:98-118 — current */
<m.div className={styles.overlay} ... initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
  <m.div className={styles.panel} initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
```

## Target
Apertura y cierre instantáneos: `div` comunes, sin `AnimatePresence`, renderizando solo si `open`.

## Repo conventions to follow
- Los overlays usan CSS Modules (`SearchOverlay.module.scss`); no se agregan tokens nuevos.

## Steps
1. En `SearchOverlay.tsx`, reemplazar `<AnimatePresence>{open && (<m.div …>` por `{open && (<div …>` y el panel `m.div` por `div`, quitando `initial`, `animate`, `exit` y `transition`.
2. Quitar `AnimatePresence, m` del import de `motion/react` (si queda vacío, borrar el import).

## Boundaries
- No tocar la lógica de búsqueda, el teclado ni los estilos.
- Si el código no coincide con el extracto, DETENERSE e informar.

## Verification
- **Mechanical**: `npm run typecheck && npm run lint` sin errores.
- **Feel check**: en `npm run dev`, apretar `/`: el panel aparece en el mismo frame y el cursor ya está en el input; `Esc` lo cierra al instante.
- **Done when**: no queda ningún `m.` ni `AnimatePresence` en `SearchOverlay.tsx`.
