# Mapa de salud del proyecto

> Generado por `npm run health` el 2026-10-04 (commit `3963eec`). No editar a mano.

```mermaid
flowchart LR
  ISEF((I.S.E.F.<br/>sitio)):::core
  ISEF --> COD[🟢 Código<br/>chequeos OK]:::ok
  ISEF --> SEG[🟢 Seguridad<br/>sin datos]:::ok
  ISEF --> DIS[🟢 Diseño / QA<br/>última: 2026-10-04]:::ok
  ISEF --> CON[🟡 Contenido<br/>16 cursos · 7 novedades]:::warn
  ISEF --> DEP[🟢 Dependencias<br/>0 majors pendientes]:::ok
  ISEF --> TOK[🟢 Contexto IA<br/>CLAUDE.md 2KB]:::ok
  ISEF --> BUN[🟢 Bundle<br/>248KB gz]:::ok
  classDef ok fill:#e8f8ee,stroke:#12a150,color:#0b4d27
  classDef warn fill:#fff6e0,stroke:#c98a00,color:#5c3f00
  classDef bad fill:#ffe9e8,stroke:#d93636,color:#6b1111
  classDef core fill:#7761ff,stroke:#4a2fdb,color:#fff
```

## Qué hacer ahora
1. **[contenido]** 8 alerta(s) de contenido

## Detalle
| Área | Estado | Dato |
|---|---|---|
| Tipos / lint | — | omitido (--quick) |
| Contenido | 🟡 | Curso "Enfermedad Cardiovascular" ya empezó y sigue con etiqueta "¡Nuevo!" · Curso "Fuerza muscular" ya empezó y sigue con etiqueta "¡Nuevo!" · Curso "Inteligencia artificial" ya empezó y sigue con etiqueta "¡Nuevo!" |
| Imports (mayúsculas) | 🟢 | OK |
| Vulnerabilidades | — | sin datos (offline o --quick) |
| Dependencias | 🟢 | al día |
| Bundle JS | 🟢 | 248 KB gzip total · react 73KB, index 36KB, AdminPage 32KB |
| Archivos pesados (tokens) | 🟢 | package-lock.json (171KB), content/cv/nelio-bazan.json (79KB), src/features/test-hiit/StroopTest.tsx (34KB) |

## Últimas auditorías
- **codigo**: 2026-10-04 (`3963eec`)
- **seguridad**: 2026-10-04 (`3963eec`)
- **diseno**: 2026-10-04 (`3963eec`)
- **contenido**: 2026-10-04 (`3963eec`)
- **tokens**: 2026-10-04 (`3963eec`)
