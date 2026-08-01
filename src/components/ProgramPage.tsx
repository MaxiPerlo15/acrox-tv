import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import type { Program } from "@/domain/programs";

type ProgramPageProps = {
  program: Program;
};

export default function ProgramPage({ program }: ProgramPageProps) {
  return (
    <div className="site-shell program-page">
      <Navbar />
      <main className="program-page-main">
        <section className="program-hero" aria-labelledby="program-title">
          <p className="program-hero-kicker">ACROX TV · PROGRAMA</p>
          <h1 id="program-title">{program.name}</h1>
          <p className="program-hero-copy">
            Un espacio editorial de Acrox TV. Conocé las próximas novedades del programa.
          </p>
          <aside className="program-media-notice" aria-label="Estado de programación">
            <p>La programación estará disponible próximamente.</p>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
