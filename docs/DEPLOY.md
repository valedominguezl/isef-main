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

## Apache
Todo está en `public/.htaccess` (se copia a `dist/`): HTTPS, 301 desde las URLs viejas (`/Carrera`, `/Institucional/Contacto`, `/Cookies`, `/TestHiit`, …), `/ruta → /ruta.html`, 404 real, cabeceras de seguridad, caché y compresión. Requiere `AllowOverride All` y los módulos `rewrite`, `headers`, `deflate`.

## Nginx (si el VPS usa nginx, el .htaccess se ignora)
```nginx
server {
  listen 443 ssl http2;
  server_name isefsanluis.net;
  root /var/www/html;
  error_page 404 /404.html;

  # URLs viejas
  location = /Carrera { return 301 /carrera; }
  location = /Inscripciones { return 301 /inscripciones; }
  location = /Especializaciones { return 301 /especializaciones; }
  location = /Noticias { return 301 /novedades; }
  location = /Cookies { return 301 /privacidad; }
  location ~ ^/Institucional(/Contacto)?/?$ { return 301 /contacto; }
  location = /TestHiit { return 301 /test-hiit; }

  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location /admin { try_files /admin.html =404; }
  location / { try_files $uri $uri.html $uri/index.html =404; }

  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  add_header X-Frame-Options SAMEORIGIN always;
  gzip on; gzip_types text/css application/javascript application/json image/svg+xml application/xml;
}
```

## Probar localmente como en producción
```bash
npm run build && npm run preview   # http://localhost:4173 (imita las reglas de Apache)
```
