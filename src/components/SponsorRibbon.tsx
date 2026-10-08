import Image from "next/image";
import type { ProgramSponsor } from "@/domain/programs";
import { publicEnv } from "@/lib/public-env";

type SponsorRibbonProps = {
  sponsors?: readonly ProgramSponsor[];
  reveal?: boolean;
};

export default function SponsorRibbon({ sponsors = [], reveal = false }: SponsorRibbonProps) {
  const invitationMessage = "Hola, quiero conocer las opciones para ser sponsor de ACROX TV";
  const whatsappHref = `https://wa.me/${publicEnv.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(invitationMessage)}`;
  const emptySlots = Math.max(0, 7 - sponsors.length);

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
      {Array.from({ length: sponsors.length ? 1 : emptySlots }, (_, index) => {
        const canonical = !isDuplicate && index === 0;
        return (
          <li key={`invitation-${index}`} className="sponsor-ribbon-invitation-cell" aria-hidden={canonical ? undefined : true}>
            <a className="sponsor-ribbon-invitation" href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Próximamente. Tu marca acá. Ser sponsor de ACROX TV" tabIndex={canonical ? undefined : -1} aria-hidden={canonical ? undefined : true}>
              <span>Próximamente</span>
              <strong>Tu marca acá</strong>
              <span>Ser sponsor de ACROX TV</span>
            </a>
          </li>
        );
      })}
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
