# I.S.E.F. San Luis — sitio web

Sitio del Instituto Superior de Educación Física San Luis (<https://isefsanluis.net>).
React 18 + TypeScript + Vite, **prerenderizado** (cada página es HTML estático, ideal para SEO) y con **panel de contenido** en `/admin`.
El campus virtual (Chamilo) es un sistema aparte.

## Empezar
Requisitos: **Node 20+** (recomendado 22 LTS) y Git.

```bash
npm ci            # instala dependencias (y activa el hook pre-push)
npm run dev       # http://localhost:5173 — el panel /admin escribe directo en tu disco
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo con recarga en vivo |
| `npm run build` | Valida contenido → build → prerender (sitemap, robots, índice del buscador) |
| `npm run preview` | Sirve `dist/` igual que el servidor de producción |
| `npm run check` | Tipos + lint + contenido + mayúsculas en imports (lo mismo que corre CI) |
| `npm run health` | Diagnóstico del proyecto → `docs/MAPA.md` |
| `npm run images` | Optimiza imágenes cargadas a mano |

## Estructura
```
content/            Contenido editable (JSON validado con zod) ← lo edita el panel
public/media|docs   Imágenes y descargables del contenido
src/
  app/              Router, layout
  pages/            Una carpeta por página
  components/ui     Sistema de diseño (Button, Section, PageHero, Accordion, Carousel…)
  components/cards  Tarjetas de curso, novedad y disertante
  features/         search · consent · test-hiit
  admin/            Panel de administración
  content/          Esquemas y acceso tipado al contenido
  styles/           Tokens y estilos globales
scripts/            prerender, validación, health, imágenes, preview
design/             Sistema de diseño (DESIGN.md + tokens.json)
docs/               AUDIT, ADMIN (guía del panel), DEPLOY, MAPA
```

## Publicar
Todo push a `main` (o "Publicar" en el panel) despliega solo: ver [docs/DEPLOY.md](docs/DEPLOY.md).

## Trabajar desde Windows (sin WSL)
El proyecto es multiplataforma. Los errores que antes solo aparecían en producción eran por mayúsculas en los imports (Windows no las distingue, Linux sí): ahora `npm run check` y el hook `pre-push` los detectan antes de subir.

1. Instalá [Node 22 LTS](https://nodejs.org) y [Git for Windows](https://git-scm.com).
2. `git clone git@github.com:valedominguezl/isef-main.git C:\proyectos\isef-main`
3. `cd C:\proyectos\isef-main && npm ci && npm run dev`

No copies `node_modules` desde WSL: algunas dependencias (sharp, esbuild) tienen binarios distintos por sistema operativo.

## Documentación
- [Guía del panel para editores](docs/ADMIN.md)
- [Sistema de diseño](design/DESIGN.md)
- [Auditoría y decisiones](docs/AUDIT.md)
- [Deploy y servidor](docs/DEPLOY.md)
