# Estadísticas: GA4 + Looker Studio

La sección **Estadísticas** del panel (`/admin/estadisticas`) no consulta ninguna API: explica qué significa cada número y abre un tablero de **Looker Studio** (gratis) conectado a GA4. Así no hay credenciales nuevas en el Worker ni código que mantener. Si el equipo lo usa y pide más, recién ahí conviene una pestaña propia con la GA4 Data API.

**Qué se mide (solo con cookies aceptadas):**

| Evento | Parámetros | Cuándo |
|---|---|---|
| `page_view` | `curso` (solo en `/especializaciones/:slug`) | Se abre una página |
| `curso_ver_mas` | `curso` | Clic en una tarjeta de curso |
| `whatsapp_click` | `origen` (`curso`, `curso_aside`, `flotante`, `inscripciones_paso`), `curso` | Clic en «Consultar» |
| `conferencia_click` | `curso`, `titulo` | Clic en una conferencia pasada |
| `search` | `search_term`, `resultados` (0 = no encontró nada) | Búsqueda en el sitio |
| `file_download` | `archivo` | Descarga de planillas |

`curso` es siempre el **slug** (el final de la URL del curso), no el título: así un cambio de título no parte los datos en dos.

## 1. GA4: registrar los parámetros (5 minutos, hacerlo ya)
GA4 solo permite cruzar datos por un parámetro **desde el día en que se registra**: lo anterior no se recupera.

1. <https://analytics.google.com> → propiedad del I.S.E.F. → **Administrar** (engranaje) → **Visualización de datos → Definiciones personalizadas** → **Crear dimensión personalizada**.
2. Crear una por fila, con **Alcance: Evento**:

   | Nombre de la dimensión | Parámetro del evento |
   |---|---|
   | Curso | `curso` |
   | Origen | `origen` |
   | Título | `titulo` |
   | Resultados | `resultados` |
   | Archivo | `archivo` |

   (`search_term` ya viene como «Término de búsqueda».)
3. **Administrar → Visualización de datos → Eventos** → en `whatsapp_click`, marcar **Evento clave** (la estrella). Si todavía no aparece en la lista: **Eventos clave → Nuevo evento clave** → `whatsapp_click`.

## 2. Looker Studio: el tablero
<https://lookerstudio.google.com> → **Crear → Informe** → conector **Google Analytics** → la propiedad del I.S.E.F.

Armar una sola página con:
1. **Interés por curso** (tabla dinámica): fila **Curso** · columna **Nombre del evento** · métrica **Recuento de eventos** · filtro *Nombre del evento* en `page_view`, `curso_ver_mas`, `whatsapp_click`. Ordenar por `whatsapp_click`. Excluir *Curso* vacío.
2. **Qué buscan y no encuentran** (tabla): **Término de búsqueda** · **Recuento de eventos** · filtro *Nombre del evento* = `search` y *Resultados* = `0`.
3. **Qué más buscan** (tabla): igual, sin el filtro de resultados.
4. **Consultas en el tiempo** (serie temporal): **Fecha** · **Recuento de eventos** · filtro `whatsapp_click`. Sirve para compararlo con las fechas de inscripción.
5. **De dónde llegan** (barras): **Grupo de canales predeterminado de la sesión** · **Usuarios activos**.
6. **Descargas** (tabla): **Archivo** · **Recuento de eventos** · filtro `file_download`.
7. Un cuadro de texto arriba: *«Solo cuenta a quienes aceptaron cookies: sirve para comparar cursos entre sí, no como total. No muestra inscripciones.»*
8. Selector de **período** (control de rango de fechas) con «Últimos 90 días» por defecto.

**Compartir:** botón **Compartir** → agregar los correos del equipo como **Lector** y dejar el acceso general en **Restringido** (el enlace queda en `content/sitio.json`, y el repo es público). Copiar el enlace → panel → **Datos del instituto → Otros datos del sitio → Analítica → Enlace al tablero de Looker Studio** → Guardar y publicar.

> El tablero queda a nombre de la cuenta que lo crea. Conviene crearlo con una cuenta institucional (o pasarle la propiedad) para que no dependa de una persona.

## 3. Cloudflare Web Analytics (opcional, recomendado)
Cuenta visitas **sin cookies** (no necesita el banner), así que sirve para estimar cuánto se le escapa a GA4.
Cloudflare → **Analytics & Logs → Web Analytics → Add a site** → `isefsanluis.net`. Con el dominio en Cloudflare (proxy activado) la instalación es automática; si en cambio pide pegar un script, hay que sumarlo al sitio (no está hecho).

## 4. Clarity
No se integra al tablero (su API solo da 1 a 3 días). El panel enlaza directo al proyecto: mapas de calor de `/especializaciones` y grabaciones para ver dónde se traban.

## Uso
Una revisión mensual corta alcanza: ¿qué curso tiene más consultas por visita?, ¿qué buscan y no encuentran?, ¿algún curso sin consultas para promocionar o revisar su página? Con números chicos (9 contra 14) la diferencia puede ser casualidad.
