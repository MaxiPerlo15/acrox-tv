"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadAcroxTvFeedClient, loadProgramFeedClient } from "@/application/acroxtv-feed.client";
import SocialCarousel from "@/components/SocialCarousel";
import { TvGhostIcon, YouTubeIcon } from "@/components/icons";
import type { AcroxTvFeedResponse, EpisodeItem, LiveItem, MediaSurface, ProgramFeedResponse } from "@/domain/acroxtv-feed";
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

type ProgramMediaPanelProps<T extends { title: string; watchUrl?: string; url?: string }> = {
  title: string;
  surface: MediaSurface<T[]>;
  emptyMessage: string;
  unavailableMessage: string;
  errorMessage: string;
};

const ProgramMediaPanel = <T extends { title: string; watchUrl?: string; url?: string }>({
  title,
  surface,
  emptyMessage,
  unavailableMessage,
  errorMessage
}: ProgramMediaPanelProps<T>) => {
  const items = "items" in surface ? surface.items : [];

  return (
    <section className="program-media-notice" aria-label={title}>
      <h2>{title}</h2>
      {surface.state === "stale" ? <p>Este contenido puede no estar actualizado.</p> : null}
      {surface.state === "unavailable" ? <p>{unavailableMessage}</p> : null}
      {surface.state === "error" ? <p role="alert">{errorMessage}</p> : null}
      {(surface.state === "available" || surface.state === "stale") && items.length === 0 ? <p>{emptyMessage}</p> : null}
      {items.length > 0 ? (
        <ul>
          {items.map((item) => {
            const href = item.watchUrl ?? item.url;
            return <li key={href ?? item.title}>{href ? <a href={href}>{item.title}</a> : item.title}</li>;
          })}
        </ul>
      ) : null}
    </section>
  );
};

const ProgramLivePanel = ({ surface }: { surface: MediaSurface<LiveItem | null> }) => (
  <section className="program-media-notice" aria-label="En vivo">
    <h2>En vivo</h2>
    {surface.state === "stale" ? <p>Este contenido puede no estar actualizado.</p> : null}
    {surface.state === "unavailable" ? <p>El streaming en vivo aún no está disponible para este programa.</p> : null}
    {surface.state === "error" ? <p role="alert">No pudimos cargar el streaming en vivo para este programa.</p> : null}
    {(surface.state === "available" || surface.state === "stale") && !surface.items ? (
      <p>No hay streaming en vivo atribuido a este programa.</p>
    ) : null}
    {"items" in surface && surface.items ? <a href={surface.items.watchUrl}>{surface.items.title}</a> : null}
  </section>
);

export const ProgramMediaSection = ({ programSlug }: ProgramMediaSectionProps) => {
  const [feed, setFeed] = useState<ProgramFeedResponse | null>(null);

  useEffect(() => {
    void loadProgramFeedClient(programSlug).then(setFeed);
  }, [programSlug]);

  if (!feed) return <p>Cargando programación...</p>;

  return (
    <div aria-label="Programación del programa">
      <ProgramMediaPanel<EpisodeItem>
        title="Episodios"
        surface={feed.episodes}
        emptyMessage="No hay episodios atribuidos a este programa."
        unavailableMessage="La programación de YouTube aún no está disponible para este programa."
        errorMessage="No pudimos cargar la programación de YouTube para este programa."
      />
      <ProgramMediaPanel<SocialContentItem>
        title="Instagram"
        surface={feed.instagram}
        emptyMessage="No hay publicaciones de Instagram atribuidas a este programa."
        unavailableMessage="Instagram aún no está disponible para este programa."
        errorMessage="No pudimos cargar Instagram para este programa."
      />
      <ProgramLivePanel surface={feed.live} />
    </div>
  );
};
