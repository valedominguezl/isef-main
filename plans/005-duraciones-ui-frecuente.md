# 005 — Duraciones de UI frecuente por debajo de 300 ms

- **Status**: DONE
- **Commit**: 82c92e9
- **Severity**: MEDIUM
- **Category**: Easing & duration / Performance
- **Estimated scope**: 4 archivos

## Problem
- `src/components/layout/Navbar.module.scss:9`: el navbar se oculta/muestra en cada cambio de dirección de scroll con `transform var(--duration-slow)` (450 ms).
- `src/components/ui/Accordion.tsx:66`: `transition={{ duration: 0.35 … }}`; chevron en `Accordion.module.scss:56` con `--duration-slow` (450 ms).
- `src/components/ui/Carousel.module.scss:75`: punto activo con `--duration-slow`.
- `src/pages/especializaciones/EspecializacionesPage.module.scss:71`: `transition: all var(--duration-base);` en los chips de filtro.

## Target
- Navbar: `transform 250ms var(--ease-out)` (ease-out fuerte `cubic-bezier(0.23, 1, 0.32, 1)`).
- Acordeón: `duration: 0.25`, misma curva `[0.2, 0.7, 0.2, 1]`; chevron `transform 300ms var(--ease-emphasized)`.
- Punto del carrusel: `clip-path 300ms var(--ease-emphasized)`.
- Chips: `transition: background-color var(--duration-base), border-color var(--duration-base), color var(--duration-base);`

## Repo conventions to follow
- Duraciones como tokens; `--ease-out` agregado en el plan 003 (si 003 no se ejecutó, agregarlo en `tokens.scss`).

## Steps
1. Aplicar cada línea del Target en su archivo.

## Verification
- **Mechanical**: `grep -rn "transition: all" src` no devuelve nada (excepto `src/features/test-hiit`, fuera de alcance).
- **Feel check**: scrollear arriba/abajo rápido: el navbar responde sin sentirse "pesado"; abrir y cerrar preguntas frecuentes rápido: el chevron no se atrasa.
