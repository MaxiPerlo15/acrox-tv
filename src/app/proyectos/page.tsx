import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProjectsCatalog from "@/components/ProjectsCatalog";
import ScrollReveal from "@/components/ScrollReveal";
import { BRAND_OG_IMAGE_SRC } from "@/domain/site-config";

export const metadata: Metadata = {
  title: {
    absolute: "Proyectos | Acrox"
  },
  description:
    "Portfolio audiovisual de Acrox con trabajos de cobertura de eventos, producciones musicales, producción y cortos en Las Varillas y Córdoba.",
  alternates: {
    canonical: "/proyectos"
  },
  openGraph: {
    title: "Proyectos | Acrox",
    description:
      "Conocé proyectos de eventos, producciones musicales y producción audiovisual realizados por Acrox.",
    url: "/proyectos",
    images: [
      {
        url: BRAND_OG_IMAGE_SRC,
        width: 1200,
        height: 630,
        alt: "Acrox - Proyectos audiovisuales"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Proyectos | Acrox",
    description:
      "Conocé proyectos de eventos, producciones musicales y producción audiovisual realizados por Acrox.",
    images: [BRAND_OG_IMAGE_SRC]
  }
};

// Visual lock: mantener estructura/clases de /proyectos. Ver docs/PROYECTOS_VISUAL_LOCK.md
export default function ProyectosPage() {
  return (
    <div className="site-shell projects-page">
      <Navbar />
      <ScrollReveal />

      <main>
        <div className="sections-wrapper">
          <section className="section projects-hero" data-reveal>
            <p className="content-kicker-line">
              <span aria-hidden="true" />
              PROYECTOS
            </p>
            <div className="projects-hero-main">
              <h1 className="projects-title">
                <span className="projects-title-line">
                  Creamos <span className="projects-title-accent">historias</span> que
                </span>
                <span className="projects-title-line">conectan.</span>
              </h1>
              <p className="projects-subcopy">
                Productora audiovisual especializada en transformar conceptos en realidades visuales de alto impacto.
              </p>
            </div>
            <div className="projects-stats metrics-strip" aria-label="Métricas de portfolio">
              <article>
                <strong>50+</strong>
                <span>Proyectos realizados</span>
              </article>
              <article>
                <strong>4</strong>
                <span>Categorías activas</span>
              </article>
              <article>
                <strong>100%</strong>
                <span>Compromiso creativo</span>
              </article>
            </div>
          </section>

          <ProjectsCatalog />

          <section className="section projects-cta" data-reveal>
            <div className="projects-cta-inner">
              <div className="projects-cta-copy">
                <h2>¿Tenés un proyecto en mente?</h2>
                <p>Escribinos y armamos una propuesta audiovisual a medida para tu idea o evento.</p>
              </div>
              <Link href="/#contacto" className="btn primary projects-cta-button">
                Solicitar propuesta <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer anchorPrefix="/" />
    </div>
  );
}
