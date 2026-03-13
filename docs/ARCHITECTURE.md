# Acrox TV v0 - Arquitectura

## Objetivo
Landing page de conversion rapida para presentar la marca Acrox TV, servicios, contenido reciente de redes y contacto por WhatsApp.

## Estilo arquitectonico
- Monolito Layered sobre Next.js App Router.
- Cliente-servidor clasico (browser consume UI y endpoints internos de Next.js).
- Sin broker, sin colas, sin pub/sub, sin BFF y sin API gateway en esta etapa.

## Capas
1. Presentation
- `src/app`, `src/components`, `src/app/globals.css`
- Render, layout, interacciones de UI, formulario y carrusel.

2. Application
- `src/application`
- Casos de uso:
  - `loadAcroxTvFeedClient()`
  - `buildWhatsAppUrl()`

3. Domain
- `src/domain`
- Entidades y validaciones:
  - modelos de feed social (`AcroxTvFeedResponse`, `SocialContentItem`)
  - validacion de formulario de contacto

4. Infrastructure
- `src/infrastructure`
- Clientes de terceros:
  - YouTube Data API
  - Instagram Graph API
  - Cache SWR-like en memoria con `stale` y `snapshot` (`swr-cache.ts`)

5. API Interface
- `src/app/api/acroxtv-feed/route.ts`
- Boundary HTTP para UI y posible reutilizacion futura.

## Flujo principal
- UI -> `/api/acroxtv-feed` -> Infrastructure -> APIs externas.
- Si falla YouTube/Instagram:
  - se retorna fallback seguro (listas vacias / `null`) para no romper el render
  - el frontend muestra estado de integracion degradada por bloque
  - se intenta servir contenido cacheado cuando existe snapshot

## Rendering y performance
- Landing estatica por defecto.
- Integraciones con `revalidate` de 300 segundos (API route e Instagram fetch).
- Lazy loading de imagenes via `next/image`.

## Seguridad y alcance v0
- Tokens de APIs solo en server-side (`.env`) a traves de `src/lib/env.ts` (`server-only`).
- Variables publicas separadas en `src/lib/public-env.ts` para consumo cliente.
- Sin datos sensibles ni persistencia de usuario.
- Contacto por WhatsApp con mensaje prellenado.

## Evolucion sugerida (post-v0)
- Agregar endpoint de contacto server-side con Resend.
- Analitica de eventos (clicks y conversion).
- CMS liviano si se requiere editar copy/servicios sin redeploy.
- Mover cache de memoria a almacenamiento compartido (Redis/KV) para escalar multi-instancia.
