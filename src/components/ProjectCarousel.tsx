"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProjectCategory, ProjectItem } from "@/domain/projects";

type ProjectCarouselProps = {
  id: string;
  category: ProjectCategory;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ProjectItem[];
  groupedLayout?: boolean;
  prioritizeFirstItem?: boolean;
};

const ProjectCarousel = ({
  id,
  category,
  title,
  description,
  emptyTitle,
  emptyDescription,
  items,
  groupedLayout = false,
  prioritizeFirstItem = false
}: ProjectCarouselProps) => {
  const PREVIEW_DURATION_MS = 12000;
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [endedPreviewId, setEndedPreviewId] = useState<string | null>(null);
  const [audioPreviewId, setAudioPreviewId] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);

  const clearPreviewTimer = useCallback(() => {
    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  }, []);

  const getYouTubeVideoId = useCallback((href: string) => {
    try {
      const parsed = new URL(href);
      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.replace("/", "").trim();
      }
      if (parsed.hostname.includes("youtube.com")) {
        return parsed.searchParams.get("v")?.trim() ?? "";
      }
    } catch {
      return "";
    }
    return "";
  }, []);

  const openProject = useCallback((href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  }, []);

  const startPreview = useCallback((item: ProjectItem) => {
    if (item.kind !== "youtube") return;
    if (activePreviewId === item.id) return;

    const videoId = getYouTubeVideoId(item.href);
    if (!videoId) return;

    clearPreviewTimer();
    setEndedPreviewId(null);
    setAudioPreviewId(null);
    setActivePreviewId(item.id);

    previewTimeoutRef.current = window.setTimeout(() => {
      setActivePreviewId(null);
      setEndedPreviewId(item.id);
      previewTimeoutRef.current = null;
    }, PREVIEW_DURATION_MS);
  }, [activePreviewId, clearPreviewTimer, getYouTubeVideoId]);

  const stopPreview = useCallback(() => {
    clearPreviewTimer();
    setActivePreviewId(null);
    setEndedPreviewId(null);
    setAudioPreviewId(null);
  }, [clearPreviewTimer]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = () => setIsTouchDevice(mediaQuery.matches);
    apply();
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    return () => {
      clearPreviewTimer();
    };
  }, [clearPreviewTimer]);

  const categoryPillMap: Record<ProjectCategory, string> = {
    eventos: "Cobertura",
    musicales: "Videoclip",
    produccion: "Producción",
    cortos: "Cine"
  };

  const categoryTagMap: Record<ProjectCategory, string[]> = {
    eventos: ["Evento", "Cobertura"],
    musicales: ["Música", "Artista"],
    produccion: ["Marca", "Narrativa"],
    cortos: ["Ficción", "Cinematografía"]
  };

  const hasItems = items.length > 0;
  const targetColumns = 3;
  const placeholderCount = hasItems && items.length < targetColumns
    ? targetColumns - items.length
    : 0;

  return (
    <section id={id} className={`project-section project-section--${category}`} data-reveal>
      <header className="project-section-head">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      {hasItems ? (
        <div
          className={`project-grid${groupedLayout ? " project-grid--grouped" : ""}`}
          aria-label={`Grilla de proyectos de ${title}`}
        >
          {items.map((item, index) => (
            <article key={item.id} className="project-card" data-reveal style={{ transitionDelay: `${Math.min(index, 7) * 60}ms` }}>
              <div
                className="project-card-link"
                role="link"
                tabIndex={0}
                aria-label={`Abrir proyecto: ${item.title}`}
                onClick={() => openProject(item.href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openProject(item.href);
                  }
                }}
                onMouseEnter={() => {
                  if (!isTouchDevice) {
                    startPreview(item);
                  }
                }}
                onMouseLeave={stopPreview}
                onTouchStart={() => {
                  if (isTouchDevice) {
                    startPreview(item);
                  }
                }}
                onTouchEnd={() => {
                  if (isTouchDevice) {
                    stopPreview();
                  }
                }}
                onTouchCancel={() => {
                  if (isTouchDevice) {
                    stopPreview();
                  }
                }}
                onFocus={() => {
                  if (!isTouchDevice) {
                    startPreview(item);
                  }
                }}
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget as Node | null;
                  if (!event.currentTarget.contains(nextTarget)) {
                    stopPreview();
                  }
                }}
              >
                <div
                  className={`project-media-wrap${endedPreviewId === item.id ? " is-preview-ended" : ""}`}
                >
                  <div className="project-card-meta">
                    <span className="project-pill">{categoryPillMap[category]}</span>
                    <span className="project-year">{item.year ?? ""}</span>
                  </div>
                  {!isTouchDevice && activePreviewId === item.id && item.kind === "youtube" ? (
                    <>
                      <iframe
                        className="project-preview-iframe"
                        src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(item.href)}?autoplay=1&mute=${audioPreviewId === item.id ? "0" : "1"}&controls=0&modestbranding=1&rel=0&playsinline=1&start=0&end=12`}
                        title={`Preview de ${item.title}`}
                        loading="lazy"
                        allow="autoplay; encrypted-media; picture-in-picture"
                      />
                      {audioPreviewId !== item.id ? (
                        <button
                          type="button"
                          className="project-preview-audio"
                          aria-label="Activar audio del preview"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setAudioPreviewId(item.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              setAudioPreviewId(item.id);
                            }
                          }}
                        >
                          Activar audio
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 900px) 100vw, (max-width: 1280px) 33vw, 24vw"
                      priority={prioritizeFirstItem && index === 0}
                      loading={prioritizeFirstItem && index === 0 ? "eager" : "lazy"}
                    />
                  )}
                  {endedPreviewId === item.id ? (
                    <span className="project-preview-finished">
                      Seguir mirando <span aria-hidden="true">→</span>
                    </span>
                  ) : null}
                </div>
                <div className="project-card-content">
                  <h3>{item.title}</h3>
                  <div className="project-tags" aria-label="Etiquetas del proyecto">
                    {categoryTagMap[category].map((tag) => (
                      <span key={`${item.id}-${tag}`} className="project-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="project-card-cta">
                    {item.subtitle ?? "Ver proyecto"} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
          {Array.from({ length: placeholderCount }, (_, index) => (
            <article
              key={`${id}-placeholder-${index}`}
              className="project-card project-placeholder"
              data-reveal
              style={{ transitionDelay: `${Math.min(items.length + index, 7) * 60}ms` }}
              aria-label="Proyecto próximo"
            >
                <div className="project-media-wrap" aria-hidden="true">
                  <div className="project-card-meta">
                    <span className="project-pill">Próximo</span>
                  <span className="project-year">2026</span>
                </div>
                <span className="project-placeholder-tag">Próximo</span>
              </div>
              <div className="project-card-content">
                <h3>Próximamente</h3>
                <p>Estamos curando más proyectos para esta categoría.</p>
              </div>
            </article>
          ))}
          {groupedLayout ? (
            <Link href="/#contacto" className="project-contact-card project-contact-card--inline" data-reveal aria-label="Ir a contacto">
              <div className="project-contact-icon" aria-hidden="true">
                +
              </div>
              <h3>Tu historia aquí</h3>
              <p>
                ¿Tenés un proyecto en mente?
                <br />
                Hagámoslo realidad juntos.
              </p>
              <span className="project-contact-button">
                Contáctanos
              </span>
            </Link>
          ) : null}
        </div>
      ) : (
        <article className="project-card project-empty">
          <div className="project-card-content">
            <h3>{emptyTitle}</h3>
            <p>{emptyDescription}</p>
            <span>Próximamente</span>
          </div>
        </article>
      )}

      {!groupedLayout ? (
        <Link href="/#contacto" className="project-contact-card" data-reveal aria-label="Ir a contacto">
          <div className="project-contact-icon" aria-hidden="true">
            +
          </div>
          <h3>Tu historia aquí</h3>
          <p>
            ¿Tenés un proyecto en mente?
            <br />
            Hagámoslo realidad juntos.
          </p>
          <span className="project-contact-button">
            Contáctanos
          </span>
        </Link>
      ) : null}
    </section>
  );
};

export default ProjectCarousel;
