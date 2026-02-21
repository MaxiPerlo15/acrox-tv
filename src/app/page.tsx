import ContactForm from "@/components/ContactForm";
import LiveStreamPanel from "@/components/LiveStreamPanel";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import SocialCarousel from "@/components/SocialCarousel";
import {
  AudioServiceIcon,
  CameraServiceIcon,
  EditServiceIcon,
  InstagramIcon,
  MailIcon,
  SocialServiceIcon,
  WhatsAppIcon,
  YouTubeIcon
} from "@/components/icons";
import { env } from "@/lib/env";
import Image from "next/image";

const services = [
  {
    title: "Fotografia y Books para Eventos",
    description: "Cobertura fotografica profesional para eventos sociales, institucionales y marcas.",
    icon: CameraServiceIcon
  },
  {
    title: "Cortos y Narrativa Cinematografica",
    description: "Desarrollo y realizacion de piezas con lenguaje cinematografico y mirada autoral.",
    icon: EditServiceIcon
  },
  {
    title: "Streaming y Contenido en Vivo",
    description: "Produccion de formato streaming y contenido digital para conectar con audiencias.",
    icon: SocialServiceIcon
  },
  {
    title: "Direccion y Produccion Audiovisual",
    description: "Direccion de proyectos para escena, TV y videos institucionales o de presentacion.",
    icon: AudioServiceIcon
  }
];

const footerNavLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#quienes-somos", label: "Nosotros" },
  { href: "#integraciones", label: "Contenido" },
  { href: "#servicios", label: "Servicios" },
  { href: "#contacto", label: "Contacto" }
];

const mapsQuery = "Tucuman 32, X5941 Las Varillas, Cordoba, Argentina";
const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`;
const siteUrl = "https://www.acroxtv.com.ar";

export default function HomePage() {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Acrox TV",
    url: siteUrl,
    image: `${siteUrl}/guillermo-chabrando.webp`,
    logo: `${siteUrl}/logo-acrox.svg`,
    description:
      "Consultora y productora audiovisual de Las Varillas, Cordoba. Cobertura de eventos, books, cortos, streaming y contenido para redes.",
    areaServed: ["Las Varillas", "Cordoba", "Argentina"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Tucuman 32",
      addressLocality: "Las Varillas",
      postalCode: "X5941",
      addressRegion: "Cordoba",
      addressCountry: "AR"
    },
    sameAs: [
      env.instagramUrl,
      env.youtubeUrl,
      `https://wa.me/${env.whatsappNumber}`
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: env.contactEmail,
      telephone: `+${env.whatsappNumber}`
    }
  };

  return (
    <div className="site-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Navbar />
      <ScrollReveal />

      <main>
        <section id="inicio" className="hero" data-reveal>
          <div className="hero-copy">
            <p className="tag">PRODUCCION AUDIOVISUAL</p>
            <h1>Produccion audiovisual integral para eventos, marcas y proyectos culturales.</h1>
            <p>
              En Acrox TV combinamos criterio cinematografico, tecnica y estrategia para transformar
              ideas en contenido con impacto real.
            </p>
            <div className="hero-actions">
              <a href="#contacto" className="btn primary">
                Solicitar propuesta
              </a>
              <a href="#integraciones" className="btn ghost">
                Ver trabajos recientes
              </a>
            </div>
          </div>
          <div className="hero-panel" aria-hidden="true">
            <Image
              src="/logo-acrox.svg"
              alt="Logo Acrox TV"
              width={280}
              height={280}
              className="hero-logo"
              priority
            />
            <div className="glow-ring" />
          </div>
        </section>

        <section id="quienes-somos" className="section" data-reveal>
          <div className="about-grid">
            <div className="about-copy">
              <h2>Quienes somos</h2>
              <p>
                <strong>Acrox TV</strong> es una consultora audiovisual de{" "}
                <strong>Las Varillas, Cordoba (Argentina)</strong>, liderada por{" "}
                <strong>Guillermo Chabrando</strong>, licenciado en Cinematografia y Television por
                la <strong>Universidad Nacional de Cordoba (UNC)</strong>. A lo largo de su
                trayectoria participo en cortos cinematograficos, obras de teatro, direccion y
                gestion de canales de television a titulo personal, y desarrollo de videos de
                presentacion para distintos proyectos.
                <span className="about-secondary-copy">
                  Actualmente, Acrox TV impulsa su nuevo canal de <strong>streaming</strong>, junto
                  a cobertura fotografica para eventos y books profesionales. Tambien se desarrollan
                  contenidos para redes con enfoque audiovisual, sin ofrecer gestion completa de
                  community management. Mira el programa en{" "}
                  <a href={env.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    YouTube
                  </a>{" "}
                  y, si queres participar, <a href="#contacto">escribinos</a>.
                </span>
              </p>
            </div>
            <div className="about-media">
              <Image
                src="/guillermo-chabrando.webp"
                alt="Guillermo Chabrando en escenario"
                width={1024}
                height={1024}
                className="about-image"
              />
            </div>
          </div>
        </section>

        <section id="integraciones" className="section" data-reveal>
          <div className="section-heading integrations-top">
            <div>
              <h2>Contenido reciente</h2>
              <p>Ultimos videos y posteos publicados en Instagram y YouTube.</p>
            </div>
            <div className="integration-actions">
              <a href={env.instagramUrl} target="_blank" rel="noopener noreferrer">
                Ver Instagram
              </a>
              <a href={env.youtubeUrl} target="_blank" rel="noopener noreferrer">
                Ver YouTube
              </a>
            </div>
          </div>
          <div className="live-stream-wrap">
            <LiveStreamPanel />
          </div>
          <div className="integrations-shell">
            <SocialCarousel />
          </div>
        </section>

        <section id="servicios" className="section" data-reveal>
          <h2>Servicios</h2>
          <div className="services-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card">
                <div className="service-icon-wrap">
                  <service.icon />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contacto" className="section contact" data-reveal>
          <div>
            <h2>Contacto</h2>
            <p>
              Contanos que necesitas y te respondemos por WhatsApp con una propuesta adaptada a tu
              proyecto.
            </p>
            <h3 className="contact-subtitle">Nuestras Redes</h3>
            <nav className="footer-social-list contact-social-list" aria-label="Redes de contacto">
              <a href={env.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon />
                <span>Instagram</span>
              </a>
              <a href={env.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <YouTubeIcon />
                <span>YouTube</span>
              </a>
              <a
                href={`https://wa.me/${env.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </a>
              <a href={`mailto:${env.contactEmail}`} aria-label="Gmail">
                <MailIcon />
                <span>Gmail</span>
              </a>
            </nav>
          </div>
          <ContactForm whatsappNumber={env.whatsappNumber} />
        </section>
      </main>

      <footer className="footer" data-reveal>
        <div className="footer-grid">
          <section className="footer-col footer-brand-col">
            <a href="#inicio" className="footer-brand" aria-label="Ir al inicio">
              <span className="footer-brand-main">ACROX</span>
              <span className="footer-brand-tv">TV</span>
            </a>
            <p>
              Produccion audiovisual para marcas, eventos y proyectos que buscan verse
              profesionales en el entorno digital.
            </p>
          </section>

          <section className="footer-col">
            <h3>Explorar</h3>
            <nav className="footer-nav" aria-label="Navegacion del pie de pagina">
              {footerNavLinks.map((link) => (
                <a key={link.href} href={link.href} className="footer-link">
                  {link.label}
                </a>
              ))}
            </nav>
          </section>

          <section className="footer-col">
            <h3>Conectar</h3>
            <nav className="footer-social-list" aria-label="Redes sociales">
              <a href={env.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon />
                <span>Instagram</span>
              </a>
              <a
                href={`https://wa.me/${env.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </a>
              <a href={env.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <YouTubeIcon />
                <span>YouTube</span>
              </a>
              <a href={`mailto:${env.contactEmail}`} aria-label="Gmail">
                <MailIcon />
                <span>Gmail</span>
              </a>
            </nav>
            <p className="footer-contact-line">Las Varillas, Cordoba, AR</p>
          </section>

          <section className="footer-col">
            <h3>Ubicacion</h3>
            <div className="map-frame">
              <iframe
                title="Ubicacion de Acrox TV en Google Maps"
                src={mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        </div>

        <div className="footer-bottom">
          <p>Acrox TV © {new Date().getFullYear()} - Produccion Audiovisual</p>
          <nav className="footer-legal" aria-label="Enlaces legales">
            <a href="/privacy">Politica de privacidad</a>
            <a href="/terms">Terminos de servicio</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
