import Image from "next/image";

export type ApprovedSponsor = {
  name: string;
  logoSrc?: string;
};

type SponsorRibbonProps = {
  sponsors?: readonly ApprovedSponsor[];
};

const NEUTRAL_CELLS = Array.from({ length: 5 }, (_, index) => index);

export default function SponsorRibbon({ sponsors = [] }: SponsorRibbonProps) {
  const hasApprovedSponsors = sponsors.length > 0;
  const renderCells = (isDuplicate = false) => (
    <ul className="sponsor-ribbon-track" aria-hidden={isDuplicate || undefined}>
      {hasApprovedSponsors
        ? sponsors.map((sponsor) => (
            <li key={sponsor.name} aria-label={sponsor.name}>
              {sponsor.logoSrc ? <Image src={sponsor.logoSrc} alt={sponsor.name} width={180} height={72} /> : <span>{sponsor.name}</span>}
            </li>
          ))
        : NEUTRAL_CELLS.map((cell) => <li key={cell} aria-label="Espacio de colaboración" />)}
    </ul>
  );

  return (
    <section className="sponsor-ribbon" aria-label="Nos acompañan" tabIndex={0}>
      <h2>Con el apoyo de</h2>
      <div className="sponsor-ribbon-viewport">
        <div className="sponsor-ribbon-motion">
          {renderCells()}
          {renderCells(true)}
        </div>
      </div>
    </section>
  );
}
