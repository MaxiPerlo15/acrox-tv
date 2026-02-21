"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#quienes-somos", label: "Nosotros" },
  { href: "#integraciones", label: "Contenido" },
  { href: "#servicios", label: "Servicios" },
  { href: "#contacto", label: "Contacto", highlight: true }
];

type LiveApiResponse = {
  item?: {
    isLive?: boolean;
    watchUrl?: string;
  } | null;
  isMock?: boolean;
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadLiveStatus = async () => {
      try {
        const response = await fetch("/api/youtube-live", { cache: "no-store" });
        const data = (await response.json()) as LiveApiResponse;
        const isLive = Boolean(data.item?.isLive) && !data.isMock;
        if (!active) return;
        setLiveUrl(isLive && data.item?.watchUrl ? data.item.watchUrl : null);
      } catch {
        if (!active) return;
        setLiveUrl(null);
      }
    };

    void loadLiveStatus();
    const interval = window.setInterval(loadLiveStatus, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <header className="navbar">
      <a href="#inicio" className="brand">
        <span className="brand-main">
          ACRO<span className="x-char">X</span>
        </span>
        <span className="brand-tv">TV</span>
      </a>

      {liveUrl ? (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-live-mobile"
          aria-label="Ir al stream en vivo"
        >
          EN VIVO
        </a>
      ) : null}

      <button
        className="menu-toggle"
        type="button"
        aria-label="Abrir menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={open ? "nav-links open" : "nav-links"}>
        {liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-live-link"
            onClick={() => setOpen(false)}
          >
            EN VIVO
          </a>
        ) : null}
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={link.highlight ? "nav-contact" : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="nav-spacer" aria-hidden="true" />
    </header>
  );
};

export default Navbar;
