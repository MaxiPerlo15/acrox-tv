"use client";

import { useEffect, useRef, useState } from "react";

type LiveStreamItem = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  isLive: boolean;
  watchUrl: string;
};

type LiveApiResponse = {
  item: LiveStreamItem | null;
  channelUrl: string;
  isMock?: boolean;
  warning?: string;
};

const LiveStreamPanel = () => {
  const [data, setData] = useState<LiveApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [spotlight, setSpotlight] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch("/api/youtube-live", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal
        });
        const json = (await response.json()) as LiveApiResponse;
        setData(json);
      } catch {
        setData({
          item: null,
          channelUrl: "https://www.youtube.com/@GuillermoChabrando",
          warning: "No se pudo cargar el stream ahora."
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!data?.item || !data.item.isLive || data.isMock) {
      return;
    }

    const key = "acrox_live_focus_seen";
    if (window.sessionStorage.getItem(key)) {
      return;
    }

    window.sessionStorage.setItem(key, "1");
    setSpotlight(true);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    }

    const timer = window.setTimeout(() => setSpotlight(false), 6500);
    return () => window.clearTimeout(timer);
  }, [data]);

  if (loading) {
    return (
      <div className="live-stream-panel loading">
        <p>Cargando stream de YouTube...</p>
      </div>
    );
  }

  if (!data?.item) {
    return (
      <div className="live-stream-panel empty">
        <div>
          <h3>Streaming en vivo</h3>
          <p>
            Ahora no hay transmision disponible. Podes ir directo al canal para ver el ultimo
            contenido publicado.
          </p>
          <a href={data?.channelUrl} target="_blank" rel="noopener noreferrer" className="btn ghost">
            Ir al canal de YouTube
          </a>
        </div>
      </div>
    );
  }

  const { item, channelUrl, isMock, warning } = data;
  const embedUrl = `https://www.youtube.com/embed/${item.videoId}?rel=0&modestbranding=1`;
  const isLiveNow = item.isLive && !isMock;

  return (
    <div
      ref={panelRef}
      className={`live-stream-panel${isLiveNow ? " live-now" : ""}${spotlight ? " spotlight" : ""}`}
    >
      {isLiveNow ? (
        <div className="live-spotlight-banner">
          <span className="live-dot" aria-hidden="true" />
          <p>Estamos en vivo ahora</p>
          <a href={item.watchUrl} target="_blank" rel="noopener noreferrer">
            Entrar al stream
          </a>
        </div>
      ) : null}
      <div className="live-stream-header">
        <div>
          <h3>{item.isLive ? "En vivo ahora" : "Ultimo stream del canal"}</h3>
          <p>{item.title}</p>
        </div>
        <div className={isMock ? "live-badge mock" : item.isLive ? "live-badge on" : "live-badge off"}>
          {isMock ? "DEMO" : item.isLive ? "EN VIVO" : "RECIENTE"}
        </div>
      </div>

      <div className="live-stream-embed">
        <iframe
          src={embedUrl}
          title={item.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="live-stream-actions">
        <a href={item.watchUrl} target="_blank" rel="noopener noreferrer" className="btn primary">
          Ver en YouTube
        </a>
        <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="btn ghost">
          Ir al canal
        </a>
      </div>
      {warning ? <p className="live-stream-warning">{warning}</p> : null}
    </div>
  );
};

export default LiveStreamPanel;
