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
  const previewRequested = new URLSearchParams(searchParams).get("analytics-preferences") === "show";

  useEffect(() => {
    const stored = readAnalyticsChoice();
    if (stored === "accepted") enableAnalytics();
    else if (stored === "rejected") disableAnalytics();
    const frame = window.requestAnimationFrame(() => {
      if (previewRequested) {
        const url = new URL(window.location.href);
        if (url.searchParams.get("analytics-preferences") === "show") {
          url.searchParams.delete("analytics-preferences");
          window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
        }
        opener.current = document.activeElement as HTMLElement;
      }
      setChoice(stored);
      setReady(true);
      if (previewRequested) setOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [previewRequested]);

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
      <p>Solo si aceptás, Google Analytics mide visitas, el inicio de edición, los intentos de envío inválidos y los intentos de abrir WhatsApp. Registramos métricas agregadas, sin nombres, mensajes ni datos del formulario.</p>
      <div className={styles.actions}>
        <button type="button" onClick={() => choose("accepted")}>Aceptar analítica</button>
        <button type="button" onClick={() => choose("rejected")}>Rechazar</button>
        {choice === "accepted" && <button type="button" onClick={() => choose("rejected")}>Retirar consentimiento</button>}
      </div>
      <Link href="/privacy">Más información</Link>
    </section>
  ) : null;
}
