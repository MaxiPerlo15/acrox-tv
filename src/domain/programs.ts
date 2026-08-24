export type Program = {
  slug: string;
  name: string;
  summary: string;
  coverLogoSrc?: string;
};

export const RESERVED_TOP_LEVEL_SEGMENTS = ["api", "privacy", "proyectos", "terms"] as const;

export const PROGRAMS = [
  {
    slug: "alta-data-te-tire",
    name: "Alta Data ¡Te Tire!",
    summary: "Conversaciones, música y voces de la región.",
    coverLogoSrc: "/alta-data-logo.png"
  },
  {
    slug: "mas-que-nutricion",
    name: "Más que Nutrición",
    summary: "Bienestar, hábitos y conocimiento para todos los días."
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
