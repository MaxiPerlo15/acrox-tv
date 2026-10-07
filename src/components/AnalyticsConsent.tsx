"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./AnalyticsConsent.module.css";
import { disableAnalytics, enableAnalytics, readAnalyticsChoice, saveAnalyticsChoice, trackPageView, type AnalyticsChoice } from "@/lib/google-analytics";

export default function AnalyticsConsent() {
  const [choice, setChoice] = useState<AnalyticsChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams().toString();

  useEffect(() => {
    const stored = readAnalyticsChoice();
    if (stored === "accepted") enableAnalytics();
    else if (stored === "rejected") disableAnalytics();
    const frame = window.requestAnimationFrame(() => { setChoice(stored); setReady(true); });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => opener.current?.focus());
  }, []);

  useEffect(() => {
    const reopen = (event: Event) => {
      opener.current = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger ?? document.activeElement as HTMLElement;
      setOpen(true);
    };
    window.addEventListener("acrox:open-analytics-preferences", reopen);
    return () => window.removeEventListener("acrox:open-analytics-preferences", reopen);
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && choice) close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, choice, close]);

  useEffect(() => {
    if (choice === "accepted") trackPageView(window.location.href);
  }, [choice, pathname, searchParams]);

  const choose = (next: AnalyticsChoice) => {
    saveAnalyticsChoice(next);
    setChoice(next);
    if (next === "accepted") enableAnalytics();
    else disableAnalytics();
    setOpen(false);
    window.requestAnimationFrame(() => opener.current?.focus());
  };

  if (!ready) return null;
  return !choice || open ? (
    <section ref={panel} className={styles.panel} role="dialog" aria-modal="false" aria-labelledby="consent-title">
      {choice && <button className={styles.close} type="button" onClick={close}>Cerrar</button>}
      <h2 id="consent-title">Tu privacidad importa</h2>
      <p>Google Analytics nos ayuda a medir visitas y clics en WhatsApp, solo si aceptás.</p>
      <div className={styles.actions}>
        <button type="button" onClick={() => choose("accepted")}>Aceptar analítica</button>
        <button type="button" onClick={() => choose("rejected")}>Rechazar</button>
        {choice === "accepted" && <button type="button" onClick={() => choose("rejected")}>Retirar consentimiento</button>}
      </div>
      <Link href="/privacy">Más información</Link>
    </section>
  ) : null;
}
