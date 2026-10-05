# Deploy y servidor

## Flujo
`push a main` (o **Publicar** desde /admin) → **Cloudflare Workers Builds** compila y publica (Worker `isef-sanluis`, solo archivos estáticos, config en `wrangler.jsonc`):
1. Build: `npm run check && npm run build` (tipos, lint, contenido, mayúsculas → Vite + SSR + prerender). Si un chequeo falla, **no se publica** y el sitio sigue con la versión anterior.
2. Deploy: `npx wrangler deploy` sube `dist/` al CDN de Cloudflare. Cada deploy queda en el panel del Worker (Deployments: commit, log) y se puede **volver a una versión anterior** desde ahí (Rollback).
3. Las ramas distintas de `main` generan una vista previa (sección *Previews* del Worker) en `*.workers.dev`, con `noindex`.

GitHub Actions (`.github/workflows/deploy.yml`) corre los mismos chequeos en cada push (el panel /admin muestra ese estado) y los lunes dispara un rebuild con el deploy hook (secret `CF_DEPLOY_HOOK`) para actualizar las reglas por fecha.

## Configuración en Cloudflare
- Workers & Pages → Create application → Continue with GitHub → `valedominguezl/isef-main`.
- Build command: `npm run check && npm run build` · Deploy command: `npx wrangler deploy` · Preview command: el que propone el panel (`npx wrangler preview`) · Preview builds activadas. Rama de producción: `main`.
- Node: lo toma de `.nvmrc` (22).
- Dominio: Worker → Settings → Domains & Routes → Custom domain `isefsanluis.net`; `www` → redirección a la raíz con una Redirect Rule de la zona. `campus.isefsanluis.net` sigue apuntando al VPS.
- Rebuild semanal: Worker → Settings → Builds → Deploy Hooks (rama `main`) → guardar la URL como secret `CF_DEPLOY_HOOK` en GitHub.

## Reglas del sitio (en `public/`, se copian a `dist/`)
- `_redirects`: 301 desde las URLs viejas (`/Carrera`, `/Institucional/Contacto`, `/Cookies`, `/TestHiit`, `/cvGatto.pdf`, …, con y sin barra final) y `/admin/*` → panel. Cloudflare ya sirve `/ruta` desde `ruta.html`, redirige `.html` y la barra final, y responde `404.html` con estado 404 (`wrangler.jsonc`).
- `_headers`: cabeceras de seguridad, caché de 1 año para `/assets/*` (con hash) y 1 semana para `/media/*` y `/docs/*`; `noindex` en `*.workers.dev`.

## Estructura de `dist/`
- `index.html`, `carrera.html`, `especializaciones/<slug>.html`, … (una página prerenderizada por URL)
- `admin.html`, `test-hiit.html`, `hijos.htm` (solo cliente), `404.html`
- `sitemap.xml`, `robots.txt`, `search-index.json`, `assets/` (con hash), `media/`, `docs/`

## VPS (Hostinger) — campus y plan B
El VPS (Ubuntu 24.04, `srv1609161.hstgr.cloud`, nginx) aloja el campus Chamilo (`/var/www/chamilo`). Hasta la migración también servía el sitio desde `/var/www/html` (symlink al último de `/var/www/builds/<timestamp>`).

Si hubiera que volver al VPS: [`deploy/nginx/isefsanluis.net.conf`](../deploy/nginx/isefsanluis.net.conf) reproduce las reglas de `_redirects`/`_headers` para nginx (va en `/etc/nginx/sites-available/default`; `nginx -t && systemctl reload nginx`), y el deploy por rsync está en el historial de `deploy.yml`.

## Probar localmente como en producción
```bash
npm run build && npm run preview   # http://localhost:4173 (imita Cloudflare y lee dist/_redirects)
npm run build && npx wrangler dev  # emulador oficial de Cloudflare (redirects + headers exactos)
```
