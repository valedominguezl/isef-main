/**
 * Firma escaneada del rector: se guarda en el Apps Script (no en el repositorio, que es público)
 * y se baja una vez por sesión. Al subirla se le saca el fondo y se recorta sola.
 */
import { useEffect, useSyncExternalStore } from 'react';
import type { AdminApi } from '../api';
import { aBase64 } from './pdf';

type Estado = { firma: ArrayBuffer | null | undefined; version: number; error: string | null };
let estado: Estado = { firma: undefined, version: 0, error: null };
let pedido: Promise<void> | null = null;
const oyentes = new Set<() => void>();
const set = (e: Partial<Estado>) => {
  estado = { ...estado, ...e, version: estado.version + 1 };
  oyentes.forEach((f) => f());
};

const deBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;

function cargar(api: AdminApi) {
  pedido ??= api
    .certFirma()
    .then((b64) => set({ firma: b64 ? deBase64(b64) : null, error: null }))
    .catch((e: Error) => {
      pedido = null;
      set({ firma: null, error: e.message });
    });
  return pedido;
}

/** `firma`: undefined mientras se carga, null si no hay. `version` cambia cada vez que cambia la firma. */
export function useFirma(api: AdminApi) {
  const e = useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => estado,
  );
  useEffect(() => {
    void cargar(api);
  }, [api]);
  return {
    ...e,
    guardar: async (archivo: File | null) => {
      const png = archivo ? await limpiarFirma(archivo) : null;
      await api.certGuardarFirma(png ? aBase64(new Uint8Array(png)) : null);
      set({ firma: png, error: null });
    },
  };
}

/**
 * Saca el fondo de la foto o escaneo de la firma y recorta lo que sobra.
 * Si la tinta es azul, se queda solo con lo azul (así desaparece el texto impreso que la cruza);
 * si no, usa lo oscuro. Devuelve un PNG transparente de hasta 1200 px de ancho.
 */
export async function limpiarFirma(archivo: File): Promise<ArrayBuffer> {
  const img = await createImageBitmap(archivo);
  const escala = Math.min(1, 1600 / img.width);
  const w = Math.round(img.width * escala);
  const h = Math.round(img.height * escala);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const datos = ctx.getImageData(0, 0, w, h);
  const p = datos.data;
  const azulDe = (i: number) => p[i + 2] - (p[i] + p[i + 1]) / 2;
  let azules = 0;
  for (let i = 0; i < p.length; i += 4) if (azulDe(i) > 40) azules++;
  const tintaAzul = azules > (w * h) / 500;
  let [x0, y0, x1, y1] = [w, h, 0, 0];
  for (let i = 0; i < p.length; i += 4) {
    const oscuro = 255 - (p[i] + p[i + 1] + p[i + 2]) / 3;
    const a = Math.max(0, Math.min(255, tintaAzul ? (azulDe(i) - 18) * 4 : (oscuro - 60) * 2.5));
    // Tinta pareja (azul o casi negra) y el resto transparente
    [p[i], p[i + 1], p[i + 2], p[i + 3]] = tintaAzul ? [38, 44, 140, a] : [31, 27, 58, a];
    if (a > 40) {
      const px = (i / 4) % w;
      const py = Math.floor(i / 4 / w);
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
  final.getContext('2d')!.drawImage(c, cx, cy, cw, ch, 0, 0, final.width, final.height);
  const blob = await new Promise<Blob>((ok, mal) => final.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo procesar la imagen'))), 'image/png'));
  return blob.arrayBuffer();
}
