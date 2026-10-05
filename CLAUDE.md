# I.S.E.F. San Luis — guía rápida para agentes

Sitio del profesorado (isefsanluis.net). React 18 + TS + Vite 6, **prerenderizado** (SSG) y con panel de contenido Git-based. El campus (Chamilo) es otro sistema: no está acá.

## Mapa
- `content/*.json` → TODO el contenido editable (cursos, disertantes, cv, novedades, faq, plan, sitio, inscripciones, aranceles, galería, conferencias); `content/paginas/*.json` → textos y fotos de cada página (vacío = default de `src/content/paginas.ts`). El JSON se lee SIN defaults de zod: campos nuevos con `?? fallback`. Esquemas zod: `src/content/schema.ts`. Acceso tipado: `src/content/index.ts`.
- `src/pages/<ruta>/*Page.tsx` → una página por ruta (lazy). Rutas: `src/app/routes.tsx`. Layout: `src/app/Layout.tsx`.
- `src/components/ui/*` → sistema de diseño (Button, Section, SectionHeader, PageHero, Feature, Accordion, Carousel, Dialog, Reveal…). `src/components/cards/*` tarjetas.
- `src/styles/tokens.scss` ↔ `design/tokens.json` + `design/DESIGN.md` (sistema de diseño; mantener sincronizados).
- `src/features/search` (buscador, índice generado en el build), `consent` (cookies + GA4/GTM), `test-hiit` (protocolo de investigación: **no cambiar su lógica**).
- `src/components/layout/AmbientShapes.tsx` → formas lila de fondo (solo en secciones claras, esquivan tarjetas y botones; reglas en DESIGN.md).
- `src/admin/*` → panel /admin (config declarativa en `admin/config.ts`; storage local en dev / GitHub API en prod). En prod está detrás de Cloudflare Access. Deploy, Access y VPS del campus: `docs/DEPLOY.md`.
- `worker/index.ts` → única función del servidor (Cloudflare, gratis): `/api/fotos` (fotos de dominio público para el panel); el resto del sitio es estático.
- `scripts/` → `prerender.ts` (SSG + sitemap + robots + search-index), `validate-content.ts`, `check-case.mjs`, `health.mjs`, `optimize-images.ts`, `serve-dist.mjs`.

## Reglas
- Contenido nuevo = JSON en `content/` (o desde /admin), nunca hardcodeado en componentes.
- Estilos: CSS Modules + tokens (`var(--…)`); nada de colores/espaciados sueltos. `#7761FF` solo en texto grande; texto chico → `--violet-600`.
- Animaciones: `<Reveal>`/`m.*` de Motion (LazyMotion). No sumar otras librerías de animación.
- Imports con mayúsculas exactas (Linux rompe; `npm run case:check`).
- Antes de terminar: `npm run check` y `npm run build`.

## Comandos
`npm run dev` · `npm run build` · `npm run preview` (imita Cloudflare) · `npm run check` · `npm run health` (→ docs/MAPA.md)

## Mantenimiento
Skill `/mantenimiento` (.claude/skills/mantenimiento). Sugerirla tras ~1M tokens de trabajo, antes de releases grandes o si `docs/MAPA.md` tiene más de 30 días.
