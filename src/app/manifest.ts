import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
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
        src: "/logo-acrox.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
