/**
 * Arma el PDF del certificado en el navegador (A4 apaisado, vectorial, con las tipografías del sitio).
 * Diseño: marco índigo de doble línea, escudo, nombre protagonista, QR de verificación y firma del rector.
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
import merriBoldItalic from './fonts/merriweather-latin-700-italic.ttf?url';
import franklin from './fonts/libre-franklin-latin-400-normal.ttf?url';
import franklinSemi from './fonts/libre-franklin-latin-600-normal.ttf?url';
import { cuerpo, encabezado, fechaCorta, RESOLUCION, titulo, urlVerificacion, type Tramo } from './texto';

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
  azul: hex('#142A50'), // fondo del escudo
  rojo: hex('#A8141B'), // la «I» del escudo
  oro: hex('#B08D57'),
  tinta: hex('#141A2E'),
  gris: hex('#545C6E'),
};

/* ── Recursos (se bajan una vez y quedan en memoria) ── */
type Recursos = { fuentes: Record<string, ArrayBuffer>; logo: ArrayBuffer; marca: ArrayBuffer };
let recursos: Promise<Recursos> | null = null;

const bajar = async (url: string) => (await fetch(url)).arrayBuffer();

/**
 * Escudo para el PDF: la versión de 512 px (public/icon-512.png). La de 192 px del sitio quedaba blanda
 * al imprimir (≈180 dpi a 27 mm) y pixelada como marca de agua. Si no está, se usa la del sitio.
 * Se pasa por un canvas: `gris` = para la marca de agua (y el WebP de respaldo queda en PNG, que pdf-lib acepta).
 */
async function logoPng(gris: boolean): Promise<ArrayBuffer> {
  const grande = await fetch('/icon-512.png').catch(() => null);
  const fuente = grande?.ok && (grande.headers.get('content-type') ?? '').startsWith('image/') ? grande : await fetch(logoUrl);
  const img = await createImageBitmap(await fuente.blob());
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
    const entradas = Object.entries({ merriLight, merriLightItalic, merriItalic, merriBold, merriBoldItalic, franklin, franklinSemi });
    const [bytes, logo, marca] = await Promise.all([Promise.all(entradas.map(([, u]) => bajar(u))), logoPng(false), logoPng(true)]);
    return { fuentes: Object.fromEntries(entradas.map(([k], i) => [k, bytes[i]])), logo, marca };
  })().catch((e) => {
    recursos = null; // que el próximo intento vuelva a bajar
    throw e;
  });
  return recursos;
}

/* ── Ayudas de dibujo ── */
type Fuentes = Record<'merriLight' | 'merriLightItalic' | 'merriItalic' | 'merriBold' | 'merriBoldItalic' | 'franklin' | 'franklinSemi', PDFFont>;

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
  const estilo = {
    normal: { font: f.merriLight, color: C.tinta },
    negrita: { font: f.merriBold, color: C.tinta },
    cursiva: { font: f.merriLightItalic, color: C.tinta },
    negritaCursiva: { font: f.merriBoldItalic, color: C.azul },
  };
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
  // Sin una palabra sola en la última línea: si queda muy corta, baja también la última palabra de la anterior
  const ultima = lineas[lineas.length - 1];
  const previa = lineas[lineas.length - 2];
  const anchoLinea = (l: typeof ultima) => l.reduce((t, x) => t + ancho(x), 0);
  if (previa && anchoLinea(ultima) < maxMm * MM * 0.2) {
    const k = previa.map((x) => x.texto === ' ').lastIndexOf(true);
    if (k > 0) {
      const palabra = previa.splice(k + 1);
      const espacio = previa.pop()!;
      lineas[lineas.length - 1] = [...palabra, espacio, ...ultima];
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
  page.drawRectangle({ x: 8 * MM, y: 8 * MM, width: W - 16 * MM, height: H - 16 * MM, borderColor: C.azul, borderWidth: 1.6 });
  page.drawRectangle({ x: 12.6 * MM, y: 12.6 * MM, width: W - 25.2 * MM, height: H - 25.2 * MM, borderColor: C.rojo, borderWidth: 0.6 });
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

/** Números «al azar» pero siempre los mismos para el mismo texto (mulberry32 sobre un hash del código). */
function azarDe(texto: string) {
  let s = 2166136261;
  for (let i = 0; i < texto.length; i++) s = Math.imul(s ^ texto.charCodeAt(i), 16777619);
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
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

/**
 * PDF listo para descargar o adjuntar. `firma`: PNG transparente de la firma del rector; `sello`: el del
 * instituto (los dos opcionales).
 */
export async function generarCertificado(cert: Certificado, d: DatosCertificado, firma?: ArrayBuffer | null, sello?: ArrayBuffer | null): Promise<Uint8Array> {
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
  centrado(page, 'Instituto Superior de Educación Física “San Luis”', cx, 59, { font: f.merriBold, size: 17, color: C.azul, max: 240 });
  const norma = { font: f.franklin, size: 7.4, color: C.gris, tracking: 0.14, max: 240 };
  centrado(page, (cert.resolucion?.trim() || RESOLUCION).toUpperCase(), cx, 65.5, norma);
  centrado(page, 'MINISTERIO DE EDUCACIÓN · GOBIERNO DE SAN LUIS', cx, 70, norma);
  // Filete dorado con rombo
  page.drawLine({ start: { x: (cx - 22) * MM, y: Y(77) }, end: { x: (cx + 22) * MM, y: Y(77) }, thickness: 0.6, color: C.oro });
  const rr = 1.6 * MM;
  page.drawRectangle({ x: cx * MM, y: Y(77) - rr * Math.SQRT2 / 2, width: rr, height: rr, color: C.papel, borderColor: C.oro, borderWidth: 0.6, rotate: degrees(45) });

  centrado(page, encabezado(cert), cx, 91, { font: f.merriLight, size: 12, color: C.tinta, max: 240 });

  const tam = centrado(page, d.nombre, cx, 108, { font: f.merriItalic, size: 33, color: C.tinta, max: 215 });
  const ancho = Math.max(150, f.merriItalic.widthOfTextAtSize(d.nombre, tam) / MM + 12);
  page.drawLine({ start: { x: (cx - ancho / 2) * MM, y: Y(112.5) }, end: { x: (cx + ancho / 2) * MM, y: Y(112.5) }, thickness: 0.6, color: C.azul, opacity: 0.35 });

  parrafo(page, cuerpo(cert, d.dni, cert.tipo === 'aprobacion' ? d.nota : null), f, cx, 126, 210, 12.5, 7.8);

  // Pie: verificación · lugar y fecha · firma
  const url = urlVerificacion(d.codigo);
  qr(page, url, 26, 173, 19);
  izquierda(page, d.codigo, 48.5, 180.5, { font: f.franklinSemi, size: 8.4, color: C.tinta, tracking: 0.06 });
  izquierda(page, 'Verificá este certificado en', 48.5, 185, { font: f.franklin, size: 7, color: C.gris });
  izquierda(page, url.replace(/^https?:\/\//, '').replace(/\?.*$/, ''), 48.5, 189, { font: f.franklin, size: 7, color: C.gris });

  centrado(page, `Emitido el ${fechaCorta(cert.fecha)}`, cx, 190, { font: f.merriLightItalic, size: 10, color: C.gris });

  const fx = 239;
  if (sello) {
    // El sello va a la izquierda de la firma, como uno puesto a mano: caja de ~28 mm centrada cerca de
    // x = 189, y = 170, tinta translúcida y torcido. Ángulo, posición, tamaño y tinta cambian entre
    // certificados, pero salen siempre iguales para el mismo código (descargar o reenviar no lo mueve).
    const azar = azarDe(d.codigo);
    const img = await pdf.embedPng(sello);
    const lado = 28 * (0.94 + azar() * 0.1);
    const k = Math.min((lado * MM) / img.width, (lado * MM) / img.height);
    const [sw, sh] = [img.width * k, img.height * k];
    // Nunca recto: −14° a −5° (lo común, inclinado hacia la derecha) o, una de cada cuatro, +5° a +8°
    const angulo = azar() < 0.75 ? -(5 + azar() * 9) : 5 + azar() * 3;
    // Centro dentro de ±4,5 mm a lo ancho y ±4 mm a lo alto: no pisa «Emitido el…», el texto ni la firma
    const [cxS, cyS] = [(189 + (azar() - 0.5) * 9) * MM, Y(170 + (azar() - 0.5) * 8)];
    // pdf-lib rota alrededor de la esquina inferior izquierda: se corrige para que gire sobre su centro
    const t = (angulo * Math.PI) / 180;
    const x = cxS - ((sw / 2) * Math.cos(t) - (sh / 2) * Math.sin(t));
    const y = cyS - ((sw / 2) * Math.sin(t) + (sh / 2) * Math.cos(t));
    page.drawImage(img, { x, y, width: sw, height: sh, rotate: degrees(angulo), opacity: 0.42 + azar() * 0.12 });
  }
  if (firma) {
    // La firma entra en una caja de 66 × 30 mm apoyada sobre la línea (la cruza un poco, como una firma real)
    const img = await pdf.embedPng(firma);
    const k = Math.min((66 * MM) / img.width, (30 * MM) / img.height);
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
