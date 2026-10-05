# Deploy y servidor

## Flujo
`push a main` (o **Publicar** desde /admin) → **Cloudflare Pages** compila y publica:
1. Build: `npm run check && npm run build` (tipos, lint, contenido, mayúsculas → Vite + SSR + prerender). Si un chequeo falla, **no se publica** y el sitio sigue con la versión anterior.
2. Pages sirve `dist/` desde su CDN. Cada deploy queda en el panel (commit, mensaje, log) y se puede **volver a cualquiera con un clic** (Deployments → ⋯ → Rollback).
3. Cada rama distinta de `main` tiene su vista previa en `<rama>.<proyecto>.pages.dev` (con `noindex`).

GitHub Actions (`.github/workflows/deploy.yml`) corre los mismos chequeos en cada push (el panel /admin muestra ese estado) y los lunes dispara un rebuild con el deploy hook (secret `CF_PAGES_DEPLOY_HOOK`) para actualizar las reglas por fecha.

## Configuración en Cloudflare Pages
- Workers & Pages → Create → Pages → conectar `valedominguezl/isef-main`, rama de producción `main`.
- Framework: ninguno · Build command: `npm run check && npm run build` · Output: `dist`.
- Node: lo toma de `.nvmrc` (22).
- Dominios: `isefsanluis.net` como dominio propio del proyecto; `www` → redirección a la raíz con una Redirect Rule de la zona. `campus.isefsanluis.net` sigue apuntando al VPS.

## Reglas del sitio (en `public/`, se copian a `dist/`)
- `_redirects`: 301 desde las URLs viejas (`/Carrera`, `/Institucional/Contacto`, `/Cookies`, `/TestHiit`, `/cvGatto.pdf`, …) y `/admin/*` → panel. Pages ya sirve `/ruta` desde `ruta.html`, quita `.html` y la barra final, y responde `404.html` con estado 404.
- `_headers`: cabeceras de seguridad, caché de 1 año para `/assets/*` (con hash) y 1 semana para `/media/*` y `/docs/*`; `noindex` en `*.pages.dev`.

## Estructura de `dist/`
- `index.html`, `carrera.html`, `especializaciones/<slug>.html`, … (una página prerenderizada por URL)
- `admin.html`, `test-hiit.html`, `hijos.htm` (solo cliente), `404.html`
- `sitemap.xml`, `robots.txt`, `search-index.json`, `assets/` (con hash), `media/`, `docs/`

## VPS (Hostinger) — campus y plan B
El VPS (Ubuntu 24.04, `srv1609161.hstgr.cloud`, nginx) aloja el campus Chamilo (`/var/www/chamilo`). Hasta la migración también servía el sitio desde `/var/www/html` (symlink al último de `/var/www/builds/<timestamp>`).

Si hubiera que volver al VPS: [`deploy/nginx/isefsanluis.net.conf`](../deploy/nginx/isefsanluis.net.conf) reproduce las reglas de `_redirects`/`_headers` para nginx (va en `/etc/nginx/sites-available/default`; `nginx -t && systemctl reload nginx`), y el deploy por rsync está en el historial de `deploy.yml`.

## Probar localmente como en producción
```bash
npm run build && npm run preview   # http://localhost:4173 (imita Pages y lee dist/_redirects)
npx wrangler pages dev dist        # emulador oficial de Cloudflare (redirects + headers exactos)
```
