/**
 * Textos del certificado y del mail, armados a partir de la configuración de la actividad.
 * Los usan el PDF (pdf.ts) y el envío (Envios.tsx): lo que se ve en la vista previa es lo que se manda.
 */
import type { Certificado } from '@/content/schema';
import sitio from '@content/sitio.json';

export type Estilo = 'normal' | 'negrita' | 'cursiva' | 'negritaCursiva';
export interface Tramo {
  texto: string;
  estilo: Estilo;
}

/** «17012491» → «17.012.491»; si no son solo números, queda como vino. */
export function formatoDni(dni: string) {
  const n = dni.replace(/[\s.-]/g, '');
  return /^\d{6,9}$/.test(n) ? n.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : dni.trim();
}

/** «Dr. Roberto Rosler» → «el Dr. Roberto Rosler» (sin artículo si no tiene título). */
function conArticulo(nombre: string) {
  if (/^(Dra|Lic\.?\s?a|Licda|Profa|Prof\.?\s?a|Mgtr\.?\s?a|Ing\.?\s?a)\b/i.test(nombre)) return `la ${nombre}`;
  if (/^(Dr|Lic|Prof|Mg|Mgtr|Ing|Esp)\b/i.test(nombre)) return `el ${nombre}`;
  return nombre;
}

/** «Curso…» → «al Curso…»; «Jornada…» → «a la Jornada…». */
function alPrograma(programa: string) {
  return /^(jornada|diplomatura|especializaci|capacitaci|conferencia|tecnicatura|clase|charla|formaci)/i.test(programa) ? `a la ` : 'al ';
}

export const notaTexto = (nota: number) => `${Math.round(nota)}%`;

/** «la clase teórica «La atención…»» → con comillas “ ” como en el certificado original. */
const comillas = (t: string) => t.replace(/«/g, '“').replace(/»/g, '”');

/** Resoluciones que van debajo del nombre del instituto si la actividad no indica otras. */
export const RESOLUCION = 'Resolución N.º 04-ME-2022 · Resolución Ministerial Nacional N.º 324/2023';

/** «El rector del Instituto Superior de Educación Física “San Luis”, Dr. Antonino Merenda, certifica que:» */
export const encabezado = (c: Certificado) => `El ${c.cargo.trim().toLowerCase()} del Instituto Superior de Educación Física “San Luis”, ${c.firmante.trim()}, certifica que:`;

/**
 * Bloque de abajo, igual al certificado de siempre:
 * «D.N.I.: 17.012.491, ha asistido a la clase teórica “La atención en los alumnos”, correspondiente al
 *  *Curso Internacional de Neuroeducación*, dictado por el Dr. Roberto Rosler, habiendo aprobado con el 95%.»
 */
export function cuerpo(c: Certificado, dni: string | undefined, nota: number | null | undefined): Tramo[] {
  const t: Tramo[] = [];
  const n = (texto: string) => t.push({ texto, estilo: 'normal' });
  const b = (texto: string, estilo: Estilo = 'negrita') => t.push({ texto, estilo });
  if (dni?.trim()) {
    n('D.N.I.: ');
    b(formatoDni(dni));
    n(', ha asistido a ');
  } else n('Ha asistido a ');
  n(comillas(c.actividad.trim()));
  if (c.programa?.trim()) {
    n(`, correspondiente ${alPrograma(c.programa.trim())}`);
    b(c.programa.trim(), 'negritaCursiva');
  }
  if (c.dictadoPor?.trim()) n(`, dictado por ${conArticulo(c.dictadoPor.trim())}`);
  if (c.cargaHoraria?.trim()) n(`, con una carga horaria de ${c.cargaHoraria.trim()}`);
  if (c.tipo === 'aprobacion') {
    if (nota != null) {
      n(', habiendo aprobado con el ');
      b(notaTexto(nota));
    } else n(', habiendo aprobado la evaluación');
  }
  n('.');
  return t;
}

/** «2026-10-13» → «13-10-2026» (como en el certificado original). */
export const fechaCorta = (iso: string) => iso.split('-').reverse().join('-');

export const titulo = (c: Certificado) => (c.tipo === 'aprobacion' ? 'Certificado de aprobación' : 'Certificado de asistencia');

export const urlVerificacion = (codigo: string) => `${sitio.url.replace(/\/$/, '')}/verificar?c=${encodeURIComponent(codigo)}`;

/** Código corto, al azar y sin letras que se confundan (no se puede adivinar el de otra persona). */
export function nuevoCodigo() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = crypto.getRandomValues(new Uint8Array(8));
  const s = Array.from(r, (x) => abc[x % abc.length]).join('');
  return `ISEF-${s.slice(0, 4)}-${s.slice(4)}`;
}

export const nombreArchivo = (nombre: string) =>
  `Certificado - ${nombre}`
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s.-]/g, '')
    .trim() + '.pdf';

export const ASUNTO = 'Tu certificado: {actividad}';
export const MENSAJE =
  'Hola, {nombre}:\n\nTe enviamos adjunto tu certificado de {actividad}.\n\nPodés verificarlo en cualquier momento con el código {codigo} en {verificar}\n\nSaludos,\nInstituto Superior de Educación Física «San Luis»';

/** Reemplaza {nombre}, {actividad}, {codigo}, {verificar} en el asunto y el mensaje del mail. */
export function completar(plantilla: string, c: Certificado, nombre: string, codigo: string) {
  const actividad = c.programa?.trim() || c.actividad.replace(/[«»]/g, '');
  return plantilla
    .replaceAll('{nombre}', nombre.split(' ')[0] ?? nombre)
    .replaceAll('{nombreCompleto}', nombre)
    .replaceAll('{actividad}', actividad)
    .replaceAll('{codigo}', codigo)
    .replaceAll('{verificar}', urlVerificacion(codigo));
}
