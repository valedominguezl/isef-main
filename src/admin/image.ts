/** Procesa imágenes en el navegador antes de subirlas: recorte opcional, redimensión y WebP. */
export interface ImageOptions {
  maxWidth: number;
  /** Relación de aspecto a recortar (ancho/alto), p. ej. 1 para retratos. */
  aspect?: number;
  quality?: number;
}

export async function processImage(file: File, { maxWidth, aspect, quality = 0.8 }: ImageOptions) {
  const bmp = await createImageBitmap(file);
  let sx = 0;
  let sy = 0;
  let sw = bmp.width;
  let sh = bmp.height;
  if (aspect) {
    if (sw / sh > aspect) {
      sw = Math.round(sh * aspect);
      sx = Math.round((bmp.width - sw) / 2);
    } else {
      sh = Math.round(sw / aspect);
      sy = Math.round((bmp.height - sh) / 2);
    }
  }
  const scale = Math.min(1, maxWidth / sw);
  const w = Math.round(sw * scale);
  const h = Math.round(sh * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, w, h);
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('No se pudo convertir la imagen'))), 'image/webp', quality));
  return { base64: await blobToBase64(blob), dataUrl: canvas.toDataURL('image/webp', 0.6), size: blob.size, width: w, height: h };
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
