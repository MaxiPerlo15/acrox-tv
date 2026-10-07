# GA4 y atribución de Google Business Profile

La propiedad GA4 configurada para este sitio es `G-WVV8CMW495`. La carga se condiciona a aceptación explícita en la interfaz de preferencias; rechazar o retirar la elección evita que el sitio envíe eventos a GA4. El control no cambia Vercel Analytics/Speed Insights ni Google Maps.

Con consentimiento explícito se miden vistas de página, el evento existente `click_enviar_whatsapp` (intento de abrir WhatsApp), `contact_form_start` (primera edición iniciada por la persona por montaje del formulario) y `contact_form_invalid_submit` (cada intento de envío inválido no bloqueado). Los dos nuevos eventos del embudo (`contact_form_start` y `contact_form_invalid_submit`) usan únicamente el parámetro fijo `channel: contact_form`. El evento existente `click_enviar_whatsapp` conserva los parámetros fijos `channel: contact_form` y `platform: whatsapp`. No se envían nombres, identidad, valores o errores de campos, servicio seleccionado, texto ni URL de WhatsApp. El evento de WhatsApp indica un intento de apertura, no que se haya enviado un mensaje. La medición puede no estar disponible si GA4 no está listo.

La navegación SPA registra una vista por cambio de ruta o query y el URL de entrada conserva sus parámetros UTM. `send_page_view: false` evita la vista automática de `config`, pero no desactiva por sí solo las mediciones de cambios de historial de Enhanced Measurement: configurar/confirmar en Google Analytics que las vistas basadas en historial de Enhanced Measurement estén desactivadas, o podrían duplicarse las vistas SPA.

El enlace que debe usarse manualmente en Google Business Profile es:

`https://acrox.com.ar/?utm_source=google&utm_medium=organic&utm_campaign=gbp`

No incluye UTM en la URL canónica. No se realizó ninguna modificación remota al perfil. No se fijan aquí retención u opciones de propiedad que no hayan sido verificadas.

## Límites

La elección se persiste en `localStorage`; si el almacenamiento está bloqueado, la sesión aún puede aceptar/rechazar, pero la preferencia no sobrevive a la recarga. Al retirar consentimiento se bloquea GA4 en esta página, actualizamos consentimiento si la función de Google ya está disponible y borramos cookies `_ga*` visibles en el host, `path=/` y dominios accesibles. También se purgan los eventos personalizados del embudo que sigan encolados mientras se carga el script. No podemos garantizar la eliminación de cookies HttpOnly, otros paths/domains, ni datos ya recibidos por Google. Un script de GA descargado no se des-descarga al retirar; la bandera de desactivación impide el envío futuro de GA en el documento.

Las pruebas con interceptación y un script ficticio verifican la lógica de solicitudes y estados, no la recepción o configuración efectiva en Google. Verificación manual pendiente: confirmar que la propiedad de GA4 pertenece al sitio y observar una visita/clic real con aceptación explícita; actualizar manualmente el enlace de sitio web en GBP y verificar que la visita aparezca con campaña `gbp`.
