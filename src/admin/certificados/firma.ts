/**
 * Firma escaneada del rector y sello del instituto: se guardan en el Apps Script (no en el repositorio,
 * que es público) y se bajan una vez por sesión. Al subirlos se les saca el fondo y se recortan solos.
 */
import { useEffect, useSyncExternalStore } from 'react';
import type { AdminApi } from '../api';
import { aBase64 } from './pdf';

export type Cual = 'firma' | 'sello';
type Estado = { imagen: ArrayBuffer | null | undefined; version: number; error: string | null };

const deBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;

/** Un estado compartido por imagen (todas las pantallas del panel ven la misma). */
function crearAlmacen(cual: Cual) {
  let estado: Estado = { imagen: undefined, version: 0, error: null };
  let pedido: Promise<void> | null = null;
  const oyentes = new Set<() => void>();
  const set = (e: Partial<Estado>) => {
    estado = { ...estado, ...e, version: estado.version + 1 };
    oyentes.forEach((f) => f());
  };
  const cargar = (api: AdminApi) =>
    (pedido ??= api
      .certImagen(cual)
      .then((b64) => set({ imagen: b64 ? deBase64(b64) : null, error: null }))
      .catch((e: Error) => {
        pedido = null;
        set({ imagen: null, error: e.message });
      }));
  return {
    cargar,
    set,
    subscribe: (f: () => void) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    get: () => estado,
  };
}

const almacenes = { firma: crearAlmacen('firma'), sello: crearAlmacen('sello') };
const limpiadores = { firma: limpiarFirma, sello: limpiarSello };

/** `imagen`: undefined mientras se carga, null si no hay. `version` cambia cada vez que cambia. */
export function useImagenCert(api: AdminApi, cual: Cual) {
  const a = almacenes[cual];
  const e = useSyncExternalStore(a.subscribe, a.get);
  useEffect(() => {
    void a.cargar(api);
  }, [api, a]);
  return {
    ...e,
    guardar: async (archivo: File | null) => {
      const png = archivo ? await limpiadores[cual](archivo) : null;
      await api.certGuardarImagen(cual, png ? aBase64(new Uint8Array(png)) : null);
      a.set({ imagen: png, error: null });
    },
  };
}

/** Firma del rector (atajo con los nombres de siempre). */
export function useFirma(api: AdminApi) {
  const { imagen, ...resto } = useImagenCert(api, 'firma');
  return { firma: imagen, ...resto };
}

/** Sello del instituto. */
export function useSello(api: AdminApi) {
  const { imagen, ...resto } = useImagenCert(api, 'sello');
  return { sello: imagen, ...resto };
}

/**
 * Saca el fondo de la foto o escaneo del sello y lo recorta. Lo oscuro queda como tinta de sello
 * (violeta-índigo, la de los sellos de goma), lo claro desaparece. PNG transparente de hasta 900 px.
 */
export async function limpiarSello(archivo: File): Promise<ArrayBuffer> {
  const img = await createImageBitmap(archivo);
  const escala = Math.min(1, 1400 / Math.max(img.width, img.height));
  const w = Math.round(img.width * escala);
  const h = Math.round(img.height * escala);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  sobreBlanco(ctx, img, w, h);
  const datos = ctx.getImageData(0, 0, w, h);
  const p = datos.data;
  let [x0, y0, x1, y1] = [w, h, 0, 0];
  for (let k = 0, i = 0; k < w * h; k++, i += 4) {
    const oscuro = 255 - (p[i] + p[i + 1] + p[i + 2]) / 3;
    // Umbral suave: el gris del papel desaparece y la tinta queda pareja
    const v = Math.max(0, Math.min(255, (oscuro - 70) * 2.2));
    [p[i], p[i + 1], p[i + 2], p[i + 3]] = [52, 44, 132, v];
    if (v > 60) {
      const px = k % w;
      const py = Math.floor(k / w);
      x0 = Math.min(x0, px);
      y0 = Math.min(y0, py);
      x1 = Math.max(x1, px);
      y1 = Math.max(y1, py);
    }
  }
  if (x1 <= x0 || y1 <= y0) throw new Error('No se encontró el sello en la imagen. Probá con una foto con más contraste.');
  ctx.putImageData(datos, 0, 0);
  const m = 6;
  const [cx, cy] = [Math.max(0, x0 - m), Math.max(0, y0 - m)];
  const [cw, ch] = [Math.min(w, x1 + m) - cx, Math.min(h, y1 + m) - cy];
  const final = document.createElement('canvas');
  const k = Math.min(1, 900 / Math.max(cw, ch));
  final.width = Math.round(cw * k);
  final.height = Math.round(ch * k);
  const fctx = final.getContext('2d')!;
  fctx.filter = 'blur(0.4px)';
  fctx.drawImage(c, cx, cy, cw, ch, 0, 0, final.width, final.height);
  const blob = await new Promise<Blob>((ok, mal) => final.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo procesar la imagen'))), 'image/png'));
  return blob.arrayBuffer();
}

/**
 * Saca el fondo de la foto o escaneo de la firma y recorta lo que sobra.
 * Si la tinta es azul, se queda solo con lo azul (así desaparece el texto impreso que la cruza) y une los
 * pequeños cortes que deja ese texto; si no, usa lo oscuro. Las imágenes chicas se agrandan al doble antes,
 * para que el trazo quede suave. Devuelve un PNG transparente de hasta 1200 px de ancho.
 */
export async function limpiarFirma(archivo: File): Promise<ArrayBuffer> {
  const img = await createImageBitmap(archivo);
  const escala = img.width < 900 ? 2 : Math.min(1, 1600 / img.width);
  const w = Math.round(img.width * escala);
  const h = Math.round(img.height * escala);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  sobreBlanco(ctx, img, w, h);
  const datos = ctx.getImageData(0, 0, w, h);
  const p = datos.data;
  const azulDe = (i: number) => p[i + 2] - (p[i] + p[i + 1]) / 2;
  let azules = 0;
  for (let i = 0; i < p.length; i += 4) if (azulDe(i) > 40) azules++;
  const tintaAzul = azules > (w * h) / 500;
  // 1) Tinta → opacidad (umbral suave para no perder los trazos finos)
  const a = new Float32Array(w * h);
  for (let k = 0, i = 0; k < w * h; k++, i += 4) {
    const oscuro = 255 - (p[i] + p[i + 1] + p[i + 2]) / 3;
    a[k] = Math.max(0, Math.min(255, tintaAzul ? (azulDe(i) - 10) * 3.2 : (oscuro - 50) * 2.5));
  }
  // 2) Cierre (dilatar y erosionar): une los cortes donde el texto impreso cruza el trazo azul
  const cerrado = tintaAzul ? cerrar(a, w, h, 3) : a;
  let [x0, y0, x1, y1] = [w, h, 0, 0];
  for (let k = 0; k < w * h; k++) {
    const v = 255 * Math.pow(Math.max(a[k], cerrado[k] * 0.92) / 255, 0.55); // tinta pareja
    const i = k * 4;
    [p[i], p[i + 1], p[i + 2], p[i + 3]] = tintaAzul ? [34, 40, 138, v] : [31, 27, 58, v];
    if (v > 40) {
      const px = k % w;
      const py = Math.floor(k / w);
      x0 = Math.min(x0, px);
      y0 = Math.min(y0, py);
      x1 = Math.max(x1, px);
      y1 = Math.max(y1, py);
    }
  }
  if (x1 <= x0 || y1 <= y0) throw new Error('No se encontró la firma en la imagen. Probá con una foto con más contraste.');
  ctx.putImageData(datos, 0, 0);
  const m = 4;
  const [cx, cy, cw, ch] = [Math.max(0, x0 - m), Math.max(0, y0 - m), Math.min(w, x1 + m) - Math.max(0, x0 - m), Math.min(h, y1 + m) - Math.max(0, y0 - m)];
  const final = document.createElement('canvas');
  const k = Math.min(1, 1200 / cw);
  final.width = Math.round(cw * k);
  final.height = Math.round(ch * k);
  const fctx = final.getContext('2d')!;
  fctx.filter = 'blur(0.5px)';
  fctx.drawImage(c, cx, cy, cw, ch, 0, 0, final.width, final.height);
  const blob = await new Promise<Blob>((ok, mal) => final.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo procesar la imagen'))), 'image/png'));
  return blob.arrayBuffer();
}

/**
 * Dibuja la imagen sobre blanco: un PNG con fondo transparente trae píxeles «negros transparentes»
 * que, leídos sin el canal alfa, parecían tinta (el sello salía como un bloque relleno).
 */
function sobreBlanco(ctx: CanvasRenderingContext2D, img: ImageBitmap, w: number, h: number) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
}

/** Cierre morfológico con un disco de radio `r` (máximo y después mínimo de los vecinos). */
function cerrar(src: Float32Array, w: number, h: number, r: number) {
  const pasar = (de: Float32Array, max: boolean) => {
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let v = max ? 0 : 255;
        for (let dy = -r; dy <= r; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = -r; dx <= r; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= w || dx * dx + dy * dy > r * r) continue;
            const s = de[yy * w + xx];
            v = max ? Math.max(v, s) : Math.min(v, s);
          }
        }
        out[y * w + x] = v;
      }
    return out;
  };
  return pasar(pasar(src, true), false);
}
