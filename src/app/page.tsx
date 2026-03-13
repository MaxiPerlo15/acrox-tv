import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import AboutSection from "@/components/sections/home/AboutSection";
import ContactSection from "@/components/sections/home/ContactSection";
import HeroSection from "@/components/sections/home/HeroSection";
import HomeJsonLd from "@/components/sections/home/HomeJsonLd";
import HomeProjectsTeaser from "@/components/sections/home/HomeProjectsTeaser";
import ServicesSection from "@/components/sections/home/ServicesSection";
import StreamingSection from "@/components/sections/home/StreamingSection";
import {
  ABOUT_IMAGE_SRC,
  BRAND_LOGO_HERO_SRC,
  HOME_METRICS,
  HOME_SERVICES
} from "@/domain/home-content";
import { env } from "@/lib/env";

export default function HomePage() {
  return (
    <div className="site-shell home-page">
      <HomeJsonLd
        links={{
          whatsappNumber: env.whatsappNumber,
          contactEmail: env.contactEmail,
          instagramUrl: env.instagramUrl,
          tiktokUrl: env.tiktokUrl,
          youtubeUrl: env.youtubeUrl
        }}
      />
      <Navbar />
      <ScrollReveal />

      <main>
        <div className="sections-wrapper" data-reveal>
          <HeroSection brandLogoSrc={BRAND_LOGO_HERO_SRC} metrics={HOME_METRICS} />
          <AboutSection aboutImageSrc={ABOUT_IMAGE_SRC} />
          <StreamingSection />
          <HomeProjectsTeaser />
          <ServicesSection services={HOME_SERVICES} />
          <ContactSection
            whatsappNumber={env.whatsappNumber}
            contactEmail={env.contactEmail}
            instagramUrl={env.instagramUrl}
            tiktokUrl={env.tiktokUrl}
            youtubeUrl={env.youtubeUrl}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
