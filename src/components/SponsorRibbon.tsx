import Image from "next/image";

export type ApprovedSponsor = {
  name: string;
  logoSrc?: string;
};

type SponsorRibbonProps = {
  sponsors?: readonly ApprovedSponsor[];
};

export default function SponsorRibbon({ sponsors = [] }: SponsorRibbonProps) {
  return (
    <section className="sponsor-ribbon" aria-label="Nos acompañan">
      <p>Nos acompañan</p>
      {sponsors.length > 0 ? (
        <ul>
          {sponsors.map((sponsor) => (
            <li key={sponsor.name}>
              {sponsor.logoSrc ? (
                <Image src={sponsor.logoSrc} alt={sponsor.name} width={180} height={72} />
              ) : (
                <span>{sponsor.name}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <span className="sponsor-ribbon-empty">Espacio reservado para aliados aprobados</span>
      )}
    </section>
  );
}
