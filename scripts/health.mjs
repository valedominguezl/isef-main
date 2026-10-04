#!/usr/bin/env node
/**
 * Chequeo de salud del proyecto → docs/MAPA.md (mapa de un vistazo, con diagrama Mermaid).
 *
 *   npm run health              chequeo completo (tipos, lint, contenido, deps, bundle, contenido)
 *   npm run health -- --quick   sin typecheck/lint/audit (más rápido)
 *   npm run health -- --mark codigo|seguridad|diseno|contenido|tokens
 *                               registra que se hizo esa auditoría (resetea su contador)
 *
 * Lo usa la skill .claude/skills/mantenimiento para decidir QUÉ revisar, sin auditar todo siempre.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const STATE = path.join(ROOT, '.claude/maintenance/state.json');
const args = process.argv.slice(2);
const quick = args.includes('--quick');
const markIdx = args.indexOf('--mark');
const today = new Date().toISOString().slice(0, 10);

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { audits: {} };
const sh = (cmd) => {
  try {
    return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 32e6 }) };
  } catch (e) {
    return { ok: false, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
};
const head = sh('git rev-parse --short HEAD').out.trim();

if (markIdx >= 0) {
  const area = args[markIdx + 1];
  state.audits[area] = { date: today, commit: head };
  fs.mkdirSync(path.dirname(STATE), { recursive: true });
  fs.writeFileSync(STATE, `${JSON.stringify(state, null, 2)}\n`);
  console.log(`✓ Registrada auditoría "${area}" (${today}, ${head})`);
  process.exit(0);
}

/* ── Señales ─────────────────────────────────────────────── */
const since = (area) => state.audits[area]?.commit;
const changedSince = (area, pathspec) => {
  const c = since(area);
  if (!c) return null;
  const r = sh(`git diff --name-only ${c} HEAD -- ${pathspec}`);
  return r.ok ? r.out.split('\n').filter(Boolean).length : null;
};
const daysSince = (area) => (state.audits[area] ? Math.round((Date.now() - new Date(state.audits[area].date).getTime()) / 864e5) : Infinity);
const commitsSince = (area) => (since(area) ? Number(sh(`git rev-list --count ${since(area)}..HEAD`).out.trim() || 0) : null);

const checks = {};
if (!quick) {
  checks.tipos = sh('npx tsc --noEmit');
  checks.lint = sh('npx eslint .');
}
checks.contenido = sh('npx tsx scripts/validate-content.ts');
checks.mayusculas = sh('node scripts/check-case.mjs');

let vulns = null;
if (!quick) {
  const a = sh('npm audit --json');
  try {
    vulns = JSON.parse(a.out).metadata?.vulnerabilities ?? null;
  } catch {
    vulns = null;
  }
}
let outdatedMajor = [];
if (!quick) {
  try {
    const o = JSON.parse(sh('npm outdated --json').out || '{}');
    outdatedMajor = Object.entries(o)
      .filter(([, v]) => v.current && v.latest && v.current.split('.')[0] !== v.latest.split('.')[0])
      .map(([k, v]) => `${k} ${v.current}→${v.latest}`);
  } catch {
    /* sin red */
  }
}

// Bundle (si hay build)
let bundle = null;
const assets = path.join(ROOT, 'dist/assets');
if (fs.existsSync(assets)) {
  const js = fs.readdirSync(assets).filter((f) => f.endsWith('.js'));
  const sizes = js.map((f) => ({ f, gz: zlib.gzipSync(fs.readFileSync(path.join(assets, f))).length })).sort((a, b) => b.gz - a.gz);
  bundle = { totalKb: Math.round(sizes.reduce((a, s) => a + s.gz, 0) / 1024), top: sizes.slice(0, 3).map((s) => `${s.f.replace(/-[\w-]{8}\.js$/, '')} ${Math.round(s.gz / 1024)}KB`) };
}

// Higiene de tokens: archivos de texto versionados más pesados
const tracked = sh('git ls-files').out.split('\n').filter(Boolean);
const heavy = tracked
  .filter((f) => /\.(ts|tsx|js|mjs|json|scss|md|css|html)$/.test(f))
  .map((f) => ({ f, kb: fs.existsSync(f) ? Math.round(fs.statSync(f).size / 1024) : 0 }))
  .filter((x) => x.kb >= 25)
  .sort((a, b) => b.kb - a.kb)
  .slice(0, 6);
const claudeMd = fs.existsSync('CLAUDE.md') ? Math.round(fs.statSync('CLAUDE.md').size / 1024) : 0;

// Salud del contenido
const readDir = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => ({ slug: f.slice(0, -5), ...JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')) })) : []);
const cursos = readDir('content/cursos');
const novedades = readDir('content/novedades');
const cvs = readDir('content/cv');
const contentAlerts = [];
cursos.filter((c) => c.etiqueta && c.fechaInicio && c.fechaInicio < today).forEach((c) => contentAlerts.push(`Curso "${c.titulo}" ya empezó y sigue con etiqueta "${c.etiqueta}"`));
const lastNews = novedades.map((n) => n.fecha).sort().pop();
if (lastNews && (Date.now() - new Date(lastNews).getTime()) / 864e5 > 60) contentAlerts.push(`Última novedad: ${lastNews} (más de 60 días)`);
cvs.filter((c) => !c.secciones?.some((s) => s.items.length)).forEach((c) => contentAlerts.push(`CV vacío: ${c.disertante}`));

/* ── Recomendaciones (qué conviene hacer AHORA) ─────────── */
const recs = [];
const failing = Object.entries(checks).filter(([, r]) => !r.ok).map(([k]) => k);
if (failing.length) recs.push({ p: 1, area: 'codigo', text: `Arreglar chequeos que fallan: ${failing.join(', ')}` });
if (vulns && (vulns.high || vulns.critical)) recs.push({ p: 1, area: 'seguridad', text: `${vulns.critical ?? 0} vulnerabilidades críticas y ${vulns.high ?? 0} altas en dependencias → npm audit` });
const codeChanged = changedSince('codigo', 'src scripts');
if (codeChanged === null || codeChanged >= 25 || commitsSince('codigo') >= 30)
  recs.push({ p: 2, area: 'codigo', text: `Auditoría de código (${codeChanged ?? 'nunca auditado'}${codeChanged !== null ? ' archivos cambiados desde la última' : ''})` });
if (daysSince('seguridad') > 60) recs.push({ p: 2, area: 'seguridad', text: `Revisión de seguridad (hace ${daysSince('seguridad') === Infinity ? '—' : daysSince('seguridad')} días)` });
const designChanged = changedSince('diseno', 'src/styles src/components src/pages');
if (designChanged === null || designChanged >= 15 || daysSince('diseno') > 120)
  recs.push({ p: 3, area: 'diseno', text: `Auditoría de diseño/QA visual (${designChanged ?? 'sin registro previo'}${designChanged !== null ? ' archivos de UI cambiados' : ''})` });
if (contentAlerts.length) recs.push({ p: 2, area: 'contenido', text: `${contentAlerts.length} alerta(s) de contenido` });
if (heavy.length > 3 || claudeMd > 12 || daysSince('tokens') > 90) recs.push({ p: 3, area: 'tokens', text: 'Higiene de contexto: revisar CLAUDE.md, archivos pesados y .claude/settings.json' });
if (outdatedMajor.length >= 3) recs.push({ p: 3, area: 'dependencias', text: `${outdatedMajor.length} dependencias con versión mayor nueva` });
recs.sort((a, b) => a.p - b.p);

/* ── Mapa Mermaid ───────────────────────────────────────── */
const st = (bad, warn) => (bad ? 'bad' : warn ? 'warn' : 'ok');
const nodes = {
  codigo: st(failing.length > 0, recs.some((r) => r.area === 'codigo')),
  seguridad: st(Boolean(vulns && (vulns.high || vulns.critical)), recs.some((r) => r.area === 'seguridad')),
  diseno: st(false, recs.some((r) => r.area === 'diseno')),
  contenido: st(!checks.contenido.ok, contentAlerts.length > 0),
  deps: st(false, outdatedMajor.length >= 3),
  tokens: st(false, recs.some((r) => r.area === 'tokens')),
  bundle: st(false, Boolean(bundle && bundle.totalKb > 350)),
};
const icon = { ok: '🟢', warn: '🟡', bad: '🔴' };
const mermaid = `flowchart LR
  ISEF((I.S.E.F.<br/>sitio)):::core
  ISEF --> COD[${icon[nodes.codigo]} Código<br/>${failing.length ? `falla: ${failing.join(', ')}` : 'chequeos OK'}]:::${nodes.codigo}
  ISEF --> SEG[${icon[nodes.seguridad]} Seguridad<br/>${vulns ? `${vulns.critical ?? 0} crít · ${vulns.high ?? 0} altas` : 'sin datos'}]:::${nodes.seguridad}
  ISEF --> DIS[${icon[nodes.diseno]} Diseño / QA<br/>última: ${state.audits.diseno?.date ?? 'nunca'}]:::${nodes.diseno}
  ISEF --> CON[${icon[nodes.contenido]} Contenido<br/>${cursos.length} cursos · ${novedades.length} novedades]:::${nodes.contenido}
  ISEF --> DEP[${icon[nodes.deps]} Dependencias<br/>${outdatedMajor.length} majors pendientes]:::${nodes.deps}
  ISEF --> TOK[${icon[nodes.tokens]} Contexto IA<br/>CLAUDE.md ${claudeMd}KB]:::${nodes.tokens}
  ISEF --> BUN[${icon[nodes.bundle]} Bundle<br/>${bundle ? `${bundle.totalKb}KB gz` : 'sin build'}]:::${nodes.bundle}
  classDef ok fill:#e8f8ee,stroke:#12a150,color:#0b4d27
  classDef warn fill:#fff6e0,stroke:#c98a00,color:#5c3f00
  classDef bad fill:#ffe9e8,stroke:#d93636,color:#6b1111
  classDef core fill:#7761ff,stroke:#4a2fdb,color:#fff`;

const md = `# Mapa de salud del proyecto

> Generado por \`npm run health\` el ${today} (commit \`${head}\`). No editar a mano.

\`\`\`mermaid
${mermaid}
\`\`\`

## Qué hacer ahora
${recs.length ? recs.slice(0, 5).map((r, i) => `${i + 1}. **[${r.area}]** ${r.text}`).join('\n') : '✅ Nada urgente. Próximo chequeo en unas semanas o después de cambios grandes.'}

## Detalle
| Área | Estado | Dato |
|---|---|---|
| Tipos / lint | ${quick ? '—' : checks.tipos.ok && checks.lint.ok ? '🟢' : '🔴'} | ${quick ? 'omitido (--quick)' : `tsc ${checks.tipos.ok ? 'OK' : 'con errores'} · eslint ${checks.lint.ok ? 'OK' : 'con errores'}`} |
| Contenido | ${checks.contenido.ok ? (contentAlerts.length ? '🟡' : '🟢') : '🔴'} | ${checks.contenido.ok ? contentAlerts.slice(0, 3).join(' · ') || 'válido' : 'esquema inválido → npm run content:check'} |
| Imports (mayúsculas) | ${checks.mayusculas.ok ? '🟢' : '🔴'} | ${checks.mayusculas.ok ? 'OK' : 'hay imports que rompen en Linux'} |
| Vulnerabilidades | ${vulns ? (vulns.high || vulns.critical ? '🔴' : '🟢') : '—'} | ${vulns ? Object.entries(vulns).map(([k, v]) => `${k}: ${v}`).join(', ') : 'sin datos (offline o --quick)'} |
| Dependencias | ${outdatedMajor.length >= 3 ? '🟡' : '🟢'} | ${outdatedMajor.slice(0, 5).join(', ') || 'al día'} |
| Bundle JS | ${bundle ? (bundle.totalKb > 350 ? '🟡' : '🟢') : '—'} | ${bundle ? `${bundle.totalKb} KB gzip total · ${bundle.top.join(', ')}` : 'correr npm run build'} |
| Archivos pesados (tokens) | ${heavy.length > 3 ? '🟡' : '🟢'} | ${heavy.map((h) => `${h.f} (${h.kb}KB)`).join(', ') || 'ninguno'} |

## Últimas auditorías
${['codigo', 'seguridad', 'diseno', 'contenido', 'tokens'].map((a) => `- **${a}**: ${state.audits[a] ? `${state.audits[a].date} (\`${state.audits[a].commit}\`)` : 'nunca'}`).join('\n')}
`;

fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/MAPA.md'), md);
console.log(md.split('## Detalle')[0].replace(/```mermaid[\s\S]*?```\n/, ''));
console.log('→ Mapa completo en docs/MAPA.md');
