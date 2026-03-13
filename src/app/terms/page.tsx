import type { Metadata } from "next";
import { BRAND_OG_IMAGE_SRC } from "@/domain/site-config";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: {
    absolute: "Términos de servicio | Acrox"
  },
  description:
    "Términos de servicio de Acrox sobre el uso informativo del sitio y las condiciones generales de contratación de proyectos.",
  alternates: {
    canonical: "/terms"
  },
  openGraph: {
    title: "Términos de servicio | Acrox",
    description:
      "Revisá las condiciones generales de uso del sitio y la contratación de servicios audiovisuales de Acrox.",
    url: "/terms",
    type: "website",
    images: [
      {
        url: BRAND_OG_IMAGE_SRC,
        width: 1200,
        height: 630,
        alt: "Acrox - Terminos de servicio"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Términos de servicio | Acrox",
    description:
      "Revisá las condiciones generales de uso del sitio y la contratación de servicios audiovisuales de Acrox.",
    images: [BRAND_OG_IMAGE_SRC]
  }
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", color: "#f3f6ff" }}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Términos de servicio</h1>
      <p style={{ marginBottom: 24 }}>
        El acceso y uso del sitio web de Acrox implica la aceptación de los siguientes términos.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Uso del sitio</h2>
      <p style={{ marginBottom: 24 }}>
        El contenido publicado en este sitio tiene fines informativos sobre los servicios y
        proyectos de Acrox. No constituye una oferta contractual vinculante.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Propuestas y contratación de servicios</h2>
      <p style={{ marginBottom: 24 }}>
        Las propuestas comerciales, presupuestos, plazos de entrega y condiciones específicas de
        trabajo se definen de forma individual para cada proyecto y se formalizan por escrito entre
        las partes.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Propiedad intelectual</h2>
      <p style={{ marginBottom: 24 }}>
        Los contenidos del sitio, incluyendo textos, imágenes, identidad visual y proyectos
        presentados, pertenecen a Acrox o a sus respectivos autores y se utilizan únicamente con
        fines de presentación y referencia.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Responsabilidad</h2>
      <p style={{ marginBottom: 24 }}>
        Acrox realiza esfuerzos razonables para mantener la información del sitio actualizada, pero
        no garantiza que todos los contenidos estén libres de errores u omisiones.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Modificaciones</h2>
      <p style={{ marginBottom: 24 }}>
        Estos términos pueden actualizarse ocasionalmente para reflejar cambios en el sitio o en
        los servicios ofrecidos.
      </p>

      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Contacto</h2>
      <p>
        Para consultas relacionadas con estos términos podés escribir a{" "}
        <a href={`mailto:${env.contactEmail}`}>{env.contactEmail}</a>.
      </p>
    </main>
  );
}
