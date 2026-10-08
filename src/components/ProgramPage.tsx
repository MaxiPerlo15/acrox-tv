import Image from "next/image";
import Footer from "@/components/Footer";
import { ProgramMediaSection } from "@/components/AcroxTvMediaSection";
import SponsorRibbon from "@/components/SponsorRibbon";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import type { Program } from "@/domain/programs";
import { InstagramIcon } from "@/components/icons";
import styles from "./ProgramPage.module.css";

type ProgramPageProps = {
  program: Program;
};

export default function ProgramPage({ program }: ProgramPageProps) {
  return (
    <div className="program-page">
      <Navbar />
      <ScrollReveal />
      <main className={`${styles.main} program-page-main`}>
        <section className={`${styles.hero} ${program.slug === "alta-data-te-tire" ? styles.alta : styles.nutrition} program-hero`} aria-labelledby="program-title">
          <p className={`${styles.kicker} program-hero-kicker`}><span aria-hidden="true" />ACROX TV</p>
          <h1 id="program-title" className={styles.title}>
            <span className={styles.visuallyHidden}>{program.name}</span>
            <Image className="program-hero-logo" src={program.coverLogoSrc!} alt="" width={1024} height={1024} priority />
          </h1>
          <div className={`${styles.artwork} program-hero-identity`}>
            <Image
              className={`${styles.cover} program-hero-cover`}
              src={program.heroArtworkSrc}
              alt=""
              width={program.heroArtworkWidth}
              height={program.heroArtworkHeight}
              priority
            />
            <Image
              className={`${styles.hostName} program-host-name`}
              src={program.hostNameArtworkSrc}
              alt={program.hostNameArtworkAlt}
              width={program.hostNameArtworkWidth}
              height={program.hostNameArtworkHeight}
              priority
            />
          </div>
          <div className={`${styles.copy} program-hero-copy`}>
            <p className={`${styles.summary} program-hero-summary`}>{program.summary}</p>
            <p className={`${styles.schedule} program-schedule`}><span aria-hidden="true" />{program.schedule}</p>
            <nav className={styles.actions} aria-label="Acciones del programa">
              <a className="btn primary" href="#ultimo-programa">Ver último programa</a>
              <a className={styles.instagramAction} href={program.instagramUrl} target="_blank" rel="noopener noreferrer"><InstagramIcon /><span>Instagram</span></a>
            </nav>
          </div>
        </section>
        <div className={styles.supporting}>
          <ProgramMediaSection programSlug={program.slug} />
          <SponsorRibbon sponsors={program.sponsors} reveal />
        </div>
      </main>
      <div className="site-shell program-footer-shell">
        <Footer anchorPrefix="/" />
      </div>
    </div>
  );
}
