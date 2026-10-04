# Plan de acción SEO

## Fase 1 — Lanzamiento (semana 1)
| Prioridad | Acción | Estado |
|---|---|---|
| Crítica | Publicar el build nuevo (resuelve HTML vacío, títulos únicos, soft-404) | ⏳ al hacer push |
| Crítica | Confirmar si el VPS usa Apache o nginx (redirecciones 301 en `.htaccess` o `docs/DEPLOY.md`) | ⏳ |
| Alta | Purgar la caché de Cloudflare después de cada deploy (o regla "Bypass cache" para HTML) | ⏳ |
| Alta | Google Search Console: verificar el dominio (registro TXT en Cloudflare), enviar `sitemap.xml`, inspeccionar `/`, `/carrera`, `/inscripciones` | ⏳ |
| Alta | Revisar en Search Console → Páginas que las URLs viejas pasen a "Redirigida" | ⏳ |

## Fase 2 — Mejoras de alto impacto (semanas 2–3)
| Prioridad | Acción | Estado |
|---|---|---|
| Alta | Google Business Profile para cada sede (categoría, horario, fotos, link a /contacto) | ⏳ |
| Media | Sumar texto propio (`cuerpo`) a cada novedad desde el panel | ⏳ |
| Media | Página institucional / historia (confirmar año de fundación 1993 vs 1999) | ⏳ |
| ✅ | Títulos ≤ 60, descripciones ≤ 158, títulos únicos | Hecho |
| ✅ | Imágenes para compartir por página, `llms.txt`, datos de sede en el schema | Hecho |

## Fase 3 — Contenido y autoridad (mes 2)
- Una novedad por mes como mínimo (el panel avisa si pasan 60 días).
- Pedir a los disertantes que enlacen su página `/disertantes/...` desde sus perfiles.
- Notas sobre egresados y salida laboral (búsquedas "profesorado de educación física San Luis", "dónde estudiar educación física en San Luis").

## Fase 4 — Monitoreo (continuo)
- `npm run health` (skill `/mantenimiento`) incluye la auditoría SEO cada ~3 meses.
- Core Web Vitals reales en Search Console a los 28 días.
