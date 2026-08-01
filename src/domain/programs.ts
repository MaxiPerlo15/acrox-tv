export type Program = {
  slug: string;
  name: string;
};

export const RESERVED_TOP_LEVEL_SEGMENTS = ["api", "privacy", "proyectos", "terms"] as const;

export const PROGRAMS = [
  { slug: "alta-data", name: "Alta Data ¡Te Tire!" },
  { slug: "mas-que-nutricion", name: "Más que Nutrición" }
] as const satisfies readonly Program[];

export type ProgramSlug = (typeof PROGRAMS)[number]["slug"];

const SLUG_PATTERN = /^[a-z]+(?:-[a-z]+)*$/;

export const programPath = (slug: ProgramSlug) => `/${slug}`;

export const assertProgramRegistry = (
  programs: readonly Program[],
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
