"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadAcroxTvFeedClient, loadProgramFeedClient } from "@/application/acroxtv-feed.client";
import SocialCarousel from "@/components/SocialCarousel";
import { TvGhostIcon, YouTubeIcon } from "@/components/icons";
import type { AcroxTvFeedResponse, EpisodeItem, MediaSurface, ProgramFeedResponse } from "@/domain/acroxtv-feed";
import type { SocialContentItem } from "@/domain/social-content";
import { publicEnv } from "@/lib/public-env";

const EMPTY_FEED: AcroxTvFeedResponse = {
  liveItem: null,
  latestEpisode: null,
  topEpisode: null,
  episodes: [],
  instagram: [],
  youtubeError: false,
  instagramError: false
};

const mapEpisodeToSocialItem = (item: EpisodeItem): SocialContentItem => ({
  id: `youtube-${item.videoId}`,
  platform: "youtube",
  title: item.title,
  url: item.watchUrl,
  thumbnailUrl: item.thumbnailUrl,
  publishedAt: item.publishedAt
});

const AcroxTvMediaSection = () => {
  const [data, setData] = useState<AcroxTvFeedResponse>(EMPTY_FEED);
  const [loading, setLoading] = useState(true);
  const [isLatestPreviewOpen, setIsLatestPreviewOpen] = useState(false);
  const streamingPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const parsed = await loadAcroxTvFeedClient();
        if (!cancelled) {
          setData(parsed);
        }
      } catch {
        if (!cancelled) {
          setData({
            ...EMPTY_FEED,
            youtubeError: true,
            instagramError: true
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const topEpisodeItems = useMemo(
    () => (data.topEpisode ? [mapEpisodeToSocialItem(data.topEpisode)] : []),
    [data.topEpisode]
  );
  const episodeItems = useMemo(
    () => data.episodes.slice(0, 5).map(mapEpisodeToSocialItem),
    [data.episodes]
  );
  const instagramItems = useMemo(() => data.instagram.slice(0, 5), [data.instagram]);

  const latestFallback = !data.liveItem && data.latestEpisode ? data.latestEpisode : null;
  const activeVideo = data.liveItem ?? latestFallback;
  const isLatestEpisodeMode = Boolean(latestFallback && !data.liveItem);
  const shouldRenderInlinePlayer = Boolean(data.liveItem) || (isLatestEpisodeMode && isLatestPreviewOpen);

  useEffect(() => {
    setIsLatestPreviewOpen(false);
  }, [latestFallback?.videoId, data.liveItem?.videoId]);

  useEffect(() => {
    if (!isLatestEpisodeMode || !isLatestPreviewOpen) return;

    const closePreview = () => setIsLatestPreviewOpen(false);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const root = streamingPanelRef.current;
      if (!root) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (!root.contains(target)) {
        closePreview();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
    };
  }, [isLatestEpisodeMode, isLatestPreviewOpen]);

  if (loading) {
    return (
      <div className="live-stream-panel loading">
        <p>Cargando stream de YouTube...</p>
      </div>
    );
  }

  return (
    <>
      {latestFallback ? (
        <p className="content-kicker-line live-episode-kicker">
          ULTIMO EPISODIO
        </p>
      ) : null}
      <div
        ref={streamingPanelRef}
        className={`live-stream-panel${activeVideo ? "" : " empty"}${isLatestEpisodeMode ? " is-latest-episode" : ""}`}
      >
        {activeVideo ? (
          shouldRenderInlinePlayer ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1`}
              title={activeVideo.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="live-stream-preview-trigger"
              onClick={() => setIsLatestPreviewOpen(true)}
              aria-label={`Reproducir ${activeVideo.title}`}
              aria-expanded={isLatestPreviewOpen}
            >
              <span className="live-stream-preview-media">
                <Image
                  src={activeVideo.thumbnailUrl}
                  alt={activeVideo.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 980px"
                  priority
                  loading="eager"
                />
                <span className="inline-play-badge">Reproducir</span>
              </span>
              <span className="sr-only">Presiona Escape para cerrar el reproductor.</span>
            </button>
          )
        ) : (
          <div className="live-fallback">
            <div className="live-fallback-copy">
              <h3>
                <TvGhostIcon className="live-fallback-tv-icon" />
                Streaming en vivo
              </h3>
              <p>Ahora no hay transmisión disponible. Ve al canal para ver nuestro contenido reciente.</p>
            </div>
            <a
              href={publicEnv.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="live-fallback-cta"
            >
              <YouTubeIcon />
              <span>Ir al canal de YouTube</span>
            </a>
          </div>
        )}
      </div>

      <div className="social-feeds-stack social-feeds-stack--three" data-reveal>
        <SocialCarousel
          title="MAS VISTO"
          platform="youtube"
          items={topEpisodeItems}
          isLoading={false}
          emptyMessage="Todavía no hay contenido disponible."
          integrationErrorMessage="No pudimos cargar el contenido en este momento."
          hasIntegrationError={data.youtubeError}
          fallbackHref={publicEnv.youtubeUrl}
          fallbackCtaLabel="Ir al canal de YouTube"
          showIndicators={false}
        />
        <SocialCarousel
          title="EPISODIOS"
          platform="youtube"
          items={episodeItems}
          isLoading={false}
          emptyMessage="Todavía no hay contenido disponible."
          integrationErrorMessage="No pudimos cargar el contenido en este momento."
          hasIntegrationError={data.youtubeError}
          fallbackHref={publicEnv.youtubeUrl}
          fallbackCtaLabel="Ir al canal de YouTube"
          showIndicators={false}
        />
        <SocialCarousel
          title="INSTAGRAM"
          platform="instagram"
          items={instagramItems}
          isLoading={false}
          emptyMessage="Todavía no hay contenido disponible."
          integrationErrorMessage="No pudimos cargar el contenido en este momento."
          hasIntegrationError={data.instagramError}
          fallbackHref={publicEnv.instagramUrl}
          fallbackCtaLabel="Ir al perfil de Instagram"
          showIndicators={false}
        />
      </div>
    </>
  );
};

export default AcroxTvMediaSection;

type ProgramMediaSectionProps = { programSlug: string };

const episodeItems = (surface: MediaSurface<EpisodeItem[]>) => ("items" in surface ? surface.items : []);

const unavailableProgramFeed = (programSlug: string): ProgramFeedResponse => ({
  programSlug,
  episodes: { state: "unavailable" },
  instagram: { state: "unavailable" },
  live: { state: "unavailable" }
});

const youtubeEmbedUrl = (episode: EpisodeItem) =>
  `https://www.youtube-nocookie.com/embed/${episode.videoId}?rel=0&modestbranding=1&autoplay=1`;

type ProgramEpisodePreviewProps = {
  episode: EpisodeItem;
  className: string;
};

const ProgramEpisodePreview = ({ episode, className }: ProgramEpisodePreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !rootRef.current?.contains(target)) close();
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={className}>
      {isOpen ? (
        <iframe
          src={youtubeEmbedUrl(episode)}
          title={episode.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`Reproducir ${episode.title}`}
          aria-expanded={isOpen}
        >
          <Image src={episode.thumbnailUrl} alt={episode.title} fill sizes="(max-width: 700px) 100vw, 800px" />
          <span className="inline-play-badge">Reproducir</span>
        </button>
      )}
    </div>
  );
};

type ProgramEpisodeCarouselProps = {
  title: string;
  episodes: EpisodeItem[];
};

const ProgramEpisodeCarousel = ({ title, episodes }: ProgramEpisodeCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const activeEpisode = episodes[Math.min(current, Math.max(episodes.length - 1, 0))];
  const hasMultipleEpisodes = episodes.length > 1;
  const move = (direction: 1 | -1) => {
    if (!hasMultipleEpisodes) return;
    setCurrent((value) => (value + direction + episodes.length) % episodes.length);
  };

  if (!activeEpisode) return <p>No hay episodios atribuidos a este programa.</p>;

  return (
    <section className="program-episode-carousel" role="region" aria-label={`Carrusel ${title}`}>
      <div className="program-episode-carousel__viewport">
        <ProgramEpisodePreview
          key={activeEpisode.videoId}
          episode={activeEpisode}
          className="program-episode-carousel__preview"
        />
        <div className="program-episode-carousel__copy">
          <p aria-live="polite">{current + 1} de {episodes.length}</p>
          <h3>{activeEpisode.title}</h3>
        </div>
      </div>
      {hasMultipleEpisodes ? (
        <div className="program-episode-carousel__controls">
          <button type="button" onClick={() => move(-1)} aria-label="Episodio anterior">Anterior</button>
          <button type="button" onClick={() => move(1)} aria-label="Siguiente episodio">Siguiente</button>
        </div>
      ) : null}
    </section>
  );
};

export const ProgramMediaSection = ({ programSlug }: ProgramMediaSectionProps) => {
  const [feed, setFeed] = useState<ProgramFeedResponse | null>(null);

  useEffect(() => {
    void loadProgramFeedClient(programSlug).then((response) => {
      setFeed(response.programSlug === programSlug ? response : unavailableProgramFeed(programSlug));
    });
  }, [programSlug]);

  if (!feed) return <p>Cargando programación...</p>;

  const episodes = episodeItems(feed.episodes);
  const latestEpisode = episodes[0];
  const mostViewed = [...episodes].sort((left, right) => right.viewCount - left.viewCount).slice(0, 3);
  const isEpisodeState = feed.episodes.state === "available" || feed.episodes.state === "stale";

  return (
    <section className="program-media" aria-label="Programación del programa">
      <section className="program-latest" aria-labelledby="latest-episode-title">
        <div>
          <p>SEÑAL DEL PROGRAMA</p>
          <h2 id="latest-episode-title">Último episodio</h2>
        </div>
        {feed.episodes.state === "error" ? (
          <p className="program-media-error" role="alert">
            No pudimos cargar la programación de YouTube para este programa.
          </p>
        ) : latestEpisode ? (
          <ProgramEpisodePreview episode={latestEpisode} className="program-latest-preview" />
        ) : (
          <p>{isEpisodeState ? "No hay episodios atribuidos a este programa." : "La programación de YouTube aún no está disponible para este programa."}</p>
        )}
      </section>
      <div className="program-media-grid">
        <section className="program-media-card" aria-labelledby="most-viewed-title">
          <p>LO MÁS VISTO</p>
          <h2 id="most-viewed-title">Más visto</h2>
          {isEpisodeState ? <ProgramEpisodeCarousel title="Más visto" episodes={mostViewed} /> : null}
        </section>
        <section className="program-media-card" aria-labelledby="episodes-title">
          <p>ARCHIVO DE LA SEÑAL</p>
          <h2 id="episodes-title">Episodios</h2>
          {feed.episodes.state === "stale" ? <p>Este contenido puede no estar actualizado.</p> : null}
          {isEpisodeState ? <ProgramEpisodeCarousel title="Episodios" episodes={episodes.slice(0, 4)} /> : null}
        </section>
        <section className="program-media-card program-instagram-card" aria-labelledby="instagram-title">
          <p>CUENTA PROFESIONAL</p>
          <h2 id="instagram-title">Instagram</h2>
          <p>Instagram aún no está disponible para este programa.</p>
        </section>
      </div>
    </section>
  );
};
