# 002 — Reveal y menú con transform completo (acelerado por GPU)

- **Status**: DONE
- **Commit**: 82c92e9
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 2 archivos, ~10 líneas

## Problem
Los atajos `y` de Motion no se aceleran por hardware: corren en el hilo principal y pierden frames con carga. `Reveal` se usa en casi todas las secciones y se dispara durante el scroll.

```tsx
/* src/components/ui/Reveal.tsx:21-24 — current */
initial={{ opacity: 0, y }}
whileInView={{ opacity: 1, y: 0 }}
/* src/components/ui/Reveal.tsx:54 — current */
variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
/* src/components/layout/Navbar.tsx:132 — current */
<m.li key={item.to} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
```

## Target
```tsx
initial={{ opacity: 0, transform: `translateY(${y}px)` }}
whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
// RevealItem
hidden: { opacity: 0, transform: 'translateY(24px)' }, show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.6, ease } }
// Navbar
hidden: { opacity: 0, transform: 'translateY(20px)' }, show: { opacity: 1, transform: 'translateY(0px)' }
```

## Repo conventions to follow
- Curva existente `ease = [0.16, 1, 0.3, 1]` en `Reveal.tsx` (equivale a `--ease-emphasized`). No cambiarla.

## Steps
1. `Reveal.tsx`: aplicar el Target en `Reveal` y `RevealItem`.
2. `Navbar.tsx`: aplicar el Target en los `m.li` del menú móvil.

## Boundaries
- No cambiar duraciones, curvas ni markup.

## Verification
- **Mechanical**: `npm run typecheck && npm run build` OK; el HTML prerenderizado contiene `transform:translateY(24px)` en el estado inicial.
- **Feel check**: scrollear el inicio; las secciones suben 24 px y aparecen igual que antes. En DevTools → Rendering → "Paint flashing" no deben repintarse durante el reveal.
- **Done when**: no queda `y:` como propiedad de animación en esos archivos.
