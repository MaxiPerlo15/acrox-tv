import type { Metadata } from "next";
import { Orbitron, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"]
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://acroxtv.com"),
  title: "Acrox TV | Produccion Audiovisual",
  description:
    "Acrox TV crea contenido audiovisual moderno: cobertura de eventos, edicion, branding visual y piezas para redes sociales.",
  icons: {
    icon: "/logo-acrox.svg",
    shortcut: "/logo-acrox.svg",
    apple: "/logo-acrox.svg"
  },
  openGraph: {
    title: "Acrox TV",
    description: "Produccion audiovisual para marcas, eventos y creadores.",
    url: "https://acroxtv.com",
    siteName: "Acrox TV",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/logo-acrox.svg",
        width: 674,
        height: 674,
        alt: "Logo Acrox TV"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Acrox TV",
    description: "Produccion audiovisual para marcas, eventos y creadores.",
    images: ["/logo-acrox.svg"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
