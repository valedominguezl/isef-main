/**
 * Certificados del I.S.E.F. San Luis — Apps Script publicado como aplicación web desde adriandomnguez@gmail.com.
 *
 * Lo llama SOLO el Worker de isefsanluis.net (con la clave compartida). Hace tres cosas:
 *   1. Lee las respuestas de los Google Forms desde su planilla de respuestas (nombre, DNI, mail y nota).
 *   2. Manda cada certificado por Gmail con el PDF adjunto (lo arma el panel /admin).
 *   3. Guarda la firma escaneada del rector y el sello del instituto (los sube el panel; no están en el
 *      repositorio público).
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
        return salida(respuestas(p.form, p.fresco === true));
      case 'emitidos':
        return salida({ emitidos: emitidos(p.form) });
      case 'emitir':
        return salida(emitir(p.emision));
      case 'verificar':
        return salida(verificar(p.codigo));
      case 'agregar':
        agregar(p.persona);
        return salida({ ok: true });
      case 'quitar':
        quitar(p.formulario, p.clave);
        return salida({ ok: true });
      case 'firma':
        return salida({ png: leerImagen('FIRMA') });
      case 'guardarFirma':
        guardarImagen('FIRMA', p.png);
        return salida({ ok: true });
      case 'sello':
        return salida({ png: leerImagen('SELLO') });
      case 'guardarSello':
        guardarImagen('SELLO', p.png);
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

/*
 * Se leen de la PLANILLA de respuestas del formulario (una sola lectura, 1–2 s). Leer respuesta por respuesta
 * con FormApp tarda más de un minuto con 20 personas. Si el formulario no tiene planilla vinculada, se crea una
 * (Google la llena con todas las respuestas anteriores).
 */

/** ID de un link de Forms, sea el de edición (/d/ID) o el publicado (/d/e/ID). */
function idDeForm(url) {
  const m = String(url || '').match(/\/d\/(?:e\/)?([\w-]+)/);
  return m ? m[1] : '';
}

function planillaDeRespuestas(form) {
  let id = null;
  try {
    if (form.getDestinationType() === FormApp.DestinationType.SPREADSHEET) id = form.getDestinationId();
  } catch (e) {
    id = null;
  }
  if (!id) {
    const ss = SpreadsheetApp.create('Respuestas — ' + (form.getTitle() || 'formulario de certificados'));
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    SpreadsheetApp.flush();
    id = ss.getId();
  }
  const ss = SpreadsheetApp.openById(id);
  const publicado = idDeForm(form.getPublishedUrl());
  const editado = form.getId();
  const hojas = ss.getSheets();
  for (let k = 0; k < hojas.length; k++) {
    const f = idDeForm(hojas[k].getFormUrl());
    if (f && (f === publicado || f === editado)) return hojas[k];
  }
  // Recién vinculada: la hoja puede tardar un instante en marcarse
  return hojas[0];
}

const RE_PUNTAJE = /puntuaci|puntaje|score/i;
const RE_MAIL_COL = /correo|e-?mail/i;

/*
 * Lo que no cambia de un formulario (título, si es cuestionario, dónde está su planilla y la clave de corrección)
 * queda en caché 6 horas: así cada carga lee solo la planilla, sin abrir el formulario (que es lo lento).
 * «Actualizar» en el panel lo vuelve a leer.
 */
function infoDelForm(formId, fresco) {
  const cache = CacheService.getScriptCache();
  const k = 'form2-' + formId;
  const guardada = fresco ? null : cache.get(k);
  if (guardada) return JSON.parse(guardada);
  const form = FormApp.openById(formId);
  const hojaResp = planillaDeRespuestas(form);
  const quiz = form.isQuiz();
  // Clave de corrección: preguntas de opción múltiple, casillas y desplegables con puntaje y respuesta correcta
  const preguntas = [];
  let conPuntos = 0;
  const tipos = [];
  form.getItems().forEach(function (i) {
    const tipo = String(i.getType());
    tipos.push(tipo);
    if (!quiz) return;
    const it = tipo === 'MULTIPLE_CHOICE' ? i.asMultipleChoiceItem() : tipo === 'CHECKBOX' ? i.asCheckboxItem() : tipo === 'LIST' ? i.asListItem() : null;
    if (!it) return;
    const puntos = it.getPoints() || 0;
    if (!puntos) return;
    conPuntos++;
    const correctas = [];
    it.getChoices().forEach(function (c) {
      if (c.isCorrectAnswer()) correctas.push(String(c.getValue()).trim());
    });
    if (correctas.length) preguntas.push({ titulo: i.getTitle().trim(), puntos: puntos, correctas: correctas, varias: tipo === 'CHECKBOX' });
  });
  const info = {
    titulo: form.getTitle(),
    quiz: quiz,
    mail: form.collectsEmail(),
    planilla: hojaResp.getParent().getId(),
    hoja: hojaResp.getSheetId(),
    clave: quiz
      ? {
          preguntas: preguntas,
          maximo: preguntas.reduce(function (t, x) {
            return t + x.puntos;
          }, 0),
        }
      : null,
    tipos: tipos,
    conPuntos: conPuntos,
  };
  try {
    cache.put(k, JSON.stringify(info), 21600);
  } catch (e) {
    /* demasiado grande para la caché: se recalcula cada vez */
  }
  return info;
}

/** Puntaje de una fila según la clave (como Forms: todo o nada por pregunta). */
function corregir(clave, campos) {
  let total = 0;
  clave.preguntas.forEach(function (p) {
    const r = String(campos[p.titulo] == null ? '' : campos[p.titulo]).trim();
    if (!r) return;
    const ok = p.varias
      ? r === p.correctas.join(', ') ||
        (p.correctas.every(function (c) {
          return r.indexOf(c) >= 0;
        }) &&
          r.split(', ').length === p.correctas.length)
      : p.correctas.indexOf(r) >= 0;
    if (ok) total += p.puntos;
  });
  return total;
}

function respuestas(formId, fresco) {
  const info = infoDelForm(formId, fresco);
  const ss = SpreadsheetApp.openById(info.planilla);
  const hojaResp =
    ss.getSheets().filter(function (h) {
      return h.getSheetId() === info.hoja;
    })[0] || ss.getSheets()[0];
  const valores = hojaResp.getDataRange().getValues();
  const titulos = (valores[0] || []).map(function (t) {
    return String(t).trim();
  });
  // Columna 0 = marca temporal; las de mail y puntuación las agrega Google según el formulario
  const colPuntaje = titulos.findIndex(function (t) {
    return RE_PUNTAJE.test(t);
  });
  const colMail = info.mail
    ? titulos.findIndex(function (t, k) {
        return k > 0 && RE_MAIL_COL.test(t);
      })
    : -1;
  const preguntas = titulos.filter(function (t, k) {
    return k > 0 && k !== colPuntaje && t;
  });
  // La columna de puntuación puede no estar (planilla vinculada antes de activar el cuestionario) o venir vacía
  // (calificaciones «para publicar más tarde»): en esos casos se corrige acá con la clave del cuestionario.
  const clave = info.clave;
  const lista = [];
  for (let n = 1; n < valores.length; n++) {
    const fila = valores[n];
    if (!(fila[0] instanceof Date)) continue; // fila vacía
    const campos = {};
    titulos.forEach(function (t, k) {
      if (k > 0 && k !== colPuntaje && t) campos[t] = fila[k] instanceof Date ? fila[k].toISOString() : String(fila[k]);
    });
    // «95 / 100» (como lo escribe Forms) o un número suelto
    let puntaje = null;
    let maximo = null;
    if (colPuntaje >= 0) {
      const v = fila[colPuntaje];
      const m = String(v).match(/(-?\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/);
      if (m) {
        puntaje = Number(m[1].replace(',', '.'));
        maximo = Number(m[2].replace(',', '.'));
      } else if (typeof v === 'number' && clave && clave.maximo) {
        puntaje = v;
        maximo = clave.maximo;
      }
    }
    if (puntaje === null && clave && clave.maximo) {
      puntaje = corregir(clave, campos);
      maximo = clave.maximo;
    }
    lista.push({ id: 'fila-' + (n + 1), fecha: fila[0].toISOString(), email: colMail >= 0 ? String(fila[colMail]).trim() : '', puntaje: puntaje, maximo: maximo, campos: campos });
  }
  // Para revisar por qué no sale la nota (sin datos personales)
  const diagnostico = {
    cuestionario: info.quiz,
    columnaPuntaje: colPuntaje >= 0 ? titulos[colPuntaje] : null,
    ejemploPuntaje: colPuntaje >= 0 && valores[1] ? String(valores[1][colPuntaje]) : null,
    preguntasConPuntos: info.conPuntos,
    preguntasConClave: clave ? clave.preguntas.length : null,
    puntajeMaximo: clave ? clave.maximo : null,
    tiposDePregunta: info.tipos,
  };
  return {
    titulo: info.titulo,
    preguntas: preguntas,
    respuestas: lista,
    agregados: agregados(formId),
    emitidos: emitidos(formId),
    cuota: MailApp.getRemainingDailyQuota(),
    diagnostico: diagnostico,
  };
}

/* ───────────────────────── Registro de emitidos ───────────────────────── */

let registroAbierto = null;

function hoja() {
  if (registroAbierto) return registroAbierto;
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
  registroAbierto = ss.getSheetByName(HOJA);
  return registroAbierto;
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

/* ───────────────────────── Personas agregadas a mano ───────────────────────── */
// Quienes no completaron el formulario pero también reciben certificado (hoja «Agregados» del registro).
const AGREGADOS = 'Agregados';

function hojaAgregados() {
  const ss = hoja().getParent();
  let h = ss.getSheetByName(AGREGADOS);
  if (!h) {
    h = ss.insertSheet(AGREGADOS);
    h.appendRow(['Formulario', 'Clave', 'Nombre', 'DNI', 'Email', 'Nota', 'Agregado']);
    h.setFrozenRows(1);
    h.getRange('A:E').setNumberFormat('@');
  }
  return h;
}

function agregados(form) {
  const h = hoja().getParent().getSheetByName(AGREGADOS);
  if (!h) return [];
  return h
    .getDataRange()
    .getValues()
    .slice(1)
    .filter(function (r) {
      return r[0] === form;
    })
    .map(function (r) {
      return { clave: String(r[1]), nombre: r[2], dni: String(r[3]), email: r[4], nota: r[5] === '' ? null : Number(r[5]), fecha: iso(r[6]) };
    });
}

function agregar(p) {
  if (!p || !p.formulario || !p.clave || !p.nombre) throw new Error('Faltan datos de la persona.');
  const h = hojaAgregados();
  const v = h.getDataRange().getValues();
  const fila = [p.formulario, p.clave, p.nombre, p.dni || '', p.email || '', p.nota == null ? '' : p.nota, new Date()];
  for (let k = 1; k < v.length; k++) {
    if (v[k][0] === p.formulario && String(v[k][1]) === p.clave) {
      fila[6] = v[k][6] || fila[6];
      h.getRange(k + 1, 1, 1, fila.length).setValues([fila]);
      return;
    }
  }
  h.appendRow(fila);
}

function quitar(form, clave) {
  const h = hoja().getParent().getSheetByName(AGREGADOS);
  if (!h) return;
  const v = h.getDataRange().getValues();
  for (let k = v.length - 1; k >= 1; k--) if (v[k][0] === form && String(v[k][1]) === clave) h.deleteRow(k + 1);
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

/* ───────────────────────── Firma escaneada y sello ───────────────────────── */
// Se guardan en las propiedades del script, partidas en pedazos (cada propiedad admite ~9 KB).
// `nombre`: 'FIRMA' (la del rector) o 'SELLO' (el del instituto).
const PEDAZO = 8000;

function leerImagen(nombre) {
  const props = PropertiesService.getScriptProperties();
  const n = Number(props.getProperty(nombre + '_PARTES') || 0);
  if (!n) return null;
  let b64 = '';
  for (let i = 0; i < n; i++) b64 += props.getProperty(nombre + '_' + i) || '';
  return b64 || null;
}

function guardarImagen(nombre, b64) {
  const props = PropertiesService.getScriptProperties();
  const antes = Number(props.getProperty(nombre + '_PARTES') || 0);
  for (let i = 0; i < antes; i++) props.deleteProperty(nombre + '_' + i);
  props.deleteProperty(nombre + '_PARTES');
  if (!b64) return;
  if (b64.length > 400000) throw new Error('La imagen es demasiado grande.');
  const partes = {};
  let n = 0;
  for (let i = 0; i < b64.length; i += PEDAZO) partes[nombre + '_' + n++] = b64.slice(i, i + PEDAZO);
  partes[nombre + '_PARTES'] = String(n);
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
