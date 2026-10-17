/**
 * Textos del certificado y del mail, armados a partir de la configuración de la actividad.
 * Los usan el PDF (pdf.ts) y el envío (Envios.tsx): lo que se ve en la vista previa es lo que se manda.
 */
import type { Certificado } from '@/content/schema';
import sitio from '@content/sitio.json';
import { formatDate } from '@/lib/format';

export type Estilo = 'normal' | 'negrita' | 'cursiva';
export interface Tramo {
  texto: string;
  estilo: Estilo;
}

/** «2026-10-13» → «13 de octubre de 2026». */
export const fechaLarga = (iso: string) => formatDate(iso);

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

/** Lo que va entre «comillas» queda en cursiva. */
function conCursivas(texto: string): Tramo[] {
  return texto
    .split(/(«[^»]*»)/)
    .filter(Boolean)
    .map((t) => ({ texto: t, estilo: t.startsWith('«') ? 'cursiva' : 'normal' }));
}

export const notaTexto = (nota: number) => `${Math.round(nota)} %`;

/** Cuerpo del certificado: «aprobó con el 95 % la evaluación de…». */
export function cuerpo(c: Certificado, nota: number | null | undefined): Tramo[] {
  const t: Tramo[] = [];
  const n = (texto: string) => t.push({ texto, estilo: 'normal' });
  const b = (texto: string) => t.push({ texto, estilo: 'negrita' });
  if (c.tipo === 'aprobacion') {
    n('aprobó');
    if (nota != null) {
      n(' con el ');
      b(notaTexto(nota));
    }
    n(' la evaluación de ');
  } else {
    n('asistió a ');
  }
  t.push(...conCursivas(c.actividad.trim()));
  if (c.programa?.trim()) {
    n(`, correspondiente ${alPrograma(c.programa.trim())}`);
    b(c.programa.trim());
  }
  if (c.dictadoPor?.trim()) n(`, dictado por ${conArticulo(c.dictadoPor.trim())}`);
  if (c.cargaHoraria?.trim()) n(`, con una carga horaria de ${c.cargaHoraria.trim()}`);
  n('.');
  return t;
}

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
