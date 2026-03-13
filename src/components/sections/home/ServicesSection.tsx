import type { HomeService } from "@/domain/home-content";

type ServicesSectionProps = {
  services: HomeService[];
};

const getServiceAccentClass = (projectHref: string) => {
  if (projectHref.includes("#eventos")) return "service-card--eventos";
  if (projectHref.includes("#cortos")) return "service-card--cortos";
  if (projectHref.includes("#musicales")) return "service-card--musicales";
  return "service-card--produccion";
};

const ServicesSection = ({ services }: ServicesSectionProps) => {
  return (
    <section id="servicios" className="section services-section" data-reveal>
      <div className="services-header">
        <p className="services-badge">LO QUE HACEMOS</p>
        <h2 className="services-heading">
          <span className="services-heading-base">Servicios</span>{" "}
          <span className="services-heading-accent">Profesionales</span>
        </h2>
        <p className="services-subheading">
          Combinamos técnica, creatividad y compromiso en cada producción
          <br />
          para que tu mensaje llegue con impacto.
        </p>
      </div>
      <div className="services-grid">
        {services.map((service, index) => (
          <article
            key={service.title}
            className={`service-card ${getServiceAccentClass(service.projectHref)}`}
            data-reveal
            style={{ transitionDelay: `${index * 70}ms` }}
          >
            <div className="service-icon-wrap">
              <service.icon />
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <a href={service.projectHref} className="service-cta">
              Ver más
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
