import ProgramDirectoryCard from "@/components/ProgramDirectoryCard";
import { PROGRAMS } from "@/domain/programs";

const StreamingSection = () => {
  return (
    <section id="acroxtv" className="section program-directory" aria-labelledby="acroxtv-directory-title">
      <div className="program-directory-heading" data-reveal>
        <p className="content-kicker-line">
          <span aria-hidden="true" />
          <span>ACROX TV</span>
        </p>
        <h2 id="acroxtv-directory-title">Dos programas. <span>Una señal.</span></h2>
        <p>Conversaciones, datos y bienestar con identidad propia. Elegí una señal para conocer su universo.</p>
      </div>
      <div className="program-directory-grid" role="region" aria-label="Programas de Acrox TV">
        {PROGRAMS.map((program) => (
          <ProgramDirectoryCard key={program.slug} program={program} />
        ))}
      </div>
    </section>
  );
};

export default StreamingSection;
