/**
 * Optimiza las imágenes de contenido y diseño: máximo 1920 px y WebP calidad 78.
 * Solo reescribe un archivo si el resultado pesa menos. Uso: npm run images
 * (El panel ya optimiza en el navegador lo que se sube; esto es para lo cargado a mano.)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIRS = ['public/media', 'src/assets'];
const MAX = 1920;
let before = 0;
let after = 0;

function walk(dir: string): string[] {
  return fs.readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return fs.statSync(p).isDirectory() ? walk(p) : /\.(webp|jpe?g|png)$/i.test(f) ? [p] : [];
  });
}

for (const file of DIRS.flatMap(walk)) {
  const size = fs.statSync(file).size;
  before += size;
  const meta = await sharp(file).metadata();
  if (size < 150_000 && (meta.width ?? 0) <= MAX) {
    after += size;
    continue;
  }
  const buf = await sharp(file).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
  if (file.endsWith('.webp') && buf.length < size) {
    fs.writeFileSync(file, buf);
    after += buf.length;
    console.log(`↓ ${file}: ${Math.round(size / 1024)} KB → ${Math.round(buf.length / 1024)} KB`);
  } else {
    after += size;
    if (!file.endsWith('.webp')) console.log(`! ${file}: convertilo a .webp (y actualizá la referencia en el contenido)`);
  }
}
console.log(`Total: ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB`);
