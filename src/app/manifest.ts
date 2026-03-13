import type { MetadataRoute } from "next";
import { SITE_URL } from "@/domain/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Acrox",
    short_name: "Acrox",
    description:
      "Productora audiovisual en Las Varillas, Cordoba: cobertura de eventos, books, streaming y produccion de contenido.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070e",
    theme_color: "#05070e",
    icons: [
      {
        src: "/logo-acrox-icon-192.png",
        sizes: "192x192",
        type: "image/png"
      }
    ],
    id: SITE_URL
  };
}
