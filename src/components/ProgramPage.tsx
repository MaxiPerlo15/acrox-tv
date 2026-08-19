import Image from "next/image";
import Footer from "@/components/Footer";
import { ProgramMediaSection } from "@/components/AcroxTvMediaSection";
import Navbar from "@/components/Navbar";
import type { Program } from "@/domain/programs";

type ProgramPageProps = {
  program: Program;
};

export default function ProgramPage({ program }: ProgramPageProps) {
  return (
    <div className="program-page">
      <Navbar />
      <main className="program-page-main">
        <section className="program-hero" aria-labelledby="program-title">
          <div className="program-hero-copy">
            <p className="program-hero-kicker">ACROX TV · PROGRAMACIÓN ORIGINAL</p>
            <h1 id="program-title">{program.name}</h1>
            <p>{program.summary}</p>
          </div>
          <div className="program-hero-identity" aria-label={`Identidad de ${program.name}`}>
            {program.coverLogoSrc ? (
              // This is the only approved program identity asset currently available.
              <Image src={program.coverLogoSrc} alt={program.name} width={250} height={160} />
            ) : (
              <span>{program.name}</span>
            )}
          </div>
        </section>
        <ProgramMediaSection programSlug={program.slug} />
      </main>
      <Footer anchorPrefix="/" />
    </div>
  );
}
