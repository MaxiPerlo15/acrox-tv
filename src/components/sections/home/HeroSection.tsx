import Image from "next/image";
import Link from "next/link";
type HeroSectionProps = {
  brandLogoSrc: string;
};

const HeroSection = ({ brandLogoSrc }: HeroSectionProps) => {
  return (
    <section id="inicio" className="hero" data-reveal>
      <div className="hero-copy">
        <p className="tag">
          <span className="tag-live-dot" aria-hidden="true" />
          <span>PRODUCTORA AUDIOVISUAL</span>
        </p>
        <h1>
          <span className="hero-title-line">Producción</span>
          <span className="hero-title-line">audiovisual integral</span>
          <span className="hero-title-line">
            para <span className="hero-title-accent">eventos, marcas</span>
          </span>
          <span className="hero-title-line">y proyectos</span>
          <span className="hero-title-line">culturales.</span>
        </h1>
        <p className="hero-subcopy">
          <span className="hero-subcopy-line">
            Producción audiovisual para eventos, streaming y contenidos que
          </span>
          <span className="hero-subcopy-line">
            conectan con tu audiencia. De Las Varillas a toda la región.
          </span>
        </p>
        <div className="hero-actions">
          <a href="#contacto" className="btn primary">
            Solicitar Propuesta
          </a>
          <Link href="/proyectos" className="btn ghost hero-projects-cta">
            <span>Ver Nuestros Proyectos</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="hero-panel" aria-hidden="true">
        <div className="hero-logo-wrap">
          <Image
            src={brandLogoSrc}
            alt="Logo Acrox"
            width={280}
            height={280}
            sizes="(max-width: 900px) 68vw, 250px"
            className="hero-logo"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
