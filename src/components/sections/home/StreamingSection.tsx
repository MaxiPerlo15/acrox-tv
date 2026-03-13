import Image from "next/image";
import { InstagramIcon } from "@/components/icons";
import AcroxTvMediaSection from "@/components/AcroxTvMediaSection";
import PrefillContactCta from "@/components/PrefillContactCta";
import { ACROX_STREAMING_PROGRAM } from "@/domain/home-content";

const StreamingSection = () => {
  return (
    <section id="acroxtv" className="section integrations-section">
      <div className="section-heading integrations-top" data-reveal>
        <div>
          <p className="content-kicker-line">
            <span aria-hidden="true" />
            STREAMING
          </p>
          <p className="content-live-line">● EN VIVO LOS VIERNES 20 HS</p>
          <div
            className="alta-data-brand alta-data-brand--live-anchor"
            aria-label="Marca del programa Alta Data ¡Te Tire!"
          >
            <a
              href={ACROX_STREAMING_PROGRAM.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="alta-data-brand-link"
              aria-label="Abrir Instagram de Alta Data ¡Te Tire!"
            >
              <Image
                src={ACROX_STREAMING_PROGRAM.logoSrc}
                alt="Logo Alta Data ¡Te Tire!"
                width={320}
                height={320}
                sizes="(max-width: 900px) 180px, 220px"
                className="alta-data-brand-logo"
                loading="lazy"
              />
            </a>
            <a
              href={ACROX_STREAMING_PROGRAM.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="alta-data-instagram-link"
              aria-label="Instagram del programa"
            >
              <InstagramIcon />
              <span>Instagram del programa</span>
            </a>
          </div>
          <div className="content-copy">
            <h2 className="content-heading">
              <span className="content-heading-line">ALTA DATA</span>
              <span className="content-heading-line">¡TE TIRE!</span>
            </h2>
            <p className="content-subheadline">{ACROX_STREAMING_PROGRAM.subtitle}</p>
            <p className="content-subcopy">
              Entrevistas, música en vivo y conversaciones con invitados de la región
              <br />
              <span className="content-subcopy-hosts">
                Con Luichi Garavoglia y Guillermo Chabrando
              </span>
            </p>
          </div>
          <div className="content-participate-card projects-cta">
            <div className="projects-cta-inner">
              <div className="projects-cta-copy">
                <h3 className="content-cta-question">¿Querés participar en el programa?</h3>
              </div>
              <PrefillContactCta
                href="#contacto"
                className="btn primary content-cta-button"
                servicePreset="guest-application"
              >
                Postularse como invitado
              </PrefillContactCta>
            </div>
          </div>
        </div>
      </div>
      <div className="integrations-media-grid">
        <AcroxTvMediaSection />
      </div>
    </section>
  );
};

export default StreamingSection;
