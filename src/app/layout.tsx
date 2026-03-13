import type { Metadata } from "next";
import { Exo_2, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BRAND_COPY, BRAND_LOGO_ICON_SRC, BRAND_OG_IMAGE_SRC, SITE_URL } from "@/domain/site-config";
import "./globals.css";

const display = Exo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"]
});

const body = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND_COPY.metadataTitle,
    template: "%s | Acrox"
  },
  description: BRAND_COPY.metadataDescription,
  manifest: "/site.webmanifest",
  keywords: [
    "productora audiovisual",
    "produccion audiovisual",
    "Las Varillas",
    "Cordoba",
    "cobertura de eventos",
    "books fotograficos",
    "streaming",
    "videos institucionales",
    "Alta Data Te Tire",
    "programa Alta Data Te Tire",
    "streaming Alta Data Te Tire"
  ],
  alternates: {
    canonical: SITE_URL,
    languages: {
      "es-AR": SITE_URL
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  category: "business",
  icons: {
    icon: BRAND_LOGO_ICON_SRC,
    shortcut: BRAND_LOGO_ICON_SRC,
    apple: BRAND_LOGO_ICON_SRC
  },
  openGraph: {
    title: BRAND_COPY.openGraphTitle,
    description: BRAND_COPY.openGraphDescription,
    url: SITE_URL,
    siteName: "Acrox",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: BRAND_OG_IMAGE_SRC,
        width: 1200,
        height: 630,
        alt: "Acrox - Produccion audiovisual"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_COPY.twitterTitle,
    description: BRAND_COPY.twitterDescription,
    images: [BRAND_OG_IMAGE_SRC]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${display.variable} ${body.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
