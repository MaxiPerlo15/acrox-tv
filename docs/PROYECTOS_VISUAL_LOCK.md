# /proyectos Visual Lock (No-Regression Contract)

Estado: ACTIVO  
Fecha: 2026-03-07  
Objetivo: congelar layout/UI de `/proyectos` para evitar regresiones mientras se itera `/`.

## Alcance congelado
- Ruta: `/proyectos`
- Estructura general:
  - Hero (`.projects-hero`)
  - Stats strip (`.projects-stats`)
  - Filtros (`.projects-filters`, `.projects-filters-mobile`, sheet mobile)
  - Secciones de catálogo (`.project-section*`)
  - Cards (`.project-card`, `.project-contact-card`)
  - CTA final (`.projects-cta`)
  - Footer variante mobile de proyectos (`.projects-page .footer*`)

## Regla de oro
No tocar markup ni clases de `/proyectos` salvo bugfix puntual.

## Permitido
- Ajustes de contenido (titulares, links, años, tags, assets).
- Bugfixes acotados con scope explícito `.projects-page ...`.
- Mejoras de accesibilidad sin alterar layout visual.

## Prohibido
- Cambiar estructura DOM de `ProjectsCatalog` o `src/app/proyectos/page.tsx`.
- Renombrar clases `projects-*` / `project-*`.
- Mover reglas de proyectos a selectores globales sin scope.
- Cambiar anchos, alturas base o sistema de grid de cards sin revisión visual completa.

## Selectores críticos (no romper)
- `.projects-page`
- `.projects-hero`, `.projects-title`, `.projects-subcopy`, `.projects-stats`
- `.projects-filters`, `.projects-filter-pill`, `.projects-filter-mobile-trigger`, `.projects-filter-sheet*`
- `.project-section`, `.project-section--eventos|musicales|produccion|cortos`
- `.project-grid`, `.project-grid--grouped`
- `.project-card`, `.project-card-link`, `.project-media-wrap`, `.project-card-content`, `.project-card-cta`
- `.project-contact-card`, `.project-contact-button`
- `.projects-cta`, `.projects-cta-inner`, `.projects-cta-button`

## QA mínima obligatoria antes de merge
1. Viewports: 390, 768, 1024, 1440, 1920.
2. Sin overflow horizontal en ningún viewport.
3. Cards mantienen proporciones por categoría y CTA inline al final del grupo.
4. Filtros desktop/mobile operan igual que baseline.
5. Hover/focus/active no alteran alturas de card.
6. Footer mobile de proyectos mantiene layout y jerarquía aprobada.
7. `npm run build` en verde.

## Baseline operacional
- Tomar capturas manuales antes/después en:
  - Hero + stats
  - Primera sección del catálogo
  - CTA final
  - Footer mobile
- Si cambia layout sin intención explícita: rollback del cambio visual.

## Política de cambios futuros
Si se requiere rediseñar `/proyectos`, abrir una rama dedicada y actualizar este contrato en el mismo PR.
