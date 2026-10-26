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
Desde el 25/10/2026 la política *Equipo* está en **Bypass / Everyone**: no se pide mail, se entra solo con la contraseña del panel. Para volver a pedir el código por mail: Action → Allow e Include → los mails. Configuración original: `isefsanluis.net/admin` (y todas sus subrutas) detrás de **Cloudflare Access** (Zero Trust Free, US$ 0, tope 50 usuarios, sin cobro automático): app *Panel ISEF*, política *Equipo* (Allow por mail), ingreso con código por mail (One-time PIN), sesión de 1 mes, lugares que se liberan tras 2 meses sin uso. Equipo: `isefsanluis.cloudflareaccess.com`. Para sumar a alguien: Zero Trust → Access controls → Applications → Panel ISEF → Policies → Equipo → agregar el mail. Después de pasar Access, el panel pide **su contraseña**: una sola para todo el equipo (no hace falta cuenta de GitHub). El navegador nunca habla con GitHub: lee y publica a través del Worker (`/api/github/*`, solo las rutas que usa el panel y sobre `main`), que usa su propio token. `/api/*` no está detrás de Access y valida esa misma contraseña.

Secretos del Worker (Worker → Settings → Variables and Secrets, o `npx wrangler secret put NOMBRE`):
- `ADMIN_PASSWORD_SHA256`: hash SHA-256 (hex) de la contraseña; no se guarda la contraseña en sí. **Cambiarla:** `printf '%s' 'NUEVA' | sha256sum` → pegar el hash en el secreto (todos los que estaban adentro tienen que volver a ingresar).
- `GITHUB_TOKEN`: token con permiso de escritura en `valedominguezl/isef-main` (ideal: fine-grained, solo este repo, *Contents: Read and write* + *Actions: Read*). Si vence, el panel avisa «Venció el acceso del sitio a GitHub»: generar otro y reemplazar el secreto.

## Reglas del sitio (en `public/`, se copian a `dist/`)
- `_redirects`: 301 desde las URLs viejas (`/Carrera`, `/Institucional/Contacto`, `/Cookies`, `/TestHiit`, `/cvGatto.pdf`, …, con y sin barra final) y `/admin/*` → panel. Cloudflare ya sirve `/ruta` desde `ruta.html`, redirige `.html` y la barra final, y responde `404.html` con estado 404 (`wrangler.jsonc`).
- `_headers`: cabeceras de seguridad, caché de 1 año para `/assets/*` (con hash) y 1 semana para `/media/*` y `/docs/*`; `noindex` en `*.workers.dev`.

## Estructura de `dist/`
- `index.html`, `carrera.html`, `especializaciones/<slug>.html`, … (una página prerenderizada por URL)
- `admin.html`, `test-hiit.html`, `hijos.htm` (solo cliente), `404.html`
- `sitemap.xml`, `robots.txt`, `search-index.json`, `assets/` (con hash), `media/`, `docs/`

## VPS del campus (Hostinger)
Desde el 5/10/2026 el campus Chamilo vive en un **KVM 1** (`srv2036356.hstgr.cloud`, `179.236.245.24`, Ubuntu 24.04, 1 vCPU / 4 GB); el VPS anterior (KVM 4) se dio de baja. Solo sirve `campus.isefsanluis.net`:
- nginx (`/etc/nginx/sites-available/campus`, traduce las reglas `.htaccess` de Chamilo), PHP 8.2 (ppa:ondrej, ajustes en `/etc/php/8.2/fpm/conf.d/99-isef.ini`; desde el 21/10/2026 por PHP2Shell, CVE-2026-109618/109619 — 8.1 queda instalado pero apagado: para volver, `fastcgi_pass` a `php8.1-fpm.sock` y `systemctl enable --now php8.1-fpm`), MariaDB 10.11 (base `chamilo`, usuario `admin@localhost`), código en `/var/www/chamilo` (sin 777: dueño root, `www-data` solo en `app/` y `web/`).
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
