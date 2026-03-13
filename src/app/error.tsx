"use client";

import Link from "next/link";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

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

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "0 20px",
  borderRadius: 999,
  color: "#f3f6ff",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  background:
    "linear-gradient(90deg, rgba(56, 239, 125, 0.92), rgba(17, 153, 142, 0.92))",
  cursor: "pointer"
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

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main style={wrapperStyle}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Ocurrió un problema al cargar esta página</h1>
      <p style={{ marginBottom: 16 }}>
        Ya estamos mostrando una salida segura para que puedas seguir navegando.
      </p>
      <p style={{ marginBottom: 0 }}>
        Si el problema persiste, volvé al inicio y retomá desde allí.
      </p>
      <div style={actionsStyle}>
        <button type="button" onClick={() => reset()} style={primaryButtonStyle}>
          Reintentar
        </button>
        <Link href="/" style={secondaryLinkStyle}>
          Ir al inicio
        </Link>
      </div>
      {error.digest ? (
        <p style={{ marginTop: 24, color: "rgba(200, 214, 255, 0.72)", fontSize: 14 }}>
          Código de referencia: {error.digest}
        </p>
      ) : null}
    </main>
  );
}
