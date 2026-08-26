import type { ComponentType, SVGProps } from "react";
import {
  AudioServiceIcon,
  CameraServiceIcon,
  EditServiceIcon,
  MusicServiceIcon
} from "@/components/icons";
import {
  ABOUT_IMAGE_SRC,
  BUSINESS,
  BRAND_LOGO_HERO_SRC,
  BRAND_LOGO_SRC,
  OFFICE,
  SITE_URL
} from "@/domain/site-config";

export { ABOUT_IMAGE_SRC, BRAND_LOGO_HERO_SRC, BRAND_LOGO_SRC, SITE_URL };

export type ServiceIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type HomeService = {
  title: string;
  description: string;
  icon: ServiceIcon;
  projectHref: string;
};

export type HomeMetric = {
  value: string;
  label: string;
};

export type HomeEnvLinks = {
  whatsappNumber: string;
  contactEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
};

export const ALTA_DATA_SEARCH_VARIANTS = [
  "Alta Data Te Tire",
  "programa Alta Data Te Tire",
  "streaming Alta Data Te Tire"
] as const;

export const ACROX_STREAMING_PROGRAM = {
  name: "Alta Data ¡Te Tire!",
  alternateName: "Alta Data Te Tire",
  subtitle: "Un programa de streaming de Acrox TV",
  description:
    "Entrevistas, musica en vivo y conversaciones con invitados de la region, conducido por Luichi Garavoglia y Guillermo Chabrando.",
  sectionPath: "/#acroxtv",
  schedule: {
    byDay: "https://schema.org/Friday",
    startTime: "20:00",
    timezone: "America/Argentina/Cordoba"
  },
  hosts: ["Luichi Garavoglia", "Guillermo Chabrando"],
  instagramUrl: "https://www.instagram.com/altadata.tetire/",
  logoSrc: "/alta-data-logo.png"
} as const;

export const HOME_METRICS: HomeMetric[] = [
  { value: "+19", label: "Años de experiencia" },
  { value: "+50", label: "Producciones" },
  { value: "Cobertura Regional", label: "" }
];

export const HOME_SERVICES: HomeService[] = [
  {
    title: "Fotografia y Books para Eventos",
    description: "Cobertura fotografica profesional para eventos sociales, institucionales y marcas.",
    icon: CameraServiceIcon,
    projectHref: "/proyectos#eventos"
  },
  {
    title: "Cortos y Narrativa Cinematografica",
    description: "Desarrollo y realizacion de piezas con lenguaje cinematografico y mirada autoral.",
    icon: EditServiceIcon,
    projectHref: "/proyectos#cortos"
  },
  {
    title: "Producciones Musicales",
    description: "Producción de videoclips y piezas musicales para artistas con identidad visual propia.",
    icon: MusicServiceIcon,
    projectHref: "/proyectos#musicales"
  },
  {
    title: "Direccion y Produccion Audiovisual",
    description: "Direccion de proyectos para escena, TV y videos institucionales o de presentacion.",
    icon: AudioServiceIcon,
    projectHref: "/proyectos#produccion"
  }
];

export const buildLocalBusinessJsonLd = (env: HomeEnvLinks) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#organization`,
      name: BUSINESS.name,
      url: SITE_URL,
      image: `${SITE_URL}${ABOUT_IMAGE_SRC}`,
      logo: `${SITE_URL}${BRAND_LOGO_SRC}`,
      category: BUSINESS.category,
      telephone: BUSINESS.phone,
      description:
        "Produccion audiovisual en Las Varillas, Cordoba. Cobertura de eventos, books, cortos, streaming y contenido para redes.",
      areaServed: ["Las Varillas", "Cordoba", "Argentina"],
      address: {
        "@type": "PostalAddress",
        ...OFFICE.address
      },
      sameAs: [env.instagramUrl, env.tiktokUrl, env.youtubeUrl, `https://wa.me/${env.whatsappNumber}`],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: env.contactEmail,
        telephone: BUSINESS.phone
      }
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#brand`,
      name: BUSINESS.name,
      url: SITE_URL,
      logo: `${SITE_URL}${BRAND_LOGO_SRC}`,
      sameAs: [env.instagramUrl, env.tiktokUrl, env.youtubeUrl]
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: BUSINESS.name,
      publisher: {
        "@id": `${SITE_URL}/#organization`
      }
    },
    {
      "@type": "BroadcastService",
      "@id": `${SITE_URL}${ACROX_STREAMING_PROGRAM.sectionPath}`,
      name: ACROX_STREAMING_PROGRAM.name,
      alternateName: ACROX_STREAMING_PROGRAM.alternateName,
      description: ACROX_STREAMING_PROGRAM.description,
      url: `${SITE_URL}${ACROX_STREAMING_PROGRAM.sectionPath}`,
      image: `${SITE_URL}${ACROX_STREAMING_PROGRAM.logoSrc}`,
      inLanguage: "es-AR",
      areaServed: "Argentina",
      sameAs: [ACROX_STREAMING_PROGRAM.instagramUrl],
      keywords: ALTA_DATA_SEARCH_VARIANTS.join(", "),
      provider: {
        "@id": `${SITE_URL}/#organization`
      },
      partOf: {
        "@id": `${SITE_URL}/#website`
      },
      eventSchedule: {
        "@type": "Schedule",
        byDay: ACROX_STREAMING_PROGRAM.schedule.byDay,
        startTime: ACROX_STREAMING_PROGRAM.schedule.startTime,
        scheduleTimezone: ACROX_STREAMING_PROGRAM.schedule.timezone
      }
    }
  ]
});
