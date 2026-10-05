/**
 * Importación de currículum (PDF o texto pegado): descarta datos personales y reparte el resto en las
 * secciones normalizadas del sitio, con IA si está disponible (Worker) o con reglas si no.
 * pdf.js se carga solo al usarla. El resultado es un borrador: se revisa en el formulario antes de guardar.
 */
import { CV_SECCIONES, type CvSeccionTipo } from '@/content/constants';
import { isAbort, type CvIa } from './api';

export interface CvItemDraft {
  periodo?: string;
  titulo: string;
  institucion?: string;
  detalle?: string;
}
export interface CvDraft {
  resumen?: string;
  secciones: { tipo: CvSeccionTipo; titulo?: string; items: CvItemDraft[] }[];
}

/** Palabras con las que empieza el título de cada sección en los CV más comunes (CVar, SIGEVA, formatos libres). */
const HEADINGS: [CvSeccionTipo, RegExp][] = [
  ['formacion', /^(formaci[oó]n( acad[eé]mica| de grado| de posgrado)?|estudios|t[ií]tulos|educaci[oó]n)\b/i],
  ['docencia', /^(antecedentes docentes|docencia|cargos docentes|experiencia docente|actividad docente)\b/i],
  ['experiencia', /^(experiencia( profesional| laboral)?|antecedentes (profesionales|laborales)|actividad profesional|trayectoria)\b/i],
  ['gestion', /^(gesti[oó]n|cargos (de gesti[oó]n|directivos)|antecedentes de gesti[oó]n)\b/i],
  ['investigacion', /^(investigaci[oó]n|publicaciones|producci[oó]n cient[ií]fica|art[ií]culos|libros|proyectos)\b/i],
  ['eventos', /^(congresos|jornadas|seminarios|conferencias|disertaciones|ponencias|eventos|participaci[oó]n en (congresos|eventos))\b/i],
  ['distinciones', /^(premios|distinciones|reconocimientos|becas)\b/i],
  ['comunidad', /^(extensi[oó]n|v[ií]nculo con la comunidad|actividades (de extensi[oó]n|comunitarias|sociales)|voluntariado|antecedentes (comunitarios|sociales|pol[ií]ticos))\b/i],
  ['capacitacion', /^(capacitaci[oó]n|cursos|formaci[oó]n complementaria|perfeccionamiento|talleres)\b/i],
  ['idiomas', /^(idiomas|lenguas|conocimiento de idiomas)\b/i],
];

/** Subtítulos internos que no son antecedentes ("Carrera de grado", "Carrera de posgrado"…). */
const SUBHEADING = /^(carrera(s)? de (grado|pos ?grado)|nivel (secundario|terciario|universitario)|posgrados?|grado)$/i;

/**
 * Líneas con datos personales que nunca se publican. Los rótulos exigen ":" o "." detrás
 * ("Edad: 45"), para no descartar antecedentes como "Actividad física en la tercera edad" o "biología celular".
 */
const PERSONAL =
  /(\b(dni|d\.n\.i|cuil|cuit|pasaporte)\b|@[\w-]+\.|\+54[\d\s-]{8,}|\(\s*\d{2,4}\s*\)\s*\d{5,8}|\b(tel[eé]fono|tel|cel(ular)?|whatsapp|m[oó]vil|domicilio|direcci[oó]n( particular)?|edad|nacionalidad|estado civil|lugar de nacimiento|fecha de nacimiento|f\.?\s*de\s*nac)\s*[:.]|\bdir\.\s*(real|legal)|^\s*datos personales\s*:?\s*$)/i;

const YEAR = '(?:19|20)\\d{2}';
const PERIOD = new RegExp(`^\\(?((?:${YEAR})(?:\\s*[-–/a]\\s*(?:${YEAR}|actualidad|presente|hoy|la fecha))?)\\)?[\\s.:–-]*`, 'i');
const PERIOD_END = new RegExp(`[\\s,(–-]*\\(?((?:${YEAR})(?:\\s*[-–/a]\\s*(?:${YEAR}|actualidad|presente|hoy))?)\\)?\\.?$`, 'i');
const PERIOD_ONLY = new RegExp(`^\\(?(?:${YEAR}(?:\\s*[-–/a]\\s*(?:${YEAR}|actualidad|presente|hoy))?|actualmente|actualidad|en curso)\\)?$`, 'i');
const BULLET = /^([•·▪◦●○■□➢►\-–*]|\d{1,2}[.)])\s+/;

const normalizeHeading = (t: string) =>
  t
    .replace(/^[\d.\sIVX]+[-.)]\s*/, '') // "3. ", "IV - "
    .replace(/[:.]$/, '')
    .trim();

function headingOf(line: string): CvSeccionTipo | null {
  // Un título es corto, sin años y sin punto final
  if (line.length > 70 || /\d{4}/.test(line) || /\.$/.test(line.trim())) return null;
  const t = normalizeHeading(line).toLowerCase();
  for (const [tipo, re] of HEADINGS) if (re.test(t)) return tipo;
  return null;
}

/** Texto del PDF agrupado en líneas (por posición vertical), en orden de lectura. */
export async function pdfLines(file: File): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const doc = await task.promise;
  const lines: string[] = [];
  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const rows = new Map<number, { x: number; s: string }[]>();
      for (const it of content.items) {
        if (!('str' in it) || !it.str.trim()) continue;
        const y = Math.round(it.transform[5] / 3) * 3; // tolerancia de 3pt para la misma línea
        const row = rows.get(y) ?? [];
        row.push({ x: it.transform[4], s: it.str });
        rows.set(y, row);
      }
      [...rows.entries()]
        .sort((a, b) => b[0] - a[0])
        .forEach(([, row]) => lines.push(row.sort((a, b) => a.x - b.x).map((r) => r.s).join(' ').replace(/\s+/g, ' ').trim()));
    }
  } finally {
    await task.destroy(); // libera el worker de pdf.js
  }
  return lines.filter(Boolean);
}

/** Formato "año en su renglón + título + institución + detalle" (muy común en CV argentinos). */
function blockItems(lines: string[]): CvItemDraft[] {
  const out: CvItemDraft[] = [];
  let cur: { periodo: string; rest: string[] } | null = null;
  const flush = () => {
    if (!cur || !cur.rest.length) return;
    const [titulo, institucion, ...detalle] = cur.rest;
    const per = /^\d/.test(cur.periodo) ? cur.periodo.replace(/\s*[-–/a]\s*/i, ' – ') : 'Actualidad';
    out.push({ periodo: per, titulo, ...(institucion ? { institucion } : {}), ...(detalle.length ? { detalle: detalle.join(' ') } : {}) });
  };
  for (const l of lines) {
    if (SUBHEADING.test(l)) continue;
    if (PERIOD_ONLY.test(l)) {
      flush();
      cur = { periodo: l.replace(/[()]/g, ''), rest: [] };
      continue;
    }
    if (!cur) {
      out.push(toItem(l));
      continue;
    }
    // Un renglón que continúa el anterior (empieza en minúscula o el anterior quedó abierto) se une
    const prev = cur.rest[cur.rest.length - 1];
    if (prev && (/^[a-záéíóúñ(“"]/.test(l) || /\b(de|del|la|las|los|en|y|e|para|a)$/i.test(prev) || /[-–,]$/.test(prev))) cur.rest[cur.rest.length - 1] = `${prev} ${l}`;
    else cur.rest.push(l);
  }
  flush();
  return out;
}

function toItem(text: string): CvItemDraft {
  let t = text.replace(BULLET, '').trim();
  let periodo: string | undefined;
  const start = t.match(PERIOD);
  if (start) {
    periodo = start[1];
    t = t.slice(start[0].length);
  } else {
    const end = t.match(PERIOD_END);
    if (end && end.index! > 10) {
      periodo = end[1];
      t = t.slice(0, end.index);
    }
  }
  t = t.replace(/[\s,;.–-]+$/, '').trim();
  // "Título – Institución" / "Título. Institución": la primera parte es el título
  const m = t.match(/^(.{12,180}?)\s+[–—-]\s+(.{3,})$/) ?? t.match(/^(.{12,180}?)\.\s+(.{3,})$/);
  const out: CvItemDraft = m ? { titulo: m[1].trim(), institucion: m[2].trim() } : { titulo: t };
  if (out.titulo.length > 300) {
    out.detalle = out.titulo.slice(300);
    out.titulo = `${out.titulo.slice(0, 300)}…`;
  }
  if (periodo) out.periodo = periodo.replace(/\s*[-–/a]\s*/i, ' – ');
  return out;
}

/** Elige el formato de la sección: bloques con año en su renglón, o un antecedente por viñeta/oración. */
function itemsOf(lines: string[]): CvItemDraft[] {
  if (lines.filter((l) => PERIOD_ONLY.test(l)).length >= 2) return blockItems(lines);
  const groups: string[][] = [];
  for (const l of lines) {
    if (SUBHEADING.test(l)) continue;
    const last = groups[groups.length - 1];
    // Nuevo antecedente: viñeta, año al principio, o la línea anterior terminó en punto
    if (!last || BULLET.test(l) || PERIOD.test(l) || /[.;]$/.test(last[last.length - 1])) groups.push([l]);
    else last.push(l);
  }
  return groups.map((g) => toItem(g.join(' ')));
}

/** Ordenamiento por reglas (sin IA), a partir de las líneas del CV. */
export function cvFromLines(lines: string[]): { cv: CvDraft; descartadas: number } {
  const secciones = new Map<CvSeccionTipo, string[][]>();
  const intro: string[] = [];
  let current: CvSeccionTipo | null = null;
  let descartadas = 0;

  let prev = '';
  for (const raw of lines) {
    if (PERSONAL.test(raw)) {
      descartadas++;
      continue;
    }
    // Lo que viene justo después de un año es el título de un antecedente, no de una sección
    const h = PERIOD_ONLY.test(prev) ? null : headingOf(raw);
    prev = raw;
    if (h) {
      current = h;
      if (!secciones.has(h)) secciones.set(h, []);
      continue;
    }
    if (!current) {
      intro.push(raw);
      continue;
    }
    secciones.get(current)!.push([raw]);
  }

  const resumen = intro
    .filter((l) => l.length > 40) // descarta nombre, títulos sueltos y encabezados
    .join(' ')
    .slice(0, 600)
    .trim();

  const cv: CvDraft = {
    ...(resumen.length > 80 ? { resumen } : {}),
    secciones: (Object.keys(CV_SECCIONES) as CvSeccionTipo[])
      .filter((t) => secciones.get(t)?.length)
      .map((tipo) => ({ tipo, items: itemsOf(secciones.get(tipo)!.map((g) => g[0])).filter((i) => i.titulo.length > 2) })),
  };
  return { cv, descartadas };
}

const TIPOS = Object.keys(CV_SECCIONES) as CvSeccionTipo[];

/** Respuesta de la IA → borrador del currículum: sin textos vacíos, sin secciones vacías y sin datos personales. */
export function cvDesdeIa(r: CvIa): CvDraft {
  const porTipo = new Map<CvSeccionTipo, CvItemDraft[]>();
  for (const s of r.secciones ?? []) {
    const tipo = s.tipo as CvSeccionTipo;
    if (!TIPOS.includes(tipo)) continue;
    for (const it of s.items ?? []) {
      const t = (v?: string) => (typeof v === 'string' ? v.trim() : '');
      const item: CvItemDraft = { titulo: t(it.titulo) };
      if (!item.titulo) continue;
      if (t(it.periodo)) item.periodo = t(it.periodo);
      if (t(it.institucion)) item.institucion = t(it.institucion);
      if (t(it.detalle)) item.detalle = t(it.detalle);
      if (Object.values(item).some((v) => PERSONAL.test(v))) continue;
      porTipo.set(tipo, [...(porTipo.get(tipo) ?? []), item]);
    }
  }
  const resumen = typeof r.resumen === 'string' ? r.resumen.trim() : '';
  return {
    ...(resumen ? { resumen } : {}),
    secciones: TIPOS.filter((t) => porTipo.has(t)).map((tipo) => ({ tipo, items: porTipo.get(tipo)! })),
  };
}

/** Líneas de un texto pegado (sin renglones vacíos). */
export const textLines = (texto: string) =>
  texto
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

/**
 * Ordena un CV: primero con IA (sin las líneas con datos personales, que nunca salen del navegador);
 * si la IA no está disponible o falla, con las reglas de siempre. Solo una cancelación corta el proceso.
 */
export async function ordenarCv(lines: string[], ia: (texto: string) => Promise<CvIa>): Promise<{ cv: CvDraft; descartadas: number; conIa: boolean }> {
  const limpias = lines.filter((l) => !PERSONAL.test(l));
  try {
    const cv = cvDesdeIa(await ia(limpias.join('\n')));
    if (cv.secciones.length) return { cv, descartadas: lines.length - limpias.length, conIa: true };
  } catch (e) {
    if (isAbort(e)) throw e;
  }
  return { ...cvFromLines(lines), conIa: false };
}
