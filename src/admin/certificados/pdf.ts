/**
 * Arma el PDF del certificado en el navegador (A4 apaisado, vectorial, con las tipografías del sitio).
 * Diseño: marco índigo con trama fina, escudo, nombre protagonista, QR de verificación y firma del rector.
 * Se carga solo cuando se abre la sección Certificados (pdf-lib + fuentes ≈ 1 MB).
 */
import { PDFDocument, rgb, setCharacterSpacing, degrees, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { encode } from 'uqr';
import type { Certificado } from '@/content/schema';
import logoUrl from '@/assets/logo.webp';
import merriLight from './fonts/merriweather-latin-300-normal.ttf?url';
import merriLightItalic from './fonts/merriweather-latin-300-italic.ttf?url';
import merriItalic from './fonts/merriweather-latin-400-italic.ttf?url';
import merriBold from './fonts/merriweather-latin-700-normal.ttf?url';
import franklin from './fonts/libre-franklin-latin-400-normal.ttf?url';
import franklinSemi from './fonts/libre-franklin-latin-600-normal.ttf?url';
import { cuerpo, fechaLarga, formatoDni, titulo, urlVerificacion, type Tramo } from './texto';

export interface DatosCertificado {
  nombre: string;
  dni?: string;
  nota?: number | null;
  codigo: string;
}

/* ── Medidas (mm → puntos) y colores del diseño ── */
const MM = 72 / 25.4;
const W = 297 * MM;
const H = 210 * MM;
const hex = (h: string): RGB => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const C = {
  papel: hex('#FCFAF5'),
  indigo: hex('#3C3182'),
  violeta: hex('#5B46E0'),
  oro: hex('#B08D57'),
  tinta: hex('#1F1B3A'),
  gris: hex('#5E5A73'),
};

/* ── Recursos (se bajan una vez y quedan en memoria) ── */
type Recursos = { fuentes: Record<string, ArrayBuffer>; logo: ArrayBuffer; marca: ArrayBuffer };
let recursos: Promise<Recursos> | null = null;

const bajar = async (url: string) => (await fetch(url)).arrayBuffer();

/** El logo es WebP (pdf-lib solo acepta PNG/JPG): se convierte acá. `gris` = para la marca de agua. */
async function logoPng(gris: boolean): Promise<ArrayBuffer> {
  const img = await createImageBitmap(await (await fetch(logoUrl)).blob());
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  if (gris) ctx.filter = 'grayscale(1)';
  ctx.drawImage(img, 0, 0);
  const blob = await new Promise<Blob>((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo preparar el logo'))), 'image/png'));
  return blob.arrayBuffer();
}

function cargarRecursos() {
  recursos ??= (async () => {
    const entradas = Object.entries({ merriLight, merriLightItalic, merriItalic, merriBold, franklin, franklinSemi });
    const [bytes, logo, marca] = await Promise.all([Promise.all(entradas.map(([, u]) => bajar(u))), logoPng(false), logoPng(true)]);
    return { fuentes: Object.fromEntries(entradas.map(([k], i) => [k, bytes[i]])), logo, marca };
  })().catch((e) => {
    recursos = null; // que el próximo intento vuelva a bajar
    throw e;
  });
  return recursos;
}

/* ── Ayudas de dibujo ── */
type Fuentes = Record<'merriLight' | 'merriLightItalic' | 'merriItalic' | 'merriBold' | 'franklin' | 'franklinSemi', PDFFont>;

/** y en mm desde arriba (como en el diseño) → y del PDF (desde abajo). */
const Y = (mm: number) => H - mm * MM;

interface TextoOpts {
  font: PDFFont;
  size: number;
  color: RGB;
  /** Espaciado entre letras en em (como letter-spacing de CSS). */
  tracking?: number;
  /** Ancho máximo en mm: si no entra, se achica la letra. */
  max?: number;
}

function anchoTexto(t: string, o: TextoOpts) {
  return o.font.widthOfTextAtSize(t, o.size) + (o.tracking ?? 0) * o.size * Math.max(t.length - 1, 0);
}

/** Texto centrado en x (mm) con su línea de base en y (mm). Devuelve el tamaño final. */
function centrado(page: PDFPage, t: string, xMm: number, yMm: number, o: TextoOpts) {
  let size = o.size;
  if (o.max) while (size > 6 && anchoTexto(t, { ...o, size }) > o.max * MM) size -= 0.5;
  const w = anchoTexto(t, { ...o, size });
  const sp = (o.tracking ?? 0) * size;
  if (sp) page.pushOperators(setCharacterSpacing(sp));
  page.drawText(t, { x: xMm * MM - w / 2, y: Y(yMm), size, font: o.font, color: o.color });
  if (sp) page.pushOperators(setCharacterSpacing(0));
  return size;
}

function izquierda(page: PDFPage, t: string, xMm: number, yMm: number, o: TextoOpts) {
  const sp = (o.tracking ?? 0) * o.size;
  if (sp) page.pushOperators(setCharacterSpacing(sp));
  page.drawText(t, { x: xMm * MM, y: Y(yMm), size: o.size, font: o.font, color: o.color });
  if (sp) page.pushOperators(setCharacterSpacing(0));
}

/** Párrafo con negritas y cursivas, cortado en líneas centradas. Devuelve la base de la última línea (mm). */
function parrafo(page: PDFPage, tramos: Tramo[], f: Fuentes, xMm: number, yMm: number, maxMm: number, size: number, interlinea: number) {
  const estilo = { normal: { font: f.merriLight, color: C.tinta }, negrita: { font: f.merriBold, color: C.indigo }, cursiva: { font: f.merriLightItalic, color: C.tinta } };
  const piezas = tramos.flatMap((t) => t.texto.split(/(\s+)/).filter(Boolean).map((texto) => ({ texto: /^\s+$/.test(texto) ? ' ' : texto, ...estilo[t.estilo] })));
  const ancho = (p: (typeof piezas)[number]) => p.font.widthOfTextAtSize(p.texto, size);
  const lineas: (typeof piezas)[] = [[]];
  let actual = 0;
  for (const p of piezas) {
    const linea = lineas[lineas.length - 1];
    if (p.texto === ' ' && !linea.length) continue;
    if (p.texto !== ' ' && actual + ancho(p) > maxMm * MM && linea.length) {
      while (linea.length && linea[linea.length - 1].texto === ' ') linea.pop();
      lineas.push([p]);
      actual = ancho(p);
    } else {
      linea.push(p);
      actual += ancho(p);
    }
  }
  let y = yMm;
  lineas.forEach((linea, i) => {
    y = yMm + i * interlinea;
    let x = xMm * MM - linea.reduce((s, p) => s + ancho(p), 0) / 2;
    for (const p of linea) {
      page.drawText(p.texto, { x, y: Y(y), size, font: p.font, color: p.color });
      x += ancho(p);
    }
  });
  return y;
}

function marco(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.papel });
  // Trama cruzada muy suave entre las dos líneas del marco
  const a = 9.4 * MM;
  const b = 12.6 * MM;
  const banda = b - a;
  const paso = 2.2 * MM;
  const linea = (x1: number, y1: number, x2: number, y2: number) =>
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.4, color: C.indigo, opacity: 0.12 });
  for (let x = a; x + banda <= W - a + 0.01; x += paso) {
    linea(x, H - a, x + banda, H - b); // arriba
    linea(x + banda, H - a, x, H - b);
    linea(x, a, x + banda, b); // abajo
    linea(x + banda, a, x, b);
  }
  for (let y = a; y + banda <= H - a + 0.01; y += paso) {
    linea(a, y, b, y + banda); // izquierda
    linea(a, y + banda, b, y);
    linea(W - b, y, W - a, y + banda); // derecha
    linea(W - b, y + banda, W - a, y);
  }
  page.drawRectangle({ x: 8 * MM, y: 8 * MM, width: W - 16 * MM, height: H - 16 * MM, borderColor: C.indigo, borderWidth: 1.6 });
  page.drawRectangle({ x: 12.6 * MM, y: 12.6 * MM, width: W - 25.2 * MM, height: H - 25.2 * MM, borderColor: C.violeta, borderWidth: 0.6 });
  // Rombos dorados en las esquinas
  const r = 1.25 * MM;
  for (const [x, y] of [
    [15.9, 15.9],
    [297 - 15.9, 15.9],
    [15.9, 210 - 15.9],
    [297 - 15.9, 210 - 15.9],
  ])
    page.drawRectangle({ x: x * MM, y: Y(y) - r * Math.SQRT2 / 2, width: r, height: r, color: C.oro, rotate: degrees(45) });
}

function qr(page: PDFPage, texto: string, xMm: number, yMm: number, ladoMm: number) {
  const { data, size } = encode(texto, { border: 0, ecc: 'M' });
  const m = (ladoMm * MM) / size;
  data.forEach((fila, j) =>
    fila.forEach((on, i) => {
      if (on) page.drawRectangle({ x: xMm * MM + i * m, y: Y(yMm) - (j + 1) * m, width: m + 0.05, height: m + 0.05, color: C.tinta });
    }),
  );
}

/** PDF listo para descargar o adjuntar. `firma`: PNG transparente de la firma del rector (opcional). */
export async function generarCertificado(cert: Certificado, d: DatosCertificado, firma?: ArrayBuffer | null): Promise<Uint8Array> {
  const r = await cargarRecursos();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${titulo(cert)} · ${d.nombre}`);
  pdf.setAuthor('Instituto Superior de Educación Física «San Luis»');
  pdf.setSubject(cert.programa || cert.actividad);
  pdf.setCreator('isefsanluis.net');
  const f = Object.fromEntries(await Promise.all(Object.entries(r.fuentes).map(async ([k, b]) => [k, await pdf.embedFont(b, { subset: true })]))) as Fuentes;
  const [logo, marca] = await Promise.all([pdf.embedPng(r.logo), pdf.embedPng(r.marca)]);
  const page = pdf.addPage([W, H]);
  const cx = 148.5;

  marco(page);
  // Escudo de agua, apenas visible
  page.drawImage(marca, { x: (cx - 60) * MM, y: Y(113.4 + 60), width: 120 * MM, height: 120 * MM, opacity: 0.045 });

  page.drawImage(logo, { x: (cx - 13.5) * MM, y: Y(20 + 27), width: 27 * MM, height: 27 * MM });
  centrado(page, 'Instituto Superior de Educación Física «San Luis»', cx, 59, { font: f.merriBold, size: 17, color: C.indigo, max: 240 });
  centrado(page, 'RESOLUCIÓN N.º 04-ME-2022 · RESOLUCIÓN MINISTERIAL NACIONAL N.º 324/2023 · MINISTERIO DE EDUCACIÓN DE SAN LUIS', cx, 65.5, {
    font: f.franklin,
    size: 7.4,
    color: C.gris,
    tracking: 0.14,
    max: 240,
  });
  // Filete dorado con rombo
  page.drawLine({ start: { x: (cx - 22) * MM, y: Y(73) }, end: { x: (cx + 22) * MM, y: Y(73) }, thickness: 0.6, color: C.oro });
  const rr = 1.6 * MM;
  page.drawRectangle({ x: cx * MM, y: Y(73) - rr * Math.SQRT2 / 2, width: rr, height: rr, color: C.papel, borderColor: C.oro, borderWidth: 0.6, rotate: degrees(45) });

  centrado(page, titulo(cert).toUpperCase(), cx, 85, { font: f.franklinSemi, size: 10, color: C.violeta, tracking: 0.42 });
  centrado(page, `El ${cert.cargo} del Instituto certifica que`, cx, 97, { font: f.merriLightItalic, size: 11.5, color: C.gris });

  const tam = centrado(page, d.nombre, cx, 112, { font: f.merriItalic, size: 33, color: C.tinta, max: 215 });
  const ancho = Math.max(150, f.merriItalic.widthOfTextAtSize(d.nombre, tam) / MM + 12);
  page.drawLine({ start: { x: (cx - ancho / 2) * MM, y: Y(116.5) }, end: { x: (cx + ancho / 2) * MM, y: Y(116.5) }, thickness: 0.6, color: C.indigo, opacity: 0.35 });
  if (d.dni?.trim()) centrado(page, `D.N.I. ${formatoDni(d.dni)}`, cx, 123, { font: f.franklin, size: 9, color: C.gris, tracking: 0.16 });

  parrafo(page, cuerpo(cert, cert.tipo === 'aprobacion' ? d.nota : null), f, cx, 136, 205, 12.5, 7.8);

  // Pie: verificación · lugar y fecha · firma
  const url = urlVerificacion(d.codigo);
  qr(page, url, 26, 173, 19);
  izquierda(page, d.codigo, 48.5, 180.5, { font: f.franklinSemi, size: 8.4, color: C.tinta, tracking: 0.06 });
  izquierda(page, 'Verificá este certificado en', 48.5, 185, { font: f.franklin, size: 7, color: C.gris });
  izquierda(page, url.replace(/^https?:\/\//, '').replace(/\?.*$/, ''), 48.5, 189, { font: f.franklin, size: 7, color: C.gris });

  centrado(page, `San Luis, ${fechaLarga(cert.fecha)}`, cx, 190, { font: f.merriLightItalic, size: 10, color: C.gris });

  const fx = 239;
  if (firma) {
    // La firma entra en una caja de 62 × 25 mm apoyada sobre la línea (la cruza un poco, como una firma real)
    const img = await pdf.embedPng(firma);
    const k = Math.min((62 * MM) / img.width, (25 * MM) / img.height);
    page.drawImage(img, { x: fx * MM - (img.width * k) / 2, y: Y(184), width: img.width * k, height: img.height * k });
  }
  page.drawLine({ start: { x: (fx - 32) * MM, y: Y(181) }, end: { x: (fx + 32) * MM, y: Y(181) }, thickness: 0.8, color: C.tinta });
  centrado(page, cert.firmante, fx, 186.5, { font: f.merriBold, size: 10, color: C.tinta, max: 64 });
  centrado(page, cert.cargo.toUpperCase(), fx, 191, { font: f.franklin, size: 7.6, color: C.gris, tracking: 0.2 });

  return pdf.save();
}

/** Bytes del PDF → base64 (para mandarlo adjunto por el Worker). */
export function aBase64(bytes: Uint8Array) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
