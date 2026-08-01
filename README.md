# Acrox TV Landing v0

## Requisitos
- Node.js 20+

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

`Next.js` usa `.env.local` en desarrollo.  
`.env.example` es solo plantilla y no se usa en runtime.

## Verificación reproducible

```bash
cp .env.example .env.local
npm run test:contracts
npm run lint
npm run build
```

Los valores `NEXT_PUBLIC_*` de la plantilla son marcadores públicos y seguros para compilar. Reemplazalos con valores públicos reales cuando corresponda; no agregues secretos a `.env.local` ni al repositorio.

## Contrato del registro de programas

`src/domain/programs.ts` exporta `PROGRAMS` como la fuente pública de programas canónicos, `ProgramSlug` como su unión de slugs y `programPath` para generar rutas directas. Los consumidores deben derivar rutas desde estos exports, sin aceptar IDs de proveedores desde el navegador.

```ts
import { PROGRAMS, programPath, type ProgramSlug } from "@/domain/programs";

const slug: ProgramSlug = PROGRAMS[0].slug;
const href = programPath(slug); // "/alta-data"
```

`assertProgramRegistry` recibe `programs`, `staticRouteSegments` y `publicRootPaths`; valida que cada slug use kebab-case, sea único y no colisione con reserved segments, static route segments o public-root paths. Los dos últimos inputs deben obtenerse de los directorios inmediatos de `src/app` y de las rutas raíz de `public`, respectivamente, para que una ruta o asset nuevo no vuelva inaccesible un programa.

## Contrato de fuentes de medios por programa

`src/infrastructure/program-media-sources.ts` es un módulo server-only que exporta `PROGRAM_MEDIA_SOURCES`. Su registro exhaustivo asigna a cada `ProgramSlug` únicamente su fuente de YouTube autorizada; los identificadores de playlist no deben llegar desde el navegador ni provenir de parámetros públicos.

`fetchProgramYouTubeFeed` recibe una fuente `ProgramYouTubeSource` del registro y devuelve solamente los episodios normalizados de su playlist. Los consumidores deben resolver la fuente en el servidor y propagar errores del proveedor sin sustituir contenido de otro programa. La protección por cuota de una fuente programática está aislada de la alimentación legacy de Acrox TV.

## API pública de medios por programa

`GET /api/acroxtv-feed/[slug]` accepts a registered slug only; unknown slugs return body-less `404`; every response uses `Cache-Control: private, no-store, max-age=0`. A `200` payload has `programSlug`, `episodes`, `instagram`, and `live`; a surface is `available` or `stale` with `items` and cache-derived `asOf`, `error` without fallback content, or `unavailable` (`instagram` and `live` currently are `unavailable`).

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test:contracts`
