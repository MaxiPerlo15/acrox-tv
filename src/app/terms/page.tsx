import { env } from "@/lib/env";

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", color: "#f3f6ff" }}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Terminos de servicio</h1>
      <p>
        El acceso y uso del sitio de Acrox TV implica la aceptacion de estos terminos, orientados
        a regular la relacion comercial y el uso informativo del contenido publicado.
      </p>
      <p>
        Las propuestas, presupuestos y tiempos de entrega se acuerdan por escrito en cada proyecto
        particular, segun alcance y necesidades del cliente.
      </p>
      <p>
        Para consultas sobre estos terminos podes escribir a{" "}
        <a href={`mailto:${env.contactEmail}`}>{env.contactEmail}</a>.
      </p>
    </main>
  );
}
