export type Program = {
  slug: string;
  name: string;
  summary: string;
  schedule: string;
  platform: "ACROX TV / YouTube";
  instagramUrl: string;
  coverLogoSrc?: string;
  coverSrc?: string;
  heroArtworkSrc: string;
  heroArtworkAlt: string;
  heroArtworkWidth: number;
  heroArtworkHeight: number;
  hostNameArtworkSrc: string;
  hostNameArtworkAlt: string;
  hostNameArtworkWidth: number;
  hostNameArtworkHeight: number;
  sponsors?: readonly ProgramSponsor[];
};

export type ProgramSponsor = {
  name: string;
  logoSrc?: string;
  instagramUrl?: string;
};

export const RESERVED_TOP_LEVEL_SEGMENTS = ["api", "privacy", "proyectos", "terms"] as const;

export const PROGRAMS = [
  {
    slug: "alta-data-te-tire",
    name: "Alta Data ¡Te Tire!",
    summary: "Conversaciones, música y voces de la región.",
    schedule: "Jueves · 20:00",
    platform: "ACROX TV / YouTube",
    instagramUrl: "https://www.instagram.com/altadata.tetire/",
    coverLogoSrc: "/alta-data-logo.png",
    coverSrc: "/programs/covers/adtt-1.webp",
    heroArtworkSrc: "/programs/hero/caratula-altadata-trimmed.webp",
    heroArtworkAlt: "Alta Data ¡Te Tire! — identidad gráfica con su conductora",
    heroArtworkWidth: 1064,
    heroArtworkHeight: 1390,
    hostNameArtworkSrc: "/programs/hero/nombre-conductora-adtt-trimmed.webp",
    hostNameArtworkAlt: "Luichi Garavoglia, conductora",
    hostNameArtworkWidth: 2101,
    hostNameArtworkHeight: 259,
    sponsors: [
      { name: "Pinar Tenis Las Varillas", logoSrc: "/programs/sponsors/alta-data/pinar-tenis.webp", instagramUrl: "https://www.instagram.com/pinartenislasvarillas/" },
      { name: "Magnus", logoSrc: "/programs/sponsors/alta-data/magnus.webp", instagramUrl: "https://www.instagram.com/empanadasmagnus/" },
      { name: "FG Beauty", logoSrc: "/programs/sponsors/alta-data/fg-beauty.webp", instagramUrl: "https://www.instagram.com/fgbeautyday/" },
      { name: "San José", logoSrc: "/programs/sponsors/alta-data/san-jose.webp", instagramUrl: "https://www.instagram.com/distribuidora_sanjose/" },
      { name: "Sharol moda", logoSrc: "/programs/sponsors/alta-data/sharol-moda.webp", instagramUrl: "https://www.instagram.com/sharolmoda/" }
    ]
  },
  {
    slug: "mas-que-nutricion",
    name: "Más que Nutrición",
    summary: "Bienestar, hábitos y conocimiento para todos los días.",
    schedule: "Miércoles · 19:30",
    platform: "ACROX TV / YouTube",
    instagramUrl: "https://www.instagram.com/masquenutricion.lv/",
    coverLogoSrc: "/programs/logos/mas-que-nutricion.webp",
    coverSrc: "/programs/covers/mas-que-nutricion-1.webp",
    heroArtworkSrc: "/programs/hero/caratula-masquenutricion-trimmed.webp",
    heroArtworkAlt: "Más que Nutrición — identidad gráfica con su conductora",
    heroArtworkWidth: 1040,
    heroArtworkHeight: 1346,
    hostNameArtworkSrc: "/programs/hero/nombre-conductora-masnutri-trimmed.webp",
    hostNameArtworkAlt: "Romina Cerutti, conductora",
    hostNameArtworkWidth: 2088,
    hostNameArtworkHeight: 470
  }
] as const satisfies readonly Program[];

export type ProgramSlug = (typeof PROGRAMS)[number]["slug"];

const SLUG_PATTERN = /^[a-z]+(?:-[a-z]+)*$/;

export const programPath = (slug: string) => `/${slug}`;

export const assertProgramRegistry = (
  programs: readonly { slug: string }[],
  staticRouteSegments: readonly string[] = [],
  publicRootPaths: readonly string[] = []
) => {
  const seenSlugs = new Set<string>();

  for (const { slug } of programs) {
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error(`Program slug "${slug}" must use lowercase kebab-case.`);
    }

    if (seenSlugs.has(slug)) {
      throw new Error(`Program slug "${slug}" must be unique.`);
    }

    if (RESERVED_TOP_LEVEL_SEGMENTS.includes(slug as (typeof RESERVED_TOP_LEVEL_SEGMENTS)[number])) {
      throw new Error(`Program slug "${slug}" is reserved.`);
    }

    if (staticRouteSegments.includes(slug)) {
      throw new Error(`Program slug "${slug}" collides with a static route.`);
    }

    if (publicRootPaths.includes(slug)) {
      throw new Error(`Program slug "${slug}" collides with a public path.`);
    }

    seenSlugs.add(slug);
  }
};

export const isProgramSlug = (slug: string): slug is ProgramSlug =>
  PROGRAMS.some((program) => program.slug === slug);

assertProgramRegistry(PROGRAMS);
