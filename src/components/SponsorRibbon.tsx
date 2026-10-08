import Image from "next/image";
import type { ProgramSponsor } from "@/domain/programs";

type SponsorRibbonProps = {
  sponsors?: readonly ProgramSponsor[];
  reveal?: boolean;
};

export default function SponsorRibbon({ sponsors = [], reveal = false }: SponsorRibbonProps) {
  if (sponsors.length === 0) return null;

  const renderCells = (isDuplicate = false) => (
    <ul className="sponsor-ribbon-track" aria-hidden={isDuplicate || undefined}>
      {sponsors.map((sponsor) => (
        <li key={sponsor.name}>
          {sponsor.instagramUrl ? (
            <a href={sponsor.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={sponsor.name} tabIndex={isDuplicate ? -1 : undefined}>
              {sponsor.logoSrc ? <Image src={sponsor.logoSrc} alt={sponsor.name} width={180} height={180} /> : <span>{sponsor.name}</span>}
            </a>
          ) : (
            sponsor.logoSrc ? <Image src={sponsor.logoSrc} alt={sponsor.name} width={180} height={180} /> : <span>{sponsor.name}</span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <section className="sponsor-ribbon" aria-label="Nos acompañan" tabIndex={0} data-reveal={reveal ? "program-sponsors" : undefined}>
      <h2><span aria-hidden="true" />Con el apoyo de</h2>
      <div className="sponsor-ribbon-viewport">
        <div className="sponsor-ribbon-motion">
          {renderCells()}
          {renderCells(true)}
        </div>
      </div>
    </section>
  );
}
