"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { InstagramIcon, YouTubeIcon } from "@/components/icons";
import type { SocialContentItem, SocialPlatform } from "@/domain/social-content";

const AUTO_SLIDE_MS = 4000;
const HOVER_SLIDE_MS = 9000;
const SWIPE_THRESHOLD_PX = 44;

type SocialCarouselProps = {
  title: string;
  platform: SocialPlatform;
  items: SocialContentItem[];
  isLoading: boolean;
  emptyMessage: string;
  integrationErrorMessage: string;
  hasIntegrationError: boolean;
  fallbackHref: string;
  fallbackCtaLabel: string;
  showIndicators?: boolean;
};

type PreviewState = {
  id: string;
  title: string;
  embedUrl: string;
} | null;

const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const videoId = parsed.searchParams.get("v");
    if (!videoId) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
  } catch {
    return null;
  }
};

const SocialCarousel = ({
  title,
  platform,
  items,
  isLoading,
  emptyMessage,
  integrationErrorMessage,
  hasIntegrationError,
  fallbackHref,
  fallbackCtaLabel,
  showIndicators = true
}: SocialCarouselProps) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [preview, setPreview] = useState<PreviewState>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [imageFailures, setImageFailures] = useState<Record<string, true>>({});
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const safeCurrent = items.length === 0 ? 0 : Math.min(current, items.length - 1);
  const activePreview = useMemo(() => {
    if (!preview) return null;
    return items.some((item) => item.id === preview.id) ? preview : null;
  }, [items, preview]);
  const translate = useMemo(() => safeCurrent * 100, [safeCurrent]);
  useEffect(() => {
    if (activePreview) return;
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, isHovering ? HOVER_SLIDE_MS : AUTO_SLIDE_MS);
    return () => clearInterval(id);
  }, [activePreview, items.length, isHovering]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = () => setIsTouchDevice(mediaQuery.matches);
    apply();
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreview(null);
        setPreviewLoadingId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!activePreview) return;

    const closePreview = () => {
      setPreview(null);
      setPreviewLoadingId(null);
    };

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = event.target as Node | null;
      if (!target) return;

      if (!root.contains(target)) {
        closePreview();
        return;
      }

      const element = target instanceof Element ? target : target.parentElement;
      if (!element) return;
      if (!element.closest(".social-card")) {
        closePreview();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => document.removeEventListener("pointerdown", onPointerDown, { capture: true });
  }, [activePreview]);

  if (isLoading) {
    return (
      <section className={`platform-block ${platform}`}>
        <div className="social-loading">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    const fallbackText = hasIntegrationError ? integrationErrorMessage : emptyMessage;
    return (
      <section className={`platform-block ${platform}`}>
        <div className={`social-fallback social-fallback--${platform}`}>
          <div className="social-fallback-copy">
            <p className="social-fallback-title">
              {platform === "youtube" ? <YouTubeIcon /> : <InstagramIcon />}
              <span>{title}</span>
            </p>
            <p className="social-fallback-text">{fallbackText}</p>
          </div>
          <a
            href={fallbackHref}
            target="_blank"
            rel="noopener noreferrer"
            className="social-fallback-cta"
          >
            {platform === "youtube" ? <YouTubeIcon /> : <InstagramIcon />}
            <span>{fallbackCtaLabel}</span>
          </a>
        </div>
      </section>
    );
  }

  const togglePreview = (item: SocialContentItem, index: number) => {
    if (platform === "instagram" || isTouchDevice) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (activePreview?.id === item.id) {
      setPreview(null);
      setPreviewLoadingId(null);
      return;
    }

    const sourceUrl = getYouTubeEmbedUrl(item.url);

    if (!sourceUrl) return;
    setCurrent(index);
    setPreviewLoadingId(item.id);
    setPreview({
      id: item.id,
      title: item.title,
      embedUrl: sourceUrl
    });
  };

  const goToPrev = () => {
    if (items.length <= 1) return;
    setPreview(null);
    setPreviewLoadingId(null);
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    if (items.length <= 1) return;
    setPreview(null);
    setPreviewLoadingId(null);
    setCurrent((prev) => (prev + 1) % items.length);
  };

  return (
    <section ref={rootRef} className={`platform-block ${platform}`} aria-live="polite">
      <div
        className="carousel-wrapper"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          setTouchStartX(touch.clientX);
          setTouchStartY(touch.clientY);
        }}
        onTouchEnd={(event) => {
          if (touchStartX === null || touchStartY === null) return;
          const touch = event.changedTouches[0];
          const deltaX = touch.clientX - touchStartX;
          const deltaY = touch.clientY - touchStartY;

          setTouchStartX(null);
          setTouchStartY(null);

          // Ignore mostly-vertical gestures so page scroll keeps working.
          if (Math.abs(deltaY) >= Math.abs(deltaX)) return;
          if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

          if (deltaX > 0) {
            goToPrev();
            return;
          }
          goToNext();
        }}
      >
        <div
          className={`carousel-track${isHovering ? " slow-mode" : ""}`}
          style={{
            transform: `translate3d(-${translate}%, 0, 0)`
          }}
        >
          {items.map((item, index) => (
            <article
              className="social-card"
              key={item.id}
            >
              <button
                type="button"
                className="social-card-trigger"
                onClick={() => togglePreview(item, index)}
                aria-pressed={activePreview?.id === item.id}
                aria-label={platform === "instagram" || isTouchDevice ? `Abrir ${item.title} en ${title}` : `Reproducir ${item.title}`}
              >
                <div className={activePreview?.id === item.id ? "social-image-wrap is-previewing" : "social-image-wrap"}>
                  <span className={`media-platform-badge ${platform}`}>{title}</span>
                  {activePreview?.id === item.id ? (
                    <>
                      <iframe
                        src={activePreview.embedUrl}
                        title={activePreview.title}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        onLoad={() => setPreviewLoadingId(null)}
                      />
                      {previewLoadingId === item.id ? <span className="preview-loading">Cargando...</span> : null}
                    </>
                  ) : (
                    <>
                      {platform === "instagram" && imageFailures[item.id] ? (
                        <span className="social-image-error" aria-hidden="true">
                          <InstagramIcon />
                          <span>Vista previa no disponible</span>
                        </span>
                      ) : (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 900px) 100vw, (max-width: 1400px) 50vw, 620px"
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          unoptimized={platform === "instagram"}
                          onError={() => {
                            if (platform !== "instagram") return;
                            setImageFailures((prev) => {
                              if (prev[item.id]) return prev;
                              return {
                                ...prev,
                                [item.id]: true
                              };
                            });
                          }}
                        />
                      )}
                      <span className="inline-play-badge">
                        {platform === "instagram" ? "Ver en Instagram" : "Reproducir"}
                      </span>
                    </>
                  )}
                </div>
                <span className="sr-only">
                  {platform === "instagram"
                    ? "Presiona Enter o Espacio para abrir el contenido en Instagram."
                    : "Presiona Enter o Espacio para reproducir. Presiona Escape para cerrar."}
                </span>
              </button>
            </article>
          ))}
        </div>
      </div>
      {showIndicators ? (
        <div className="carousel-dots">
          {items.map((item, index) => (
            <button
              key={item.id}
              aria-label={`Ir al item ${index + 1}`}
              className={index === safeCurrent ? "dot active" : "dot"}
              onClick={() => {
                setPreview(null);
                setPreviewLoadingId(null);
                setCurrent(index);
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default SocialCarousel;
