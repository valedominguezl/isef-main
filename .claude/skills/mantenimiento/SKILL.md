---
name: mantenimiento
description: Mantenimiento inteligente del sitio del I.S.E.F. Usar cuando el usuario pida "mantenimiento", "auditoría", "health check", "revisá el proyecto", o proactivamente sugerirlo después de ~1M tokens de trabajo, antes de un deploy grande, o si docs/MAPA.md tiene más de 30 días. Hace SOLO lo que el proyecto más necesita (código, seguridad, diseño, contenido o higiene de contexto) según un chequeo rápido.
---

# Mantenimiento del sitio I.S.E.F.

Objetivo: en pocos minutos saber cómo está el proyecto y arreglar lo más importante, sin auditar todo cada vez.

## 1. Diagnóstico (siempre, ~1 min)
```bash
npm run health            # o: npm run health -- --quick  (sin tsc/lint/audit)
```
Leé **solo** `docs/MAPA.md` → sección "Qué hacer ahora". No leas el código entero.

## 2. Elegí como máximo 2 tareas, en este orden de prioridad
| Señal en el mapa | Qué hacer | Herramientas |
|---|---|---|
| 🔴 chequeos fallan | Arreglar tipos/lint/contenido/imports | `npm run check` |
| 🔴 vulnerabilidades altas/críticas | `npm audit`, `npm audit fix`; majors: evaluar y avisar | skill `security-review` si hubo cambios de código |
| `[codigo]` (≥25 archivos o ≥30 commits desde la última) | Revisar SOLO lo cambiado: `git diff <commit-de-la-última> --stat` | skills `code-review`, `simplify` |
| `[seguridad]` (>60 días) | Revisar: tokens/secretos en el repo, `.htaccess`, datos personales en `content/` y `public/`, dependencias | skill `security-review` |
| `[contenido]` | Avisar al usuario las alertas (cursos con etiqueta vieja, CVs vacíos, novedades viejas). Editar `content/*.json` solo si lo pide | — |
| `[diseno]` (≥15 archivos de UI o >120 días) | QA visual: build + `npm run preview` + capturas desktop/móvil con Playwright + axe-core; comparar con `design/DESIGN.md` | Playwright, axe-core |
| `[tokens]` | CLAUDE.md < 3 KB y vigente; sin archivos de texto enormes versionados; `.claude/settings.json` niega lecturas de builds/lockfiles/medios | — |
| `[dependencias]` | Listar majors; actualizar de a una con build + preview | — |

Si no hay nada en "Qué hacer ahora": decirlo en una línea y terminar.

## 3. Cerrar
```bash
npm run check && npm run build
node scripts/health.mjs --mark <area>   # por cada área auditada: codigo|seguridad|diseno|contenido|tokens
npm run health -- --quick               # regenera el mapa
```

## 4. Reporte (máx. 10 líneas)
- Estado general (🟢/🟡/🔴) y qué se hizo.
- Qué quedó pendiente y por qué.
- Cuándo conviene el próximo mantenimiento.

## Reglas
- No tocar la lógica de `src/features/test-hiit/` (protocolo de investigación congelado).
- No hacer push ni deploy sin confirmación.
- Cambios visuales: respetar tokens y componentes de `src/components/ui`.
