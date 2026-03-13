# Auditoria Lighthouse + Rendimiento

Este proyecto usa un runner reproducible para auditar performance con Lighthouse en modo mobile-first.

## Objetivo

- Baseline comparativo por pagina/perfil (1 corrida por combinacion en esta iteracion).
- Foco real en UX/percepcion y costo estructural.
- Evitar optimizacion ciega por score.

## Comandos

```bash
# Local prod (build + start + lighthouse)
npm run perf:audit:local

# Preview deploy (requiere BASE_URL)
BASE_URL=https://tu-preview.vercel.app npm run perf:audit:preview

# Reporte combinado local + preview (si existen corridas)
npm run perf:audit:report
```

Opcionales:

```bash
# Omitir fast-4g en paginas smoke
node scripts/lighthouse-audit.mjs --target=local --smoke-fast4g=false

# Puerto local custom
node scripts/lighthouse-audit.mjs --target=local --port=4314
```

## Matriz definida

- Paginas foco: `/`, `/proyectos`
- Perfiles foco: `no-throttle`, `fast-4g`, `slow-4g`, `3g`
- Paginas smoke: `/privacy`, `/terms`
- Perfiles smoke: `no-throttle` (+ `fast-4g` opcional)

## Interpretacion de TTFB

- **Local**: referencia tecnica interna para detectar tendencias.
- **Preview**: fuente principal para analizar TTFB real (infra + CDN + edge).

## Metas orientativas

- `/` en `fast-4g`: ~85+
- `/proyectos` en `fast-4g`: ~80+ aceptable
- `3g`: stress test, no gate estricto

## Artefactos de salida

Los resultados se generan en:

- `artifacts/lighthouse/runs/<run-id>-local/`
- `artifacts/lighthouse/runs/<run-id>-preview/`
- `artifacts/lighthouse/reports/report-latest.md`

Cada corrida incluye:

- `raw/*.json` (salida completa de Lighthouse)
- `summary.json` (datos estructurados)
- `summary.md` (tabla + hallazgos + quick wins + riesgos + no-touch)

## Criterio de priorizacion

- `P0`: afecta UX/percepcion o costo estructural antes de deploy.
- `P1`: muy recomendable para estabilidad y margen de performance.
- `P2`: mejora futura sin impacto inmediato de release.

Regla central: no hacer cambios visuales grandes para subir score si no mejoran UX real.

## Decisiones tecnicas (sprint home `/`)

### 1) Causa raiz del bug de env en cliente

- El bug no era ausencia real de `.env.local`, sino el patron de lectura dinamica `process.env[name]` en codigo compartido.
- En bundle cliente, los `NEXT_PUBLIC_*` deben resolverse por acceso estatico; el lookup dinamico puede quedar `undefined`.
- Efecto observado: excepcion cliente en `/` (`Missing required environment variable`) y Lighthouse contaminado midiendo pantalla de error en lugar del contenido real.

### 2) Separacion `env.ts` server-only vs `public-env.ts`

- `env.ts` queda con `server-only` y mantiene validacion estricta de variables requeridas para contexto server/build/render.
- `public-env.ts` expone configuracion publica tipada con acceso estatico a `NEXT_PUBLIC_*`, apta para componentes cliente.
- Objetivo: mantener hard-fail donde corresponde (server) sin romper runtime del cliente por lookup dinamico.

### 3) No reutilizar assets gigantes para icon/meta/navbar/hero

- Se evita reutilizar el asset institucional grande (`logo-acrox-blanco.png`) en contextos con necesidades distintas.
- Se crean variantes dedicadas por uso:
  - metadata/icon
  - navbar
  - hero
- Criterio: cada contexto usa su tamano/peso objetivo para reducir bytes iniciales y mejorar LCP sin cambiar el look visual final.
