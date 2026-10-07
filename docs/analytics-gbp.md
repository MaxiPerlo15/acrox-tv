# GA4 y atribución de Google Business Profile

La propiedad GA4 configurada para este sitio es `G-WVV8CMW495`. La carga se condiciona a aceptación explícita en la interfaz de preferencias; rechazar o retirar la elección evita que el sitio envíe eventos a GA4. El control no cambia Vercel Analytics/Speed Insights ni Google Maps.

Se miden vistas de página y el evento `click_enviar_whatsapp`, cuyos únicos parámetros son `channel: contact_form` y `platform: whatsapp`. No se envían campos del formulario. La navegación SPA registra una vista por cambio de ruta o query y el URL de entrada conserva sus parámetros UTM. `send_page_view: false` evita la vista automática de `config`, pero no desactiva por sí solo las mediciones de cambios de historial de Enhanced Measurement: configurar/confirmar en Google Analytics que las vistas basadas en historial de Enhanced Measurement estén desactivadas, o podrían duplicarse las vistas SPA.

El enlace que debe usarse manualmente en Google Business Profile es:

`https://acrox.com.ar/?utm_source=google&utm_medium=organic&utm_campaign=gbp`

No incluye UTM en la URL canónica. No se realizó ninguna modificación remota al perfil. No se fijan aquí retención u opciones de propiedad que no hayan sido verificadas.

## Límites

La elección se persiste en `localStorage`; si el almacenamiento está bloqueado, la sesión aún puede aceptar/rechazar, pero la preferencia no sobrevive a la recarga. Al retirar consentimiento se bloquea GA4 en esta página, actualizamos consentimiento si la función de Google ya está disponible y borramos cookies `_ga*` visibles en el host, `path=/` y dominios accesibles. No podemos garantizar la eliminación de cookies HttpOnly, otros paths/domains, ni datos ya recibidos por Google. Un script de GA descargado no se des-descarga al retirar; la bandera de desactivación impide el envío futuro de GA en el documento.

Las pruebas con interceptación y un script ficticio verifican la lógica de solicitudes y estados, no la recepción o configuración efectiva en Google. Verificación manual pendiente: confirmar que la propiedad de GA4 pertenece al sitio y observar una visita/clic real con aceptación explícita; actualizar manualmente el enlace de sitio web en GBP y verificar que la visita aparezca con campaña `gbp`.
