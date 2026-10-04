# Auditoría SEO — isefsanluis.net (octubre 2026)

Tipo de sitio: **institución educativa local con dos sedes** (San Luis y Villa Mercedes, Argentina). Auditado el build nuevo prerenderizado (`npm run build && npm run preview`, 37 URLs rastreadas) y comparado con la producción actual.

## Puntaje

| Categoría | Peso | Producción actual (estimado) | Build nuevo |
|---|---|---|---|
| SEO técnico | 22% | 30 | **90** |
| Calidad de contenido | 23% | 35 | **72** |
| On-page | 20% | 15 | **92** |
| Datos estructurados | 10% | 0 | **85** |
| Rendimiento (lab) | 10% | ~55 | **85** |
| Preparación para búsqueda con IA | 10% | 10 | **85** |
| Imágenes | 5% | 45 | **90** |
| **Total** | | **≈ 26 / 100** | **≈ 85 / 100** |

> Producción: medido sobre el HTML que entrega el servidor (Google también ejecuta JS, así que parte del contenido actual sí se indexa; el puntaje refleja lo que se ve sin depender del render).

## Hallazgos en producción actual (se resuelven al publicar el build)
- **Crítico:** todas las URLs devuelven el mismo HTML de 1,3 KB con `<div id="root">` vacío y el mismo título "ISEF San Luís | Profesorado de educación física".
- **Crítico:** una URL inexistente responde **200** (soft-404): Google puede indexar basura.
- **Alto:** sin datos estructurados, sin Open Graph, sin descripción por página; "San Luís" con tilde.
- Detrás de **Cloudflare** (cabecera `server: cloudflare`).

## SEO técnico — build nuevo
✅ HTML completo por URL · canonical en minúscula · `lang="es-AR"` · robots.txt (bloquea /admin, /buscar, /hijos.htm, /test-hiit) · sitemap con 36 URLs indexables y `lastmod` · 404 real · 301 desde las URLs viejas (`/Carrera`, `/Institucional/Contacto`, `/Cookies`, `/TestHiit`, `/cvGatto.pdf`) · HTTPS y sin barra final forzados en `.htaccess` · cabeceras de seguridad (HSTS, nosniff, Referrer-Policy, X-Frame-Options).
⚠️ **Cloudflare**: verificar que no cachee HTML viejo después del deploy (purgar caché al publicar) y que no pise las cabeceras de `.htaccess`.

## On-page
✅ 1 H1 por página · títulos ≤ 60 caracteres y únicos (se corrigieron 2 duplicados novedad/curso y 6 largos) · descripciones 70–158 caracteres (se acortaron la del sitio y las de disertantes, que tenían hasta 293) · breadcrumbs · enlazado interno curso ↔ disertante ↔ novedad.

## Contenido
- ✅ Páginas de curso (185–470 palabras con temario) y CVs de disertantes (hasta 6.700 palabras): fuerte señal de **experiencia y autoridad** (E-E-A-T).
- ⚠️ **Novedades delgadas** (~60 palabras propias; el resto es el resumen repetido del curso). Riesgo de contenido poco útil. Sumar `cuerpo` con información propia (qué, cuándo, para quién, cómo anotarse).
- ⚠️ **Falta una página institucional / historia** (había texto en el sitio viejo, comentado). Ayuda a la autoridad de la marca y a las respuestas de buscadores con IA. Fundación confirmada: 1993 (el texto viejo con "1999" está desactualizado).
- ℹ️ Inscripciones (197 palabras) y Contacto (147) son utilitarias: está bien que sean cortas.

## Datos estructurados
✅ `EducationalOrganization` + `CollegeOrUniversity` (con sedes, geo, teléfono y mapa) · `Course` + `CourseInstance` · `Person` · `NewsArticle` · `FAQPage` · `HowTo` · `BreadcrumbList` · `EducationalOccupationalProgram` · `ItemList`. JSON-LD validado (parsea) y escapado.
ℹ️ Google ya **no muestra** resultados enriquecidos de HowTo, y limitó los de FAQ y Course Info; el marcado igual se mantiene porque lo usan los buscadores con IA y el Knowledge Graph.

## Rendimiento
Lighthouse móvil (4G lento simulado): 88–90 · LCP 3,2–3,3 s · CLS 0 · TBT ≈ 10 ms. Recomendado medir datos reales (CrUX / Search Console) a 28 días del lanzamiento.

## Imágenes
✅ WebP optimizado, `alt` en todas, `loading="lazy"` salvo el LCP (precargado con `srcset` de 800/1920 px) · **nuevo:** imagen para compartir 1200×630 JPG con el título de cada curso, novedad y disertante.

## Búsqueda con IA (GEO)
✅ `llms.txt` generado en cada build · robots no bloquea crawlers de IA · respuestas de FAQ cortas y con datos concretos (horas, fechas, horarios) · entidad clara (nombre, sedes, fundación, redes en `sameAs`).

## SEO local
- ✅ NAP (nombre, dirección, teléfono) idéntico en footer, contacto y schema (sale de un único `content/sitio.json`).
- ⏳ **Google Business Profile**: crear o reclamar y verificar **una ficha por sede**, categoría principal "Instituto de educación superior" (o "Escuela de educación física"), horario 9–13 h, fotos, enlace a `/contacto` y pedir reseñas a egresados. Es el factor local de mayor impacto y no depende del sitio.
- ⏳ Citas locales consistentes (Facebook de cada sede, directorios educativos de San Luis).
