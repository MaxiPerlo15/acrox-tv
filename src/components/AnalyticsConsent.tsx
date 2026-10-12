"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./AnalyticsConsent.module.css";
import { disableAnalytics, enableAnalytics, readAnalyticsChoice, saveAnalyticsChoice, trackPageView, type AnalyticsChoice } from "@/lib/google-analytics";

const presentationBootstrap = `(()=>{try{const w=document.currentScript?.parentElement;if(!w)return;const v=localStorage.getItem("acrox-ga-consent");const p=new URL(location.href).searchParams.get("analytics-preferences")==="show";w.setAttribute("data-consent-presentation",p?"preview":v==="accepted"||v==="rejected"?v:"unknown")}catch{document.currentScript?.parentElement?.setAttribute("data-consent-presentation","unknown")}})()`;

export default function AnalyticsConsent() {
  const [choice, setChoice] = useState<AnalyticsChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLElement>(null);
  const lastTrackedUrl = useRef("");
  const reportedUrl = useRef("");

  useEffect(() => {
    const stored = readAnalyticsChoice();
    if (stored === "accepted") enableAnalytics();
    else disableAnalytics();
    const url = new URL(window.location.href);
    const preview = url.searchParams.get("analytics-preferences") === "show";
    if (preview) {
      url.searchParams.delete("analytics-preferences");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      opener.current = document.activeElement as HTMLElement;
    }
    const frame = window.requestAnimationFrame(() => {
      setChoice(stored);
      setOpen((current) => current || preview);
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const report = useCallback((url: string) => {
    reportedUrl.current = url;
    if (ready && choice === "accepted" && url && url === window.location.href && url !== lastTrackedUrl.current) {
      lastTrackedUrl.current = url;
      trackPageView(url);
    }
  }, [choice, ready]);

  useEffect(() => {
    const onCleanUrl = (event: Event) => report((event as CustomEvent<{ url: string }>).detail?.url ?? "");
    window.addEventListener("acrox:analytics-clean-url", onCleanUrl);
    if (reportedUrl.current) report(reportedUrl.current);
    return () => window.removeEventListener("acrox:analytics-clean-url", onCleanUrl);
  }, [report]);

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
    if (!open || !ready) return;
    if (choice) panel.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && choice) close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, choice, close, ready]);

  const choose = (next: AnalyticsChoice) => {
    saveAnalyticsChoice(next);
    setChoice(next);
    if (next === "accepted") enableAnalytics();
    else disableAnalytics();
    setOpen(false);
    window.requestAnimationFrame(() => opener.current?.focus());
  };

  const presentation = !ready ? "unknown" : open ? "preview" : choice ?? "unknown";
  return (
    <div className={styles.wrapper} data-consent-presentation={presentation} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: presentationBootstrap }} />
      {!choice || open ? (
        <section ref={panel} className={styles.panel} role="dialog" aria-modal="false" aria-labelledby="consent-title">
          {choice && <button className={styles.close} type="button" onClick={close}>Cerrar</button>}
          <h2 id="consent-title">Tu privacidad importa</h2>
          <p>Solo si aceptás, Google Analytics mide visitas, el inicio de edición, los intentos de envío inválidos y los intentos de abrir WhatsApp. Registramos métricas agregadas, sin nombres, mensajes ni datos del formulario.</p>
          <div className={styles.actions}>
            <button type="button" disabled={!ready} onClick={() => choose("accepted")}>Aceptar analítica</button>
            <button type="button" disabled={!ready} onClick={() => choose("rejected")}>Rechazar</button>
            {choice === "accepted" && <button type="button" disabled={!ready} onClick={() => choose("rejected")}>Retirar consentimiento</button>}
          </div>
          <Link href="/privacy">Más información</Link>
        </section>
      ) : null}
    </div>
  );
}
