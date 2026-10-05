# Guía del panel de administración

El panel está en **https://isefsanluis.net/admin**. Sirve para actualizar novedades, especializaciones, disertantes (con su currículum), preguntas frecuentes, plan de estudios, inscripciones, aranceles, galería y datos de contacto, **sin tocar código**.

## Cómo funciona
1. Editás y tocás **Guardar** → el cambio queda como *pendiente* (no se ve todavía en el sitio).
2. Arriba a la derecha aparece **Publicar N cambios** → revisás la lista y tocás **Publicar en el sitio**.
3. En 1–2 minutos el sitio se actualiza solo. El indicador muestra *Publicando…* → *Sitio actualizado*.

Los cambios pendientes sobreviven si cerrás la pestaña. Podés descartarlos uno por uno.

## Primer ingreso: crear tu token
El panel usa un token personal de GitHub (como una contraseña con permisos limitados a este sitio).
1. Entrá a <https://github.com/settings/personal-access-tokens/new>.
2. **Repository access** → *Only select repositories* → `isef-main`.
3. **Permissions** → *Contents*: **Read and write** · *Actions*: **Read-only**.
4. Elegí vencimiento (ej. 1 año), generalo y pegalo en el panel. Guardalo en un gestor de contraseñas.

> Cada persona que edite necesita ser colaboradora del repositorio y tener su propio token. Si un token se filtra, borralo desde GitHub y creá otro.

## Tareas frecuentes
| Quiero… | Dónde |
|---|---|
| Publicar una noticia | Novedades → **Nueva novedad**. El resumen es lo que aparece en tarjetas y en Google. |
| Cargar un curso nuevo | Especializaciones → **Nuevo curso**. Elegí disertantes, fecha de inicio y armá el temario por módulos. |
| El "¡Nuevo!" de un curso | Es automático: dura 6 meses desde **Publicado el** (se completa solo al crear el curso; si querés, cambiá la fecha). |
| Sumar una conferencia pasada a un curso | Abrí el curso → **Conferencias pasadas** → **+ Conferencia**: título, fecha y link a la grabación. Se listan en la página del curso, de la más nueva a la más vieja. |
| Ocultar un curso sin borrarlo | Desactivá **Publicado**. |
| Agregar un disertante | Disertantes → **Nuevo disertante** → pestaña **Currículum normalizado**. |
| Cerrar/abrir inscripciones | Configuración → Datos del instituto → Inscripciones. |
| Mostrar los aranceles | Configuración → Aranceles → activar **Página visible**. |
| Cambiar un teléfono | Configuración → Datos del instituto → Teléfonos por área. |

## Currículums normalizados
Todos los CV tienen las **mismas secciones en el mismo orden**: Formación académica, Antecedentes docentes, Experiencia profesional, Cargos de gestión, Investigación y publicaciones, Congresos y disertaciones, Premios, Vínculo con la comunidad, Capacitación continua, Idiomas y Otros. Cada antecedente tiene: *Período · Título/cargo · Institución · Detalle*. Las secciones vacías no se muestran y los antecedentes se ordenan solos del más reciente al más antiguo. Cada CV tiene su página (`/disertantes/nombre`) y un botón para descargarlo en PDF con formato A4 uniforme.

**Nunca cargar** DNI, fecha de nacimiento, domicilio, estado civil ni teléfonos personales (Ley 25.326).

## Imágenes
Subí la foto que tengas: el panel la recorta (retratos → cuadrado), la achica y la convierte a WebP. No hace falta optimizarla antes.

## Si algo sale mal
- **"El token no es válido"** → venció o se borró: creá uno nuevo.
- **El deploy falló** (indicador rojo) → el contenido tiene algún error de formato. Tocá el indicador para ver el detalle en GitHub o avisá al equipo técnico; el sitio sigue mostrando la versión anterior, nunca queda caído.
- **Me equivoqué y ya publiqué** → editá y volvé a publicar. Todo cambio queda en el historial de GitHub y se puede revertir.
