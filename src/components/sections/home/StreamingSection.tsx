import ProgramDirectoryCard from "@/components/ProgramDirectoryCard";
import SponsorRibbon, { type ApprovedSponsor } from "@/components/SponsorRibbon";
import { PROGRAMS } from "@/domain/programs";

const APPROVED_SPONSORS: readonly ApprovedSponsor[] = [];

const StreamingSection = () => {
  return (
    <section id="acroxtv" className="section program-directory" aria-labelledby="acroxtv-directory-title">
      <div className="program-directory-heading" data-reveal>
        <p>ACROX TV</p>
        <h2 id="acroxtv-directory-title">Programas para quedarse mirando</h2>
      </div>
      <div className="program-directory-grid" role="region" aria-label="Programas de Acrox TV">
        {PROGRAMS.map((program) => (
          <ProgramDirectoryCard key={program.slug} program={program} />
        ))}
      </div>
      <SponsorRibbon sponsors={APPROVED_SPONSORS} />
    </section>
  );
};

export default StreamingSection;
