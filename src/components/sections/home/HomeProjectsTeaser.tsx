import Image from "next/image";
import Link from "next/link";
import {
  HOME_PROJECT_HIGHLIGHTS,
  PROJECT_CATEGORY_META
} from "@/domain/projects";

const HomeProjectsTeaser = () => {
  return (
    <section id="proyectos" className="section home-projects-teaser" data-reveal>
      <header className="home-projects-teaser-head">
        <p className="content-kicker-line">
          <span aria-hidden="true" />
          PROYECTOS
        </p>
        <h2>
          Proyectos destacados de <span className="home-projects-teaser-accent">Acrox</span>
        </h2>
        <p>
          Desde coberturas y producciones musicales hasta piezas audiovisuales y cortos: una
          muestra del trabajo que hacemos en Acrox.
        </p>
      </header>

      <div className="home-projects-teaser-grid">
        {HOME_PROJECT_HIGHLIGHTS.map(({ category, item }, index) => {
          const categoryMeta = PROJECT_CATEGORY_META[category];
          const isExternal = item.href.startsWith("http");

          return (
            <article
              key={`home-highlight-${item.id}`}
              className={`home-projects-teaser-card home-projects-teaser-card--${category}`}
              data-reveal
              style={{ transitionDelay: `${Math.min(index, 5) * 55}ms` }}
            >
              <a
                href={item.href}
                className="home-projects-teaser-link"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-label={`Abrir proyecto destacado: ${item.title}`}
              >
                <div className="home-projects-teaser-media">
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, (max-width: 1280px) 50vw, 20vw"
                    loading="lazy"
                  />
                </div>
                <div className="home-projects-teaser-body">
                  <span className="home-projects-teaser-pill">{categoryMeta.label}</span>
                  <h3>{item.title}</h3>
                  <span className="home-projects-teaser-cta">
                    {item.subtitle ?? "Ver proyecto"} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            </article>
          );
        })}

        <Link
          href="/proyectos"
          className="home-projects-teaser-card home-projects-teaser-card--cta"
          data-reveal
          style={{ transitionDelay: `${Math.min(HOME_PROJECT_HIGHLIGHTS.length, 5) * 55}ms` }}
          aria-label="Ver todos los proyectos"
        >
          <span className="home-projects-teaser-plus" aria-hidden="true">
            +
          </span>
          <h3>Descubrí todos los proyectos</h3>
          <p>Todos nuestros trabajos en un solo lugar, organizados por categoría.</p>
          <span className="home-projects-teaser-main-button">
            <span>Explorar proyectos</span>
            <span aria-hidden="true">→</span>
          </span>
        </Link>
      </div>
    </section>
  );
};

export default HomeProjectsTeaser;
