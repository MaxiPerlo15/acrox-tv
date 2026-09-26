import Image from "next/image";
import Link from "next/link";
import {
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  TikTokIcon,
  WhatsAppIcon,
  YouTubeIcon
} from "@/components/icons";
import { BRAND_COPY, BRAND_LOGO_SRC, OFFICE } from "@/domain/site-config";
import { env } from "@/lib/env";

type FooterProps = {
  anchorPrefix?: string;
  brandHref?: string;
};

const mapsQuery = OFFICE.mapsQuery;
const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`;
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

const Footer = ({ anchorPrefix = "", brandHref = `${anchorPrefix}#inicio` }: FooterProps) => {
  const footerNavLinks = [
    { href: `${anchorPrefix}#inicio`, label: "Inicio" },
    { href: `${anchorPrefix}#quienes-somos`, label: "Nosotros" },
    { href: `${anchorPrefix}#acroxtv`, label: "Acrox TV" },
    { href: `${anchorPrefix}#proyectos`, label: "Proyectos" },
    { href: `${anchorPrefix}#servicios`, label: "Servicios" },
    { href: `${anchorPrefix}#contacto`, label: "Contacto" }
  ];

  return (
    <footer className="footer" data-reveal>
      <div className="footer-grid">
        <section className="footer-col footer-brand-col">
          <a href={brandHref} className="footer-brand" aria-label="Ir al inicio">
            <Image
              src={BRAND_LOGO_SRC}
              alt="Logo Acrox"
              width={300}
              height={96}
              className="footer-brand-logo"
            />
          </a>
          <p>
            {BRAND_COPY.footerDescription}
          </p>
        </section>

        <section className="footer-col footer-nav-col">
          <h3>Explorar</h3>
          <nav className="footer-nav" aria-label="Navegacion del pie de pagina">
            {footerNavLinks.map((link) => (
              <a key={link.href} href={link.href} className="footer-link footer-link--explore">
                {link.label}
              </a>
            ))}
          </nav>
        </section>

        <section className="footer-col footer-social-col">
          <h3>Nuestras Redes</h3>
          <nav className="footer-social-list" aria-label="Redes sociales">
            <a href={env.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link social-link--instagram">
              <InstagramIcon />
              <span>Instagram</span>
            </a>
            <a href={env.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="social-link social-link--tiktok">
              <TikTokIcon />
              <span>TikTok</span>
            </a>
            <a
              href={`https://wa.me/${env.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="social-link social-link--whatsapp"
            >
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </a>
            <a href={env.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-link social-link--youtube">
              <YouTubeIcon />
              <span>YouTube</span>
            </a>
            <a href={`mailto:${env.contactEmail}`} aria-label="Gmail" className="social-link social-link--gmail">
              <MailIcon />
              <span>Gmail</span>
            </a>
          </nav>
          <p className="footer-contact-line">{OFFICE.cityLine}</p>
        </section>

        <section className="footer-col footer-map-col">
          <h3>Ubicacion</h3>
          <div className="map-frame">
            <iframe
              title="Ubicacion de Acrox en Google Maps"
              src={mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={mapsUrl}
            className="footer-map-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="footer-map-link-icon" aria-hidden="true">
              <MapPinIcon />
            </span>
            <span>Ver en Google Maps</span>
            <span aria-hidden="true">→</span>
          </a>
        </section>
      </div>

      <div className="footer-bottom">
        <p>Acrox © {new Date().getFullYear()} - {BRAND_COPY.footerBottom}</p>
        <nav className="footer-legal" aria-label="Enlaces legales">
          <Link href="/privacy">Politica de privacidad</Link>
          <Link href="/terms">Terminos de servicio</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
