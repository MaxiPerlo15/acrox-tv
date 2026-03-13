import Link from "next/link";

const wrapperStyle = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "80px 24px",
  color: "#f3f6ff"
} as const;

const actionsStyle = {
  display: "flex",
  gap: 16,
  flexWrap: "wrap" as const,
  marginTop: 28
};

const primaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "0 20px",
  borderRadius: 999,
  color: "#f3f6ff",
  textDecoration: "none",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  background:
    "linear-gradient(90deg, rgba(56, 239, 125, 0.92), rgba(17, 153, 142, 0.92))"
} as const;

const secondaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "0 20px",
  borderRadius: 999,
  color: "#f3f6ff",
  textDecoration: "none",
  border: "1px solid rgba(143, 171, 255, 0.28)",
  background: "rgba(5, 22, 80, 0.34)"
} as const;

export default function NotFound() {
  return (
    <main style={wrapperStyle}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Esta página no está disponible</h1>
      <p style={{ marginBottom: 16 }}>
        El enlace puede haber cambiado o el contenido ya no estar publicado en esta sección.
      </p>
      <p>
        Volvé al inicio para seguir navegando o revisá nuestros proyectos destacados.
      </p>
      <div style={actionsStyle}>
        <Link href="/" style={primaryLinkStyle}>
          Volver al inicio
        </Link>
        <Link href="/proyectos" style={secondaryLinkStyle}>
          Ver proyectos
        </Link>
      </div>
    </main>
  );
}
