import Image from "next/image";

type AboutSectionProps = {
  aboutImageSrc: string;
};

const AboutSection = ({ aboutImageSrc }: AboutSectionProps) => {
  return (
    <section id="quienes-somos" className="section" data-reveal>
      <div className="about-grid">
        <div className="about-copy">
          <p className="about-kicker-line">
            <span aria-hidden="true" />
            <span>QUIÉNES SOMOS</span>
          </p>
          <h2>
            <span className="about-title-main">Quiénes</span>
            <span className="about-title-accent">Somos</span>
          </h2>
          <p>
            <strong>ACROX</strong> es una productora audiovisual nacida en <strong>Las Varillas</strong>{" "}
            <strong>en 2007</strong>. Desde entonces venimos creando contenido, programas y producciones que
            buscan comunicar ideas, historias y proyectos de la comunidad a través del audiovisual.
          </p>
          <div className="about-secondary-grid">
            <p className="about-secondary-copy">
              A lo largo de los años trabajamos en distintos formatos: cortometrajes, programas de
              televisión, producciones para redes, coberturas de eventos y proyectos culturales. Siempre
              con el mismo <strong>objetivo</strong>: usar el audiovisual como una herramienta para
              <strong> conectar personas, ideas y audiencias</strong>.
            </p>
            <p className="about-secondary-copy">
              Detrás del proyecto está <strong>Guillermo Chabrando, Lic. en Cinematografía y Televisión (UNC)</strong>,
              junto a una red de profesionales que colaboran en cada producción. La experiencia acumulada
              en estos años nos permite abordar cada proyecto con creatividad, compromiso y una mirada
              cercana a la realidad de cada cliente.
            </p>
          </div>
        </div>
        <div className="about-media">
          <Image
            src={aboutImageSrc}
            alt="Guillermo Chabrando, director de Acrox"
            width={1024}
            height={1024}
            sizes="(max-width: 900px) 100vw, (max-width: 1280px) 52vw, 620px"
            className="about-image"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
