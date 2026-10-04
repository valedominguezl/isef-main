# Mapa de salud del proyecto

> Generado por `npm run health` el 2026-10-04 (commit `5e80907`). No editar a mano.

```mermaid
flowchart LR
  ISEF((I.S.E.F.<br/>sitio)):::core
  ISEF --> COD[🟡 Código<br/>chequeos OK]:::warn
  ISEF --> SEG[🟢 Seguridad<br/>sin datos]:::ok
  ISEF --> DIS[🟡 Diseño / QA<br/>última: 2026-10-04]:::warn
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
1. **[codigo]** Auditoría de código (347 archivos cambiados desde la última)
2. **[contenido]** 8 alerta(s) de contenido
3. **[diseno]** Auditoría de diseño/QA visual (183 archivos de UI cambiados)

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
- **codigo**: 2026-10-04 (`aaff98d`)
- **seguridad**: 2026-10-04 (`aaff98d`)
- **diseno**: 2026-10-04 (`aaff98d`)
- **contenido**: 2026-10-04 (`aaff98d`)
- **tokens**: 2026-10-04 (`aaff98d`)
