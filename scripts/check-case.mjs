/**
 * Detecta imports cuya capitalización no coincide con el archivo real.
 * En Windows/macOS funcionan igual, pero en Linux (CI y servidor) rompen el build.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const exts = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '.scss', '/index.ts', '/index.tsx'];
let bad = 0;

function realCase(p) {
  // Verifica cada segmento contra el listado real del directorio
  const parts = path.relative(ROOT, p).split(path.sep);
  let cur = ROOT;
  for (const part of parts) {
    if (!fs.existsSync(cur)) return false;
    const entries = fs.readdirSync(cur);
    if (!entries.includes(part)) return false;
    cur = path.join(cur, part);
  }
  return true;
}

function resolve(from, spec) {
  let base;
  if (spec.startsWith('@/')) base = path.join(ROOT, 'src', spec.slice(2));
  else if (spec.startsWith('@content/')) base = path.join(ROOT, 'content', spec.slice(9));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
  else if (spec.startsWith('/content/') || spec.startsWith('/src/')) base = path.join(ROOT, spec);
  else return null;
  for (const e of exts) {
    const p = base + e;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return base;
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|scss)$/.test(f)) {
      const src = fs.readFileSync(p, 'utf8');
      const re = /(?:from\s+|import\s*\(\s*|@use\s+|url\()\s*['"]([^'"]+)['"]/g;
      let m;
      while ((m = re.exec(src))) {
        const target = resolve(p, m[1]);
        if (!target || /\*/.test(m[1])) continue;
        if (!fs.existsSync(target)) {
          // los parciales SCSS (_mixins) y módulos de node se ignoran
          const partial = path.join(path.dirname(target), `_${path.basename(target)}.scss`);
          if (fs.existsSync(partial)) continue;
          console.error(`✗ ${path.relative(ROOT, p)} importa "${m[1]}" que no existe`);
          bad++;
        } else if (!realCase(target)) {
          console.error(`✗ ${path.relative(ROOT, p)}: "${m[1]}" no coincide en mayúsculas/minúsculas con el archivo real`);
          bad++;
        }
      }
    }
  }
}

walk(path.join(ROOT, 'src'));
if (bad) process.exit(1);
console.log('✓ Imports con mayúsculas/minúsculas correctas');
