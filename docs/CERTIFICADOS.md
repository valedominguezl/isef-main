# Certificados

Reemplaza a Certify'em. Todo se maneja desde **/admin → Certificados**:

1. Se crea una actividad con el link del Google Form y el texto del certificado.
2. En la pestaña **Personas y envíos** aparecen los que completaron el formulario (una fila por DNI, con su mejor intento).
3. Desde ahí se puede ver, corregir, descargar o enviar el certificado. Se manda a una persona o a todos los pendientes.

## Cómo funciona

```
/admin (navegador)  ──▶  Worker de Cloudflare  ──▶  Apps Script (cuenta adriandomnguez@gmail.com)
arma el PDF              /api/certificados/*        lee el Form · manda el mail con Gmail
                         (la clave queda acá)       · anota el registro en una planilla
```

- **El PDF** se genera en el navegador (`src/admin/certificados/pdf.ts`), con las tipografías del sitio. Lo que se ve en la vista previa es exactamente lo que se manda.
- **Los datos personales** (nombre, DNI, mail) nunca entran al repositorio, que es público. Quedan en el Form y en la planilla «Certificados emitidos — I.S.E.F. San Luis (no borrar)», en el Drive de esa cuenta. En `content/certificados/` solo se guarda la configuración de cada actividad.
- **El límite de Gmail** con una cuenta común es de 100 mails por día. "Enviar a todos" se corta al llegar al límite y los que faltan quedan pendientes para el día siguiente.
- **La verificación** funciona así: cada certificado lleva un código `ISEF-XXXX-XXXX` (al azar, no se puede adivinar) y un QR que lleva a `isefsanluis.net/verificar?c=…`. Esa página muestra nombre, actividad y fecha, nunca el DNI ni el mail.
- **Si se reenvía**, el certificado mantiene el mismo código.
- **Personas que no completaron el formulario:** se suman con «Agregar persona» y quedan en la hoja «Agregados» de la planilla de registro.
- **Las correcciones a mano** (nombre con tildes, nota, mail) se guardan en el navegador de quien las hace. El formulario no se modifica.

## Instalación (una sola vez, unos 10 minutos)

### 1. El Apps Script (con la cuenta adriandomnguez@gmail.com)

1. Entrar a <https://script.google.com> con **adriandomnguez@gmail.com** y hacer clic en **Nuevo proyecto**. Ponerle de nombre «Certificados ISEF».
2. Borrar lo que haya en `Código.gs` y pegar el contenido de [`apps-script/certificados/Codigo.gs`](../apps-script/certificados/Codigo.gs).
3. Ir a ⚙️ **Configuración del proyecto** y tildar «Mostrar el archivo de manifiesto "appsscript.json"». Volver al editor, abrir `appsscript.json` y reemplazarlo por [`apps-script/certificados/appsscript.json`](../apps-script/certificados/appsscript.json).
4. En ⚙️ **Configuración del proyecto → Propiedades del script**, agregar la propiedad `CLAVE` con una clave larga al azar. Se puede generar con:
   ```
   node -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
   ```
   Guardar esa clave: se usa en el paso 2.
5. En el editor, elegir la función `probar` y hacer clic en **Ejecutar**.
   - Google pide permisos: Revisar permisos → elegir la cuenta → «Google no verificó esta app» → **Configuración avanzada → Ir a Certificados ISEF** → Permitir.
   - El registro de ejecución tiene que decir «Listo. Mails disponibles hoy: 100» y mostrar el link de la planilla del registro.
6. Ir a **Implementar → Nueva implementación**, tipo **Aplicación web**:
   - Ejecutar como: **Yo (adriandomnguez@gmail.com)**
   - Quién tiene acceso: **Cualquier usuario**
   - Hacer clic en **Implementar** y copiar la **URL de la aplicación web** (termina en `/exec`).

> "Cualquier usuario" es necesario para que el Worker pueda llamarlo. Sin la `CLAVE` el script no responde nada útil.

### 2. Los secretos del Worker (Cloudflare)

Ir a Cloudflare → **Workers & Pages → isef-sanluis → Settings → Variables and Secrets** y agregar dos secretos de tipo *Secret*:

| Nombre | Valor |
|---|---|
| `CERT_SCRIPT_URL` | la URL `/exec` del paso 6 |
| `CERT_SCRIPT_KEY` | la misma `CLAVE` del paso 4 |

También se puede hacer desde la terminal: `npx wrangler secret put CERT_SCRIPT_URL` y `npx wrangler secret put CERT_SCRIPT_KEY`.

### 3. Probar

En /admin → Certificados → la actividad → **Personas y envíos** tienen que aparecer las respuestas del Form. Para probar el mail, enviarse uno a sí mismo: poner el propio mail con «Corregir datos» y después hacer clic en «Enviar por mail».

## Cambios en el Apps Script

Si se modifica `Codigo.gs`, hay que pegarlo de nuevo en el editor y publicar con **Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar**. Así la URL no cambia y no hace falta tocar Cloudflare.

## Firma escaneada

Se sube en /admin → Certificados → una actividad → **Datos del certificado → Subir firma** (vale para todos los certificados).

- **Fondo:** el panel le saca el fondo solo. Si la tinta es azul, se queda únicamente con el trazo azul, así desaparece el texto impreso que lo cruza.
- **Dónde se guarda:** en las propiedades del Apps Script, no en el repositorio (que es público).
- **Calidad:** conviene un escaneo de buena resolución (al menos 800 px de ancho).

## Sello del instituto

Se sube en el mismo lugar: **Datos del certificado → Subir sello** (vale para todos los certificados). Sale a la izquierda de la firma, montado apenas sobre el comienzo de la línea, en tinta violeta.

- **Fondo:** el panel le saca el fondo solo (lo oscuro queda como tinta; sirve una foto o una fotocopia).
- **Dónde se guarda:** igual que la firma, en las propiedades del Apps Script.
- **Requisito:** el `Codigo.gs` tiene que tener las acciones `sello` y `guardarSello` (versión del 19/10/2026). Con un script anterior el panel avisa «Para usar el sello hay que actualizar el Apps Script» y los certificados salen sin sello, sin tocar la firma.

## Desarrollo local

En `npm run dev` la sección usa datos de ejemplo, porque en local no hay Worker ni Google. La firma y el sello de prueba quedan en el navegador.

## Pendiente

- **Sello del instituto:** todavía no está.
