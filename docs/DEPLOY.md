# Deploy y servidor

## Flujo
`push a main` (o **Publicar** desde /admin) → **Cloudflare Workers Builds** compila y publica (Worker `isef-sanluis`, config en `wrangler.jsonc`: archivos estáticos + `worker/index.ts` solo para `/api/*`):
1. Build: `npm run check && npm run build` (tipos, lint, contenido, mayúsculas → Vite + SSR + prerender). Si un chequeo falla, **no se publica** y el sitio sigue con la versión anterior.
2. Deploy: `npx wrangler deploy` sube `dist/` al CDN de Cloudflare. Cada deploy queda en el panel del Worker (Deployments: commit, log) y se puede **volver a una versión anterior** desde ahí (Rollback).
3. Las direcciones `*.workers.dev` (producción y vistas previas) están **desactivadas**: el sitio solo se sirve en `isefsanluis.net`.

GitHub Actions (`.github/workflows/deploy.yml`) corre los mismos chequeos en cada push (el panel /admin muestra ese estado) y todos los días a las 00:05 (Argentina) dispara un rebuild con el deploy hook (secret `CF_DEPLOY_HOOK`) para actualizar lo que depende de la fecha («¡Nuevo!», novedades recientes, inscripciones). Si un run falla con «The job was not acquired by Runner», es GitHub, no el sitio: se reintenta solo en el próximo push (o *Re-run* en Actions).

## Configuración en Cloudflare
- Workers & Pages → Create application → Continue with GitHub → `valedominguezl/isef-main`.
- Build command: `npm run check && npm run build` · Deploy command: `npx wrangler deploy`. Rama de producción: `main`.
- Node: lo toma de `.nvmrc` (22).
- Dominio: Worker → Domains → Custom domains `isefsanluis.net` y `www.isefsanluis.net`; `www` → redirección 301 a la raíz con una Redirect Rule de la zona. `campus.isefsanluis.net` apunta al VPS del campus (registro A, con proxy).
- Rebuild diario: Worker → Settings → Builds → Deploy Hooks (rama `main`) → guardar la URL como secret `CF_DEPLOY_HOOK` en GitHub.
- Correo: el dominio no manda ni recibe mail; SPF `v=spf1 -all` y DMARC `p=reject` evitan que se haga pasar por él.

## Panel /admin (Cloudflare Access)
`isefsanluis.net/admin` (y todas sus subrutas) está detrás de **Cloudflare Access** (Zero Trust Free, US$ 0, tope 50 usuarios, sin cobro automático): app *Panel ISEF*, política *Equipo* (Allow por mail), ingreso con código por mail (One-time PIN), sesión de 1 mes, lugares que se liberan tras 2 meses sin uso. Equipo: `isefsanluis.cloudflareaccess.com`. Para sumar a alguien: Zero Trust → Access controls → Applications → Panel ISEF → Policies → Equipo → agregar el mail. Después de pasar Access, el panel sigue pidiendo su contraseña (token de GitHub); `/api/*` no está detrás de Access y valida ese mismo token.

## Reglas del sitio (en `public/`, se copian a `dist/`)
- `_redirects`: 301 desde las URLs viejas (`/Carrera`, `/Institucional/Contacto`, `/Cookies`, `/TestHiit`, `/cvGatto.pdf`, …, con y sin barra final) y `/admin/*` → panel. Cloudflare ya sirve `/ruta` desde `ruta.html`, redirige `.html` y la barra final, y responde `404.html` con estado 404 (`wrangler.jsonc`).
- `_headers`: cabeceras de seguridad, caché de 1 año para `/assets/*` (con hash) y 1 semana para `/media/*` y `/docs/*`; `noindex` en `*.workers.dev`.

## Estructura de `dist/`
- `index.html`, `carrera.html`, `especializaciones/<slug>.html`, … (una página prerenderizada por URL)
- `admin.html`, `test-hiit.html`, `hijos.htm` (solo cliente), `404.html`
- `sitemap.xml`, `robots.txt`, `search-index.json`, `assets/` (con hash), `media/`, `docs/`

## VPS del campus (Hostinger)
Desde el 5/10/2026 el campus Chamilo vive en un **KVM 1** (`srv2036356.hstgr.cloud`, `179.236.245.24`, Ubuntu 24.04, 1 vCPU / 4 GB); el VPS anterior (KVM 4) se dio de baja. Solo sirve `campus.isefsanluis.net`:
- nginx (`/etc/nginx/sites-available/campus`, traduce las reglas `.htaccess` de Chamilo), PHP 8.1 (ppa:ondrej, ajustes en `conf.d/99-isef.ini`), MariaDB 10.11 (base `chamilo`, usuario `admin@localhost`), código en `/var/www/chamilo` (sin 777: dueño root, `www-data` solo en `app/` y `web/`).
- Seguridad: SSH solo con clave, `ufw` (22/80/443), swap de 2 GB, actualizaciones automáticas.
- Certificado Let's Encrypt `campus.isefsanluis.net` (certbot.timer lo renueva solo).
- Backup diario 04:30 UTC: `/usr/local/bin/backup-chamilo` (cron en `/etc/cron.d/backup-chamilo`) → `/root/backups` (base 14 días, archivos los domingos, 4 semanas).
- Correo: `msmtp` como `sendmail` vía Gmail (`/etc/msmtprc`, clave de aplicación en `/etc/msmtp-gmail.pass`, log en `/var/log/msmtp.log`). El aviso de cuentas nuevas va al mail del usuario `admin` de Chamilo.

Plan B del sitio (si alguna vez hubiera que servirlo desde un VPS): [`deploy/nginx/isefsanluis.net.conf`](../deploy/nginx/isefsanluis.net.conf) reproduce las reglas de `_redirects`/`_headers` para nginx, y el deploy por rsync está en el historial de `deploy.yml`.

## Probar localmente como en producción
```bash
npm run build && npm run preview   # http://localhost:4173 (imita Cloudflare y lee dist/_redirects)
npm run build && npx wrangler dev  # emulador oficial (en esta PC el antivirus Avast bloquea workerd.exe)
```
