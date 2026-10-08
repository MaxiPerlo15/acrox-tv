import type { Metadata } from "next";
import { BRAND_OG_IMAGE_SRC } from "@/domain/site-config";
import { env } from "@/lib/env";
import AnalyticsPreferencesButton from "@/components/AnalyticsPreferencesButton";

export const metadata: Metadata = {
  title: {
    absolute: "Política de privacidad | Acrox"
  },
  description:
    "Política de privacidad de Acrox sobre el uso de los datos enviados a través del formulario de contacto y canales comerciales.",
  alternates: {
    canonical: "/privacy"
  },
  openGraph: {
    title: "Política de privacidad | Acrox",
    description:
      "Conocé cómo Acrox utiliza y resguarda la información enviada desde el formulario de contacto.",
    url: "/privacy",
    type: "website",
    images: [
      {
        url: BRAND_OG_IMAGE_SRC,
        width: 1200,
        height: 630,
        alt: "Acrox - Politica de privacidad"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de privacidad | Acrox",
    description:
      "Conocé cómo Acrox utiliza y resguarda la información enviada desde el formulario de contacto.",
    images: [BRAND_OG_IMAGE_SRC]
  }
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", color: "#f3f6ff" }}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Política de privacidad</h1>
      <p style={{ marginBottom: 24 }}>
        Acrox respeta la privacidad de las personas que visitan este sitio y se comunican a través
        de nuestros canales de contacto.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Datos que recopilamos</h2>
      <p style={{ marginBottom: 24 }}>
        Cuando completás el formulario de contacto, podemos recibir información como tu nombre,
        número de teléfono y el servicio de interés. Estos datos se utilizan únicamente para
        responder consultas comerciales y evaluar posibles proyectos.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Uso de la información</h2>
      <p style={{ marginBottom: 12 }}>La información enviada se utiliza exclusivamente para:</p>
      <ul style={{ marginTop: 0, marginBottom: 24, paddingLeft: 24 }}>
        <li>responder consultas</li>
        <li>preparar propuestas o presupuestos</li>
        <li>coordinar comunicaciones relacionadas con proyectos</li>
      </ul>
      <p style={{ marginBottom: 24 }}>
        No utilizamos estos datos para campañas masivas ni los vendemos a terceros.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Servicios de terceros</h2>
      <p style={{ marginBottom: 24 }}>
        Para responder consultas o mantener la comunicación podemos utilizar plataformas externas,
        como WhatsApp o servicios de correo electrónico. Estas plataformas procesan la información
        según sus propias políticas de privacidad.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Analítica y preferencias</h2>
      <p style={{ marginBottom: 24 }}>
        Google Analytics (GA4) se carga únicamente si aceptás su uso. Mide páginas visitadas, el inicio de edición del formulario, los intentos de envío inválidos y los intentos de abrir WhatsApp. Son métricas agregadas: no enviamos nombres, identidad, valores o errores de campos, servicio seleccionado, mensajes ni URL de WhatsApp; un intento de apertura no confirma que se haya enviado un mensaje. Podés rechazarlo o retirar tu elección desde “Preferencias de analítica”. Al retirar el consentimiento detenemos el envío futuro desde este sitio e intentamos borrar las cookies de Google Analytics accesibles en tu navegador; no podemos borrar registros ya recibidos por Google. Esta preferencia se refiere solo a Google Analytics: la telemetría de Vercel y Google Maps no se modifica.
      </p>

      <AnalyticsPreferencesButton />

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Conservación de datos</h2>
      <p style={{ marginBottom: 24 }}>
        Los datos se conservan únicamente durante el tiempo necesario para gestionar la consulta o
        la relación comercial correspondiente.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Derechos del usuario</h2>
      <p>
        Podés solicitar la actualización o eliminación de tus datos personales en cualquier momento
        escribiendo a <a href={`mailto:${env.contactEmail}`}>{env.contactEmail}</a>.
      </p>
    </main>
  );
}
