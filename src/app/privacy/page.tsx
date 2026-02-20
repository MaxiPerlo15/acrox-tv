import { env } from "@/lib/env";

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", color: "#f3f6ff" }}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Politica de privacidad</h1>
      <p>
        Acrox TV utiliza los datos enviados en el formulario de contacto unicamente para responder
        consultas comerciales.
      </p>
      <p>
        No compartimos estos datos con terceros, salvo plataformas tecnicas necesarias para la
        comunicacion (por ejemplo, WhatsApp).
      </p>
      <p>
        Si queres actualizar o eliminar tus datos, escribinos a{" "}
        <a href={`mailto:${env.contactEmail}`}>{env.contactEmail}</a>.
      </p>
    </main>
  );
}
