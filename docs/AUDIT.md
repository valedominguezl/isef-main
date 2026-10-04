# Auditoría integral — octubre 2026

Estado de partida: SPA en React 18 + JS (Vite), ~14.500 líneas, contenido hardcodeado en JSX, sin panel, sin prerender.
Referencias: ✅ aplicado · ⏳ pendiente / para decidir · ❌ descartado (con motivo).

---

## 1. Concepto y producto
| Hallazgo | Acción |
|---|---|
| Cada novedad, curso o cambio de teléfono requería editar código y hacer deploy | ✅ Panel `/admin` Git-based: edita `content/*.json`, publica con un commit y dispara el deploy |
| Los cursos eran un modal sin URL: imposible compartir un curso o que Google lo indexe | ✅ Página propia por curso `/especializaciones/<slug>` con datos estructurados `Course` |
| CVs de disertantes en Google Docs/PDF, cada uno con formato distinto | ✅ CV normalizado (mismas 11 secciones y campos) con página propia y PDF A4 uniforme. Migrados los 6 CVs |
| No había buscador (estaba comentado en el navbar) | ✅ Buscador estilo harvard.edu: overlay (`/` o Ctrl+K), búsquedas frecuentes, resultados por tipo, teclado, página `/buscar` con filtros. Indexa páginas, secciones, cursos y sus temarios, novedades, disertantes, FAQ y materias |
| "Noticias" existía como página vacía y la ruta estaba deshabilitada | ✅ `/novedades` con listado, filtros y detalle (`NewsArticle`) |
| Aranceles comentados en 4 lugares | ✅ Contenido editable con interruptor `visible` |
| Etiquetas "¡Nuevo!" en cursos de 2025 | ⏳ El panel lo alerta; quitarlas es decisión editorial |
| Fechas de las novedades migradas | ⏳ No tenían fecha: se asignaron fechas aproximadas según el inicio de cada curso. Revisar en el panel |

## 2. Arquitectura y código
| Hallazgo | Acción |
|---|---|
| JavaScript sin tipos | ✅ TypeScript estricto en todo `src/` y `scripts/` |
| Cada link hacía `preventDefault` + **recarga completa** tras un delay aleatorio de 300–500 ms (`useLoadingA`) | ✅ Navegación SPA real con `<Link>`; barra de progreso real (`useNavigation`) |
| Skeleton de cursos falso de 2 s | ✅ Eliminado (el contenido ya está en el HTML) |
| ~20 copias del mismo `IntersectionObserver` para animar | ✅ Un componente `<Reveal>` |
| 5 componentes "Intro" casi idénticos, 4 bloques de redes copiados | ✅ `Feature`, `SectionHeader`, `Section`, `PageHero`, datos desde `content/sitio.json` |
| Datos de expositores duplicados con nombres inconsistentes ("Lic." vs "Dr." Jorge Roig) | ✅ Referencias por slug a `content/disertantes` |
| `dangerouslySetInnerHTML` en títulos y embeds | ✅ Markdown propio seguro (sin HTML crudo) |
| Swiper (~40 KB) para 4 carruseles | ✅ `Carousel` con scroll-snap nativo, accesible |
| Dependencias sin uso: express, json5, "node", react-ga4, react-lazyload, babel×6, plugin-react-swc, sitemap, react-countup, pnpm-lock duplicado | ✅ Eliminadas |
| Validación de contenido inexistente | ✅ Esquemas zod + `npm run content:check` (bloquea el deploy si hay errores o referencias rotas) |
| Instagram embed con 34 KB de HTML pegado y `.gitignore` que ignoraba archivos versionados | ✅ Eliminado (no se usaba) |

## 3. SEO
| Hallazgo | Acción |
|---|---|
| SPA sin prerender: Google veía `<div id="root">` vacío y el mismo `<title>` en todas las URLs | ✅ SSG: 36 páginas con HTML completo, title/description/canonical/OG/Twitter por página |
| Sin datos estructurados | ✅ `EducationalOrganization` (sedes con geo), `FAQPage`, `Course`, `Person`, `NewsArticle`, `HowTo`, `BreadcrumbList`, `EducationalOccupationalProgram`, `ItemList` |
| sitemap.xml manual y desactualizado; URLs con mayúsculas | ✅ Sitemap automático con lastmod; URLs en minúscula con 301 desde las viejas |
| Ruta comodín redirigía todo a la home (soft-404) | ✅ 404 real |
| "San Luís" con tilde en todo el sitio | ✅ "San Luis" (forma correcta, mejor coincidencia de búsqueda) |
| Sin imagen OG | ✅ `og-default.jpg` 1200×630 + imagen propia por curso/novedad/disertante |
| Lighthouse SEO | ✅ 100 |

## 4. Rendimiento
| Hallazgo | Acción |
|---|---|
| Imágenes de hasta 6000 px y 2,4 MB | ✅ Optimizadas: contenido 3,7 MB → 0,4 MB; diseño 4,8 MB → 1,5 MB; versiones de 800 px para el hero en móvil |
| Google Fonts externo | ✅ Fuentes autoalojadas (@fontsource) con preload |
| zod y Motion completo en el bundle | ✅ zod fuera del bundle público; Motion con `LazyMotion` (134 → 81 KB) |
| CSS en ~15 archivos que bloqueaban el render | ✅ Un único CSS (+ preload de LCP) |
| Lighthouse móvil (4G lento simulado) | ✅ 64 → 88–90 · CLS 0 · TBT ≈ 10 ms |
| Mapas de Google cargados siempre | ✅ Se cargan al hacer clic (privacidad + velocidad) |

## 5. Accesibilidad
| Hallazgo | Acción |
|---|---|
| Texto de párrafos `rgba(0,0,0,.5)` = 3,9:1 (no cumple AA) | ✅ `ink-700` (10:1) |
| Violeta de marca con texto blanco chico = 4,25:1 | ✅ Regla: `violet-600` para texto chico; gradientes de botón AA |
| Divs clickeables sin teclado (FAQ, plan, menú, temario) | ✅ Botones reales, `aria-expanded`, foco visible, skip-link, `<dialog>` nativo |
| Íconos raster sin alt útil | ✅ SVG (lucide) con `aria-hidden` y textos accesibles |
| axe-core (12 páginas) | ✅ 0 violaciones · Lighthouse a11y 100 |
| `prefers-reduced-motion` ignorado | ✅ Respetado en CSS y Motion |

## 6. Diseño y sistema de diseño
| Hallazgo | Acción |
|---|---|
| Variables sueltas (`--padding-200`, `--grad-nav2`…), colores hardcodeados, `!important` en `span` global | ✅ Tokens completos (color, tipo, espacio, radios, sombras, movimiento) en `tokens.scss` ↔ `design/tokens.json` |
| Sin documentación de marca | ✅ `design/DESIGN.md` con personalidad, referencias (Stripe, Harvard Gazette, Nike Training, Airbnb) y reglas de uso |
| Navbar: solo menú hamburguesa en desktop | ✅ Links visibles en desktop, búsqueda, Campus, CTA "Inscribite"; menú móvil a pantalla completa con el gradiente de marca |
| Footer con teléfonos en lista plana | ✅ Footer por sede + navegación |
| Exportable a Claude Design | ✅ Tokens en formato W3C (importables en Figma/Tokens Studio) + sistema publicado como artifact |

## 7. Animaciones y fluidez
✅ Un solo sistema (Motion): reveal escalonado, contador con easeOutExpo, menú que se abre en círculo desde el botón, acordeones con altura animada, zoom lento en tarjetas, hover de flecha.
❌ **react-spring** y **anime.js**: descartados. Sumar 3 librerías de animación agrega peso y estilos de movimiento inconsistentes; Motion cubre todos los casos.

## 8. Seguridad y privacidad
| Hallazgo | Acción |
|---|---|
| **`/cvGatto.pdf` público con DNI, fecha de nacimiento, estado civil, domicilio, teléfono y email personal** | ✅ Eliminado del sitio y redirigido al CV normalizado (sin datos personales) |
| El PDF sigue en el **historial público** de GitHub | ⏳ Requiere reescribir el historial (`git filter-repo`) y forzar push. Recomendado; decidir juntos |
| Banner de cookies listaba cookies de Facebook/Instagram que no se usan; GA4 cargaba antes del consentimiento | ✅ Consentimiento real: nada se carga hasta aceptar; categorías honestas (analítica / publicidad); política de privacidad reescrita (Ley 25.326) |
| Workflow con `StrictHostKeyChecking=no` y sin chequeos | ✅ `accept-new`, Node 20, `npm ci`, chequeos antes de desplegar, concurrencia, retención de builds |
| Sin cabeceras de seguridad | ✅ HSTS, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy |
| Vulnerabilidades npm (14 altas) | ✅ `npm audit fix` → queda 1 en `sharp` (solo desarrollo; se resuelve con Node ≥ 20) |
| Admin: token de GitHub en el navegador | ✅ Token fine-grained limitado a 1 repo; verificación de permisos; sesión opcional. ⏳ Si se suman muchos editores, evaluar un proxy OAuth |

## 9. Infraestructura y desarrollo (Windows)
| Hallazgo | Acción |
|---|---|
| Errores que solo aparecían en producción (Linux distingue mayúsculas en imports; Windows no) | ✅ `forceConsistentCasingInFileNames`, `npm run case:check`, hook `pre-push` con `npm run check`, CI que corre los mismos chequeos |
| Finales de línea mixtos | ✅ `.gitattributes` (LF) |
| Node 18 (sin soporte) | ⏳ Instalar Node 22 LTS en Windows; CI ya usa 20 |
| `npm run preview` distinto a producción | ✅ `serve-dist.mjs` imita Apache (rutas `.html`, 301, 404, gzip) |

## 10. Contexto para IA y mantenimiento
✅ `CLAUDE.md` (2 KB) con el mapa del proyecto · `.claude/settings.json` bloquea leer lockfile, builds y medios · skill `/mantenimiento` + `npm run health` → `docs/MAPA.md` (diagrama de salud y "qué hacer ahora") · `pnpm-lock` duplicado (124 KB) eliminado.

---

## 11. Auditoría impeccable (segunda pasada)
Puntaje inicial **15/20 (Bueno)**: a11y 3 · rendimiento 3 · responsive 3 · theming 3 · integridad 3.
✅ Texto al 200 % ya no rompe navbar ni títulos (WCAG 1.4.4) · ✅ sin texto con gradiente · ✅ animaciones solo con `transform`/`opacity`/`clip-path` (carrusel, WhatsApp, menú, CTA) · ✅ fondos de sección en `<img loading="lazy">` · ✅ áreas táctiles de 44 px en navbar, diálogos y botones chicos en pantallas táctiles · ✅ cursor, scrollbar y controles nativos con los colores de la marca · ✅ ISSN mal interpretados como período en el CV de Nelio Bazán.
⏳ Decisión de diseño: impeccable considera clichés los antetítulos sobre cada título y la banda de números grandes. Vienen del sitio original; propuesta: dejar antetítulos solo donde aportan dato y quitar el "I.S.E.F. San Luis ·" repetido.

## Pendientes recomendados (por prioridad)
1. ⏳ Purgar `cvGatto.pdf` del historial de git (datos personales en repo público).
2. ⏳ Revisar etiquetas "¡Nuevo!" y fechas de novedades desde el panel.
3. ⏳ Completar en el panel los CVs con más detalle (Roig, Rosler: solo había un resumen).
4. ⏳ Confirmar si el VPS usa Apache o nginx (ver `docs/DEPLOY.md`) y que los videos de `/hijos.htm` sigan sirviéndose.
5. ⏳ Crear tokens del panel para cada editor.
6. ⏳ Node 22 en Windows y actualizar `sharp`.
7. ⏳ Antetítulos y banda de números (ver sección 11).
