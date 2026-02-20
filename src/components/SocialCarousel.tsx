"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { SocialContentItem } from "@/domain/social-content";

type FeedResponse = {
  items: SocialContentItem[];
  source: "live" | "fallback";
  warnings: string[];
};

const AUTO_SLIDE_MS = 4000;

const SocialCarousel = () => {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/social-feed");
        if (!response.ok) {
          throw new Error(`social-feed status ${response.status}`);
        }
        const parsed = (await response.json()) as FeedResponse;
        if (!cancelled) {
          setData(parsed);
        }
      } catch {
        if (!cancelled) {
          setData({
            items: [],
            source: "fallback",
            warnings: ["No se pudo cargar contenido en vivo ahora."]
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => data?.items ?? [], [data]);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(id);
  }, [items.length]);

  useEffect(() => {
    setCurrent(0);
  }, [items.length]);

  if (isLoading) {
    return (
      <div className="social-loading">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="social-warning">No hay contenido disponible en este momento.</p>;
  }

  return (
    <div>
      {data?.warnings?.length ? <p className="social-warning">{data.warnings[0]}</p> : null}
      <div className="carousel-wrapper">
        <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {items.map((item) => (
            <article className="social-card" key={item.id}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <div className="social-image-wrap">
                  <Image src={item.thumbnailUrl} alt={item.title} fill sizes="(max-width: 900px) 100vw, 50vw" />
                </div>
                <div className="social-card-content">
                  <span className={`social-platform ${item.platform}`}>{item.platform}</span>
                  <h3>{item.title}</h3>
                  <time dateTime={item.publishedAt}>
                    {new Date(item.publishedAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </time>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
      <div className="carousel-dots">
        {items.map((item, index) => (
          <button
            key={item.id}
            aria-label={`Ir al item ${index + 1}`}
            className={index === current ? "dot active" : "dot"}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default SocialCarousel;
