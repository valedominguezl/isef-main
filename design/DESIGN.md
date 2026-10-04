# Sistema de diseño — I.S.E.F. San Luis

> **Editorial-atlético.** La jerarquía tipográfica serena de una publicación universitaria,
> con la energía de una marca deportiva. Fuente de verdad de tokens: [`tokens.json`](./tokens.json)
> (formato W3C Design Tokens) ↔ [`src/styles/tokens.scss`](../src/styles/tokens.scss).

---

## 1. Personalidad y referencias

| Atributo | Cómo se expresa | Referencia |
|---|---|---|
| **Académico, confiable** | Serif para lectura larga, mucho aire, encabezados livianos con una palabra destacada | *Harvard Gazette*, *The Guardian* (cuerpo serif + titulares sans) |
| **Energía deportiva** | Gradiente violeta→coral, fotografía de acción a sangre, movimiento con aceleración marcada | *Nike Training Club*, *Strava* (acento cálido sobre oscuro) |
| **Moderno, digital** | Violeta eléctrico, tarjetas con overlay, microinteracciones | *Stripe* (el violeta `#7761FF` es primo del *blurple* `#635BFF`) |
| **Cálido, cercano** | Coral como acento humano, tono "vos", WhatsApp siempre a mano | *Airbnb* (el coral `#FF554E` es casi el *Rausch* `#FF5A5F`) |
| **Buscador institucional** | Overlay a pantalla completa, búsquedas frecuentes, resultados por tipo | *harvard.edu* |

**En una frase:** *Stripe × Harvard Gazette con el pulso de Nike Training.*

**Qué NO es:** no es infantil ni de colores primarios saturados, no usa ilustraciones planas genéricas, no usa sombras duras ni bordes gruesos, no usa más de un acento por bloque.

---

## 2. Color

### Marca
| Token | Hex | Uso |
|---|---|---|
| `violet-500` · **Primario** | `#7761FF` | Palabra destacada en títulos grandes, íconos, decoración, gradientes |
| `violet-600` | `#5B42F5` | Texto/enlaces sobre blanco y fondos con texto blanco chico (contraste 6:1) |
| `violet-700` | `#4A2FDB` | Hover, final de gradientes |
| `coral-500` · **Acento** | `#FF554E` | Detalles, final del gradiente de marca, subrayado activo del menú |
| `coral-700` | `#C0221C` | Fondo de badges con texto blanco (AA) |
| `ink-950` | `#0D0C12` | Fondos oscuros, footer, sidebar del admin |
| `ink-700` | `#403D52` | Texto de párrafos (10:1 sobre blanco) |
| `ink-500` | `#6F6B85` | Texto secundario / antetítulos (4.7:1) |

Escalas completas (50→950) en `tokens.json`. Neutros con un leve tinte violeta (nunca gris puro).

### Gradientes firma
- **Marca**: `linear-gradient(120deg, #7761FF, #FF554E)` → bandas de datos, menú móvil, línea superior del footer.
- **Primario (botones)**: `linear-gradient(90deg, #6650FA, #4A2FDB)` → cumple AA con texto blanco.
- **Overlay de imagen**: `linear-gradient(135deg, rgba(13,12,18,.86), rgba(119,97,255,.62))` → toda foto con texto encima.

### Reglas de contraste (WCAG 2.2 AA)
- `#7761FF` **solo** en texto ≥ 24 px (o 19 px bold) o decorativo. Para texto chico usar `violet-600`.
- Texto blanco sobre coral: usar `coral-700` o el gradiente de acento.
- Párrafos: `ink-700` sobre blanco; en fondos oscuros, blanco al 78 %.

---

## 3. Tipografía

| Rol | Familia | Peso | Notas |
|---|---|---|---|
| Títulos, UI, botones | **Libre Franklin** (variable) | 300 títulos · 500 UI · 600 énfasis | Tracking −2 % en títulos |
| Lectura | **Merriweather** | 300 cuerpo · 700 negrita | Interlineado 1.75 |
| Datos/código | sistema monoespaciado | 400 | Numeración de temario, URLs |

**Firma tipográfica:** título liviano (300) con **una** palabra en semibold violeta → «Bienvenido al **I.S.E.F.**», «Las **últimas noticias**». En código: `title="Bienvenido al *I.S.E.F.*"`.

**Antetítulo (eyebrow):** 12 px, MAYÚSCULAS, tracking 12 %, `ink-500` → «I.S.E.F. SAN LUIS · PROFESORADO DE EDUCACIÓN FÍSICA».

Escala fluida (clamp): display 44→88 px · h1 34→64 · h2 28→46 · h3 20→28 · body 16→17 · small 14 · xs 12.

---

## 4. Espaciado, grilla y forma
- Base 4 px: `space-1…24` (4 → 96 px). Secciones: padding vertical 64→120 px fluido.
- Contenedor 1200 px (texto 72ch, ancho 1400 px). Gutter 16→48 px.
- Radios: 6 · 10 (botones, inputs) · 16 · **24 (tarjetas)** · pill.
- Sombras suaves con tinte tinta; `shadow-brand` (violeta difuso) solo en hover de CTA primario.

---

## 5. Movimiento
| Token | Valor | Uso |
|---|---|---|
| `ease-emphasized` | `cubic-bezier(.16,1,.3,1)` | Entradas, reveal, menú |
| `ease-standard` | `cubic-bezier(.2,.7,.2,1)` | Hover, transiciones de color |
| `duration-reveal` | 700 ms | Aparición al hacer scroll (sube 24 px + fade) |
| stagger | 80 ms | Grillas de tarjetas |

Patrones: reveal al entrar en pantalla (`<Reveal>`), zoom lento 1.06 en imágenes de tarjetas, flecha del botón que avanza 3 px, menú móvil que se abre en círculo desde el botón, contador de números (easeOutExpo). Todo respeta `prefers-reduced-motion`. Librería: **Motion** (motion.dev) con `LazyMotion`.

---

## 6. Componentes (src/components/ui)
| Componente | Variantes | Notas |
|---|---|---|
| `Button` | primary · accent · dark · light · outline · outline-light · ghost · sm/md/lg | Ícono de flecha por defecto; `download`, `external`, `none` |
| `Section` | tone: default · tint · subtle · dark · ink · brand · image | Fondo + padding + contenedor |
| `SectionHeader` | align start/center | Antetítulo + título con énfasis + línea + bajada |
| `PageHero` | md · lg · full; start/center | Imagen + overlay; breadcrumbs |
| `Feature` | normal · reverse | Texto + imagen con bloque de gradiente detrás |
| `Accordion` | card · brand · plain | Accesible, animación de altura |
| `Carousel` | light · dark | Scroll-snap nativo (sin librerías) |
| `Badge` | violet · coral · neutral · light · success | |
| `Dialog` | sm · md · lg · full; default · dark | `<dialog>` nativo |
| Tarjetas | `CourseCard` · `NewsCard` (overlay/plain) · `SpeakerCard` | Toda la tarjeta es clickeable |

---

## 7. Piezas gráficas (Claude Design / redes)
- **Formato post**: foto a sangre + overlay de imagen + antetítulo + título 300/600 + barra inferior de 8 px con el gradiente de marca + logo arriba a la izquierda.
- **Historias**: mismo sistema; el título no supera 3 líneas; CTA en botón blanco.
- **Plantilla OG**: `public/og-default.jpg` (1200×630) es la referencia.
- Nunca: logo deformado, más de 2 colores de acento, texto sobre foto sin overlay.

Logo: escudo circular con la «I» roja (`src/assets/logo.webp`). Usarlo sobre fondo oscuro o blanco, con aire de al menos ½ del diámetro.
