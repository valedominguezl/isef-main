# Mapa de salud del proyecto

> Generado por `npm run health` el 2026-10-05 (commit `eda2e0b`). No editar a mano.

```mermaid
flowchart LR
  ISEF((I.S.E.F.<br/>sitio)):::core
  ISEF --> COD[🟢 Código<br/>chequeos OK]:::ok
  ISEF --> SEG[🟢 Seguridad<br/>sin datos]:::ok
  ISEF --> DIS[🟢 Diseño / QA<br/>última: 2026-10-05]:::ok
  ISEF --> CON[🟢 Contenido<br/>17 cursos · 8 novedades]:::ok
  ISEF --> DEP[🟢 Dependencias<br/>0 majors pendientes]:::ok
  ISEF --> TOK[🟡 Contexto IA<br/>CLAUDE.md 2KB]:::warn
  ISEF --> BUN[🟡 Bundle<br/>424KB gz]:::warn
  classDef ok fill:#e8f8ee,stroke:#12a150,color:#0b4d27
  classDef warn fill:#fff6e0,stroke:#c98a00,color:#5c3f00
  classDef bad fill:#ffe9e8,stroke:#d93636,color:#6b1111
  classDef core fill:#7761ff,stroke:#4a2fdb,color:#fff
```

## Qué hacer ahora
1. **[tokens]** Higiene de contexto: revisar CLAUDE.md, archivos pesados y .claude/settings.json

## Detalle
| Área | Estado | Dato |
|---|---|---|
| Tipos / lint | — | omitido (--quick) |
| Contenido | 🟢 | válido |
| Imports (mayúsculas) | 🟢 | OK |
| Vulnerabilidades | — | sin datos (offline o --quick) |
| Dependencias | 🟢 | al día |
| Bundle JS | 🟡 | 424 KB gzip total · pdf 139KB, react 83KB, index 46KB |
| Archivos pesados (tokens) | 🟡 | package-lock.json (181KB), content/cv/nelio-bazan.json (79KB), src/admin/Admin.module.scss (37KB), src/features/test-hiit/StroopTest.tsx (34KB), src/admin/config.ts (25KB) |

## Últimas auditorías
- **codigo**: 2026-10-05 (`eda2e0b`)
- **seguridad**: 2026-10-04 (`3963eec`)
- **diseno**: 2026-10-05 (`eda2e0b`)
- **contenido**: 2026-10-04 (`3963eec`)
- **tokens**: 2026-10-04 (`3963eec`)
