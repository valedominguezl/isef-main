/**
 * Certificados del I.S.E.F. San Luis — Apps Script publicado como aplicación web desde adriandomnguez@gmail.com.
 *
 * Lo llama SOLO el Worker de isefsanluis.net (con la clave compartida). Hace tres cosas:
 *   1. Lee las respuestas de los Google Forms (nombre, DNI, mail y nota del cuestionario).
 *   2. Manda cada certificado por Gmail con el PDF adjunto (lo arma el panel /admin).
 *   3. Guarda la firma escaneada del rector (la sube el panel; no está en el repositorio público).
 *   4. Guarda el registro de certificados emitidos en la planilla «Certificados emitidos» (la crea sola),
 *      que también sirve para verificar los códigos en isefsanluis.net/verificar.
 *
 * Instalación paso a paso: docs/CERTIFICADOS.md del repositorio. Gratis (cuota de Gmail: 100 mails por día).
 */

const HOJA = 'Emitidos';
const COLUMNAS = ['Código', 'Formulario', 'Clave', 'Nombre', 'DNI', 'Email', 'Nota', 'Actividad', 'Fecha del certificado', 'Emitido', 'Enviado por mail'];
const ZONA = 'America/Argentina/San_Luis';

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    const clave = PropertiesService.getScriptProperties().getProperty('CLAVE');
    if (!clave || p.clave !== clave) return salida({ error: 'Clave incorrecta.' });
    switch (p.accion) {
      case 'respuestas':
        return salida(respuestas(p.form));
      case 'emitidos':
        return salida({ emitidos: emitidos(p.form) });
      case 'emitir':
        return salida(emitir(p.emision));
      case 'verificar':
        return salida(verificar(p.codigo));
      case 'firma':
        return salida({ png: leerFirma() });
      case 'guardarFirma':
        guardarFirma(p.png);
        return salida({ ok: true });
      default:
        return salida({ error: 'Acción desconocida.' });
    }
  } catch (err) {
    return salida({ error: String((err && err.message) || err) });
  }
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ───────────────────────── Respuestas del formulario ───────────────────────── */

const CON_PUNTOS = {
  MULTIPLE_CHOICE: 'asMultipleChoiceItem',
  CHECKBOX: 'asCheckboxItem',
  LIST: 'asListItem',
  TEXT: 'asTextItem',
  PARAGRAPH_TEXT: 'asParagraphTextItem',
  SCALE: 'asScaleItem',
  DATE: 'asDateItem',
  DATETIME: 'asDateTimeItem',
  TIME: 'asTimeItem',
  DURATION: 'asDurationItem',
};
const SIN_RESPUESTA = ['PAGE_BREAK', 'SECTION_HEADER', 'IMAGE', 'VIDEO'];

function puntosTotales(items) {
  let total = 0;
  items.forEach(function (i) {
    const metodo = CON_PUNTOS[String(i.getType())];
    if (!metodo) return;
    try {
      const item = i[metodo]();
      if (item.getPoints) total += item.getPoints() || 0;
    } catch (e) {
      /* tipo sin puntaje */
    }
  });
  return total;
}

function respuestas(formId) {
  const form = FormApp.openById(formId);
  const items = form.getItems();
  const preguntas = items
    .filter(function (i) {
      return SIN_RESPUESTA.indexOf(String(i.getType())) < 0;
    })
    .map(function (i) {
      return i.getTitle();
    });
  const quiz = form.isQuiz();
  const maximo = quiz ? puntosTotales(items) : null;
  const lista = form.getResponses().map(function (r) {
    const campos = {};
    r.getItemResponses().forEach(function (ir) {
      const v = ir.getResponse();
      campos[ir.getItem().getTitle()] = Array.isArray(v) ? v.join(', ') : String(v);
    });
    let puntaje = null;
    if (quiz) {
      puntaje = r.getGradableItemResponses().reduce(function (s, g) {
        return s + (g.getScore() || 0);
      }, 0);
    }
    return { id: r.getId(), fecha: r.getTimestamp().toISOString(), email: r.getRespondentEmail() || '', puntaje: puntaje, maximo: maximo, campos: campos };
  });
  return { titulo: form.getTitle(), preguntas: preguntas, respuestas: lista, cuota: MailApp.getRemainingDailyQuota() };
}

/* ───────────────────────── Registro de emitidos ───────────────────────── */

function hoja() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('REGISTRO');
  let ss = null;
  if (id) {
    try {
      ss = SpreadsheetApp.openById(id);
    } catch (e) {
      ss = null; // la borraron: se crea otra
    }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Certificados emitidos — I.S.E.F. San Luis (no borrar)');
    props.setProperty('REGISTRO', ss.getId());
    const h = ss.getSheets()[0];
    h.setName(HOJA);
    h.appendRow(COLUMNAS);
    h.setFrozenRows(1);
    h.getRange('A:I').setNumberFormat('@'); // DNI, clave y fecha como texto (que Sheets no los convierta)
  }
  return ss.getSheetByName(HOJA);
}

const iso = function (v) {
  return v instanceof Date ? v.toISOString() : v ? String(v) : null;
};

function emitidos(form) {
  const v = hoja().getDataRange().getValues();
  return v
    .slice(1)
    .filter(function (r) {
      return r[1] === form;
    })
    .map(function (r) {
      return { codigo: r[0], clave: String(r[2]), nombre: r[3], email: r[5], nota: r[6] === '' ? null : Number(r[6]), enviado: iso(r[10]) };
    });
}

function emitir(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (e.mail) {
      if (MailApp.getRemainingDailyQuota() < 1) throw new Error('Gmail ya no deja mandar más mails hoy (límite diario). Seguí mañana.');
      const pdf = Utilities.newBlob(Utilities.base64Decode(e.mail.pdf), 'application/pdf', e.mail.archivo);
      MailApp.sendEmail({ to: e.email, subject: e.mail.asunto, body: e.mail.texto, htmlBody: html(e.mail.texto), attachments: [pdf], name: 'I.S.E.F. San Luis' });
    }
    const h = hoja();
    const v = h.getDataRange().getValues();
    const ahora = new Date();
    let i = -1;
    for (let k = 1; k < v.length; k++) if (v[k][1] === e.formulario && String(v[k][2]) === e.clave) i = k;
    const enviado = e.mail ? ahora : i > 0 ? v[i][10] : '';
    const fila = [e.codigo, e.formulario, e.clave, e.nombre, e.dni, e.email, e.nota == null ? '' : e.nota, e.actividad, e.fecha, ahora, enviado];
    if (i > 0) h.getRange(i + 1, 1, 1, fila.length).setValues([fila]);
    else h.appendRow(fila);
    return { cuota: MailApp.getRemainingDailyQuota() };
  } finally {
    lock.releaseLock();
  }
}

/** Para la página pública /verificar: solo nombre, actividad y fecha (nunca DNI ni mail). */
function verificar(codigo) {
  const v = hoja().getDataRange().getValues();
  for (let k = 1; k < v.length; k++) {
    if (v[k][0] === codigo) {
      const f = v[k][8] instanceof Date ? Utilities.formatDate(v[k][8], ZONA, 'yyyy-MM-dd') : String(v[k][8]);
      return { valido: true, codigo: codigo, nombre: v[k][3], actividad: v[k][7], fecha: f };
    }
  }
  return { valido: false, codigo: codigo };
}

/* ───────────────────────── Firma escaneada ───────────────────────── */
// Se guarda en las propiedades del script, partida en pedazos (cada propiedad admite ~9 KB).
const PEDAZO = 8000;

function leerFirma() {
  const props = PropertiesService.getScriptProperties();
  const n = Number(props.getProperty('FIRMA_PARTES') || 0);
  if (!n) return null;
  let b64 = '';
  for (let i = 0; i < n; i++) b64 += props.getProperty('FIRMA_' + i) || '';
  return b64 || null;
}

function guardarFirma(b64) {
  const props = PropertiesService.getScriptProperties();
  const antes = Number(props.getProperty('FIRMA_PARTES') || 0);
  for (let i = 0; i < antes; i++) props.deleteProperty('FIRMA_' + i);
  props.deleteProperty('FIRMA_PARTES');
  if (!b64) return;
  if (b64.length > 400000) throw new Error('La firma es demasiado grande.');
  const partes = {};
  let n = 0;
  for (let i = 0; i < b64.length; i += PEDAZO) partes['FIRMA_' + n++] = b64.slice(i, i + PEDAZO);
  partes.FIRMA_PARTES = String(n);
  props.setProperties(partes);
}

/** Texto del mail → HTML simple (con los links clickeables). */
function html(texto) {
  const esc = String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const conLinks = esc.replace(/https?:\/\/[^\s<]+/g, function (u) {
    return '<a href="' + u + '">' + u + '</a>';
  });
  return '<div style="font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#1F1B3A">' + conLinks.replace(/\n/g, '<br>') + '</div>';
}

/** Correr UNA vez a mano desde el editor: pide los permisos y crea la planilla del registro. */
function probar() {
  hoja();
  Logger.log('Listo. Mails disponibles hoy: ' + MailApp.getRemainingDailyQuota());
  Logger.log('Registro: ' + SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('REGISTRO')).getUrl());
  if (!PropertiesService.getScriptProperties().getProperty('CLAVE')) Logger.log('FALTA la propiedad CLAVE (Configuración del proyecto → Propiedades del script).');
}
