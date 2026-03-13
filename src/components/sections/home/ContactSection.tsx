import ContactForm from "@/components/ContactForm";
import { InstagramIcon, MailIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from "@/components/icons";

type ContactSectionProps = {
  whatsappNumber: string;
  contactEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
};

const ContactSection = ({
  whatsappNumber,
  contactEmail,
  instagramUrl,
  tiktokUrl,
  youtubeUrl
}: ContactSectionProps) => {
  return (
    <section id="contacto" className="section contact" data-reveal>
      <div>
        <p className="contact-kicker-line">
          <span aria-hidden="true" />
          <span>CONTACTO</span>
        </p>
        <h2 className="contact-heading">
          <span>Hablemos de</span>
          <span className="contact-heading-accent">tu proyecto</span>
        </h2>
        <p className="contact-copy">
          <span>Contanos qué necesitás y te respondemos por</span>
          <span>WhatsApp con una propuesta adaptada a tu proyecto</span>
        </p>
        <div className="contact-social-block">
          <h3 className="contact-subtitle">Nuestras Redes</h3>
          <nav className="footer-social-list contact-social-list" aria-label="Redes de contacto">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-link social-link--instagram"
            >
              <InstagramIcon />
              <span>Instagram</span>
            </a>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="social-link social-link--tiktok"
            >
              <TikTokIcon />
              <span>TikTok</span>
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="social-link social-link--youtube"
            >
              <YouTubeIcon />
              <span>YouTube</span>
            </a>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="social-link social-link--whatsapp"
            >
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </a>
            <a href={`mailto:${contactEmail}`} aria-label="Gmail" className="social-link social-link--gmail">
              <MailIcon />
              <span>Gmail</span>
            </a>
          </nav>
        </div>
      </div>
      <ContactForm whatsappNumber={whatsappNumber} />
    </section>
  );
};

export default ContactSection;
