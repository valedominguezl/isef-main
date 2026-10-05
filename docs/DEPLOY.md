# Deploy y servidor

## Flujo
`push a main` (o **Publicar** desde /admin) → GitHub Actions (`.github/workflows/deploy.yml`):
1. `npm ci` → `npm run check` (tipos, lint, contenido, mayúsculas) → `npm run build` (Vite + SSR + prerender).
2. `rsync` de `dist/` a `/var/www/builds/<timestamp>` y cambio atómico del symlink `/var/www/html`.
3. Se conservan los últimos 5 builds (rollback: apuntar el symlink al anterior).

Si un chequeo falla, **no se despliega** y el sitio sigue con la versión anterior.

Secrets necesarios en GitHub: `SSH_PRIVATE_KEY`, `VPS_USER`, `VPS_HOST`.

## Estructura de `dist/`
- `index.html`, `carrera.html`, `especializaciones/<slug>.html`, … (una página prerenderizada por URL)
- `admin.html`, `test-hiit.html`, `hijos.htm` (solo cliente), `404.html`
- `sitemap.xml`, `robots.txt`, `search-index.json`, `assets/` (con hash, caché 1 año), `media/`, `docs/`

## Servidor: nginx (VPS Hostinger)
El VPS (Ubuntu 24.04, `srv1609161.hstgr.cloud`) usa **nginx**, que ignora el `.htaccess`. La configuración del sitio está versionada en [`deploy/nginx/isefsanluis.net.conf`](../deploy/nginx/isefsanluis.net.conf) y va en `/etc/nginx/sites-available/default`: HTTPS y dominio sin www, 301 desde las URLs viejas, `/ruta → /ruta.html`, 404 real, cabeceras de seguridad, caché y compresión. El campus (Chamilo) es otro `server` (`sites-available/campus`).

Aplicar un cambio: copiarla al VPS, `nginx -t` y `systemctl reload nginx`.

`public/.htaccess` hace lo mismo para Apache (por si se cambia de servidor): mantener ambos sincronizados.

## Probar localmente como en producción
```bash
npm run build && npm run preview   # http://localhost:4173 (imita las reglas de Apache)
```
