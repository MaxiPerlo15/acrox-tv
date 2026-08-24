import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProgramPage from "@/components/ProgramPage";
import { isProgramSlug, PROGRAMS } from "@/domain/programs";

type ProgramRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAMS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProgramRouteProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isProgramSlug(slug)) {
    notFound();
  }

  const program = PROGRAMS.find((entry) => entry.slug === slug);

  if (!program) {
    notFound();
  }

  return {
    title: program.name,
    description: `Novedades de ${program.name} en Acrox TV.`,
    alternates: { canonical: `/${program.slug}` }
  };
}

export default async function DirectProgramPage({ params }: ProgramRouteProps) {
  const { slug } = await params;

  if (!isProgramSlug(slug)) {
    notFound();
  }

  const program = PROGRAMS.find((entry) => entry.slug === slug);

  if (!program) {
    notFound();
  }

  return <ProgramPage program={program} />;
}
