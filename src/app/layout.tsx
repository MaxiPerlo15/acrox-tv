import type { Metadata } from "next";
import { Exo_2, Montserrat } from "next/font/google";
import "./globals.css";

const display = Exo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"]
});

const body = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const siteUrl = "https://www.acroxtv.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Acrox TV | Produccion Audiovisual en Las Varillas, Cordoba",
    template: "%s | Acrox TV"
  },
  description:
    "Acrox TV es una consultora audiovisual de Las Varillas, Cordoba. Cobertura de eventos, books, cortos, streaming y produccion de contenido para marcas.",
  keywords: [
    "productora audiovisual",
    "consultora audiovisual",
    "Las Varillas",
    "Cordoba",
    "cobertura de eventos",
    "books fotograficos",
    "streaming",
    "videos institucionales",
    "produccion audiovisual"
  ],
  alternates: {
    canonical: siteUrl
  },
  category: "business",
  icons: {
    icon: "/logo-acrox.svg",
    shortcut: "/logo-acrox.svg",
    apple: "/logo-acrox.svg"
  },
  openGraph: {
    title: "Acrox TV | Produccion Audiovisual",
    description:
      "Produccion audiovisual para eventos, marcas y proyectos culturales en Las Varillas y Cordoba.",
    url: siteUrl,
    siteName: "Acrox TV",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/guillermo-chabrando.webp",
        width: 1024,
        height: 1024,
        alt: "Acrox TV - Produccion Audiovisual"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Acrox TV | Produccion Audiovisual",
    description: "Produccion audiovisual para marcas, eventos y proyectos culturales.",
    images: ["/guillermo-chabrando.webp"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
