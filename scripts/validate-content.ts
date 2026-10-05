/**
 * Valida todo /content contra los esquemas (src/content/schema.ts) y las referencias cruzadas.
 * Corre antes de cada build: si algo está mal, el deploy no sale.
 */
import fs from 'node:fs';
import path from 'node:path';
import { collections, singletons } from '../src/content/schema';

let errors = 0;
const fail = (file: string, msg: string) => {
  errors++;
  console.error(`✗ ${file}: ${msg}`);
};
const read = (f: string) => JSON.parse(fs.readFileSync(f, 'utf8'));
const exists = (p?: string) => !p || fs.existsSync(path.join('public', p));

const slugs: Record<string, Set<string>> = {};
for (const [name, { dir, schema }] of Object.entries(collections)) {
  slugs[name] = new Set();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const file = `${dir}/${f}`;
    const slug = f.replace(/\.json$/, '');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(file, 'el nombre del archivo debe ser un slug (minúsculas y guiones)');
    slugs[name].add(slug);
    try {
      const r = schema.safeParse(read(file));
      if (!r.success) r.error.issues.forEach((i) => fail(file, `${i.path.join('.') || '(raíz)'} → ${i.message}`));
    } catch (e) {
      fail(file, `JSON inválido: ${(e as Error).message}`);
    }
  }
}
for (const [, { file, schema }] of Object.entries(singletons)) {
  try {
    const r = schema.safeParse(read(file));
    if (!r.success) r.error.issues.forEach((i) => fail(file, `${i.path.join('.') || '(raíz)'} → ${i.message}`));
  } catch (e) {
    fail(file, `JSON inválido: ${(e as Error).message}`);
  }
}

// Referencias cruzadas y archivos
for (const s of slugs.cursos) {
  const c = read(`content/cursos/${s}.json`);
  if (!exists(c.imagen)) fail(`cursos/${s}`, `no existe la imagen ${c.imagen}`);
  for (const d of c.disertantes ?? []) if (!slugs.disertantes.has(d)) fail(`cursos/${s}`, `disertante inexistente "${d}"`);
}
for (const s of slugs.disertantes) {
  const d = read(`content/disertantes/${s}.json`);
  if (!exists(d.foto)) fail(`disertantes/${s}`, `no existe la foto ${d.foto}`);
}
for (const s of slugs.cv) {
  const c = read(`content/cv/${s}.json`);
  if (c.disertante !== s) fail(`cv/${s}`, `"disertante" debe ser "${s}"`);
  if (!slugs.disertantes.has(s)) fail(`cv/${s}`, 'no hay disertante con ese slug');
}
for (const s of slugs.novedades) {
  const n = read(`content/novedades/${s}.json`);
  if (!exists(n.imagen)) fail(`novedades/${s}`, `no existe la imagen ${n.imagen}`);
  if (n.curso && !slugs.cursos.has(n.curso)) fail(`novedades/${s}`, `curso inexistente "${n.curso}"`);
}
const insc = read('content/inscripciones.json');
for (const p of insc.pasos) if (!exists(p.archivo)) fail('inscripciones', `no existe ${p.archivo}`);
for (const a of insc.mayores25.archivos) if (!exists(a.url)) fail('inscripciones', `no existe ${a.url}`);
for (const g of read('content/galeria.json').imagenes) if (!exists(g.imagen)) fail('galeria', `no existe ${g.imagen}`);
// Fotos cargadas en Páginas (content/paginas/*.json → { bloque: { imagen } })
for (const [key, { file }] of Object.entries(singletons)) {
  if (!file.startsWith('content/paginas/')) continue;
  for (const [bloque, v] of Object.entries(read(file) as Record<string, { imagen?: string }>))
    if (!exists(v?.imagen)) fail(key, `${bloque}: no existe la imagen ${v.imagen}`);
}

if (errors) {
  console.error(`\n${errors} error(es) de contenido.`);
  process.exit(1);
}
console.log(`✓ Contenido válido (${Object.values(slugs).reduce((a, s) => a + s.size, 0)} entradas + ${Object.keys(singletons).length} archivos de configuración)`);
