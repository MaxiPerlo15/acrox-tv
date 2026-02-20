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
  - `getLatestSocialContent()`
  - `buildWhatsAppUrl()`

3. Domain
- `src/domain`
- Entidades y validaciones:
  - modelos de contenido social
  - validacion de formulario de contacto

4. Infrastructure
- `src/infrastructure`
- Clientes de terceros:
  - YouTube Data API
  - Instagram Graph API

5. API Interface
- `src/app/api/social-feed/route.ts`
- Boundary HTTP para UI y posible reutilizacion futura.

## Flujo principal
- UI -> `/api/social-feed` -> Application -> Infrastructure -> APIs externas.
- Si falla YouTube/Instagram:
  - retry (2 intentos + backoff)
  - fallback de contenido
  - warning visible en UI

## Rendering y performance
- Landing estatica por defecto.
- Integraciones con `revalidate` de 300 segundos.
- Lazy loading de imagenes via `next/image`.

## Seguridad y alcance v0
- Tokens de APIs solo en server-side (`.env`).
- Sin datos sensibles ni persistencia de usuario.
- Contacto por WhatsApp con mensaje prellenado.

## Evolucion sugerida (post-v0)
- Agregar endpoint de contacto server-side con Resend.
- Analitica de eventos (clicks y conversion).
- CMS liviano si se requiere editar copy/servicios sin redeploy.
