"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AboutMetricCardProps = {
  value: string;
  label: string;
  detail: string;
  delayMs: number;
  counterTo?: number;
  counterPrefix?: string;
};

const AboutMetricCard = ({
  value,
  label,
  detail,
  delayMs,
  counterTo,
  counterPrefix = ""
}: AboutMetricCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!counterTo || hasAnimated) return;

    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        setHasAnimated(true);

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) {
          setDisplayValue(counterTo);
          return;
        }

        const durationMs = 1050;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const nextValue = Math.round(counterTo * eased);
          setDisplayValue(nextValue);

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [counterTo, hasAnimated]);

  const renderedValue = useMemo(() => {
    if (!counterTo) return value;
    return `${counterPrefix}${displayValue}`;
  }, [counterPrefix, counterTo, displayValue, value]);

  return (
    <article
      ref={cardRef}
      className="about-metric-card"
      data-reveal
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <p className="about-metric-value">{renderedValue}</p>
      <p className="about-metric-label">{label}</p>
      <p className="about-metric-detail">{detail}</p>
    </article>
  );
};

export default AboutMetricCard;
