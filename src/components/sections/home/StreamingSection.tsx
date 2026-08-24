import ProgramDirectoryCard from "@/components/ProgramDirectoryCard";
import SponsorRibbon, { type ApprovedSponsor } from "@/components/SponsorRibbon";
import { PROGRAMS } from "@/domain/programs";

const APPROVED_SPONSORS = [
  { name: "Magnus", logoSrc: "/sponsors/logo-magnus.webp" },
  { name: "FG Beauty", logoSrc: "/sponsors/logo-fg-beauty.webp" },
  { name: "Noe Peluquería", logoSrc: "/sponsors/logo-noe-peluqueria.webp" },
  { name: "San José", logoSrc: "/sponsors/logo-san-jose.webp" },
  { name: "Checa", logoSrc: "/sponsors/logo-checa.webp" }
] as const satisfies readonly ApprovedSponsor[];

const StreamingSection = () => {
  return (
    <section id="acroxtv" className="section program-directory" aria-labelledby="acroxtv-directory-title">
      <div className="program-directory-heading" data-reveal>
        <p className="content-kicker-line">
          <span aria-hidden="true" />
          <span>ACROX TV / PROGRAMACIÓN ORIGINAL</span>
        </p>
        <h2 id="acroxtv-directory-title">Dos programas. <span>Una señal.</span></h2>
        <p>Conversaciones, datos y bienestar con identidad propia. Elegí una señal para conocer su universo.</p>
      </div>
      <div className="program-directory-grid" role="region" aria-label="Programas de Acrox TV">
        {PROGRAMS.map((program, index) => (
          <ProgramDirectoryCard key={program.slug} program={program} position={index + 1} />
        ))}
      </div>
      <SponsorRibbon sponsors={APPROVED_SPONSORS} />
    </section>
  );
};

export default StreamingSection;
