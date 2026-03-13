"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadAcroxTvFeedClient } from "@/application/acroxtv-feed.client";
import { BRAND_LOGO_NAV_SRC } from "@/domain/site-config";

const FORCE_LIVE_PREVIEW = false;
const FORCED_LIVE_URL = "https://www.youtube.com/@acroxtv";

const links = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#quienes-somos", label: "Nosotros" },
  { href: "/#acroxtv", label: "ACROX TV", stream: true },
  { href: "/#proyectos", label: "Proyectos" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#contacto", label: "Contacto" }
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>("/#inicio");
  const [isScrolled, setIsScrolled] = useState(false);
  const effectiveLiveUrl = liveUrl ?? (FORCE_LIVE_PREVIEW ? FORCED_LIVE_URL : null);
  const isLive = Boolean(effectiveLiveUrl);

  useEffect(() => {
    const homeSections = [
      "inicio",
      "quienes-somos",
      "acroxtv",
      "proyectos",
      "servicios",
      "contacto"
    ];
    let observer: IntersectionObserver | null = null;

    const syncActiveNav = () => {
      const { pathname, hash } = window.location;
      if (pathname === "/proyectos") {
        setActiveNav("");
        return;
      }
      if (pathname !== "/") {
        setActiveNav("");
        return;
      }
      if (hash && homeSections.includes(hash.replace("#", ""))) {
        setActiveNav(`/${hash}`);
        return;
      }
      setActiveNav("/#inicio");
    };

    const updateScrolled = () => {
      setIsScrolled(window.scrollY > 18);
    };

    updateScrolled();
    syncActiveNav();

    const { pathname } = window.location;
    if (pathname === "/") {
      const sectionElements = homeSections
        .map((id) => document.getElementById(id))
        .filter((node): node is HTMLElement => Boolean(node));

      if (sectionElements.length > 0) {
        observer = new IntersectionObserver(
          (entries) => {
            const visible = entries
              .filter((entry) => entry.isIntersecting)
              .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (visible.length === 0) return;
            const id = visible[0].target.id;
            setActiveNav(`/#${id}`);
          },
          {
            root: null,
            rootMargin: "-34% 0px -50% 0px",
            threshold: [0.12, 0.35, 0.6]
          }
        );

        sectionElements.forEach((section) => observer?.observe(section));
      }
    }

    window.addEventListener("scroll", updateScrolled, { passive: true });
    window.addEventListener("hashchange", syncActiveNav);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", updateScrolled);
      window.removeEventListener("hashchange", syncActiveNav);
    };
  }, []);

  useEffect(() => {
    const loadLiveStatus = async () => {
      try {
        const data = await loadAcroxTvFeedClient();
        const isLive = Boolean(data.liveItem?.isLive);
        setLiveUrl(isLive && data.liveItem?.watchUrl ? data.liveItem.watchUrl : null);
      } catch {
        setLiveUrl(null);
      }
    };

    void loadLiveStatus();
    return () => undefined;
  }, []);

  return (
    <header className={isScrolled ? "navbar is-scrolled" : "navbar"}>
      <Link href="/#inicio" className="brand">
        <Image
          src={BRAND_LOGO_NAV_SRC}
          alt="Logo Acrox"
          width={220}
          height={70}
          sizes="(max-width: 768px) 124px, (max-width: 1440px) 13vw, 184px"
          className="brand-logo"
          priority
        />
      </Link>

      <a
        href={effectiveLiveUrl ?? "/#acroxtv"}
        target={isLive ? "_blank" : undefined}
        rel={isLive ? "noopener noreferrer" : undefined}
        className={isLive ? "nav-stream-mobile is-live" : "nav-stream-mobile"}
        aria-label="Ir a Acrox TV"
      >
        <span>ACROX TV</span>
        {isLive ? <span className="nav-stream-badge animate-pulse">EN VIVO</span> : null}
      </a>

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
        {links.map((link) => {
          const isActiveLink = !link.stream && activeNav === link.href;
          const className = link.stream
            ? (isLive ? "nav-stream-link is-live" : "nav-stream-link")
            : isActiveLink
              ? "active"
              : undefined;
          return (
            <a
              key={link.href}
              href={link.stream && isLive ? effectiveLiveUrl ?? link.href : link.href}
              target={link.stream && isLive ? "_blank" : undefined}
              rel={link.stream && isLive ? "noopener noreferrer" : undefined}
              className={link.stream ? className : `nav-link-default${isActiveLink ? " active" : ""}`}
              aria-current={isActiveLink ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.stream ? (
                <>
                  <span>{link.label}</span>
                  {isLive ? <span className="nav-stream-badge animate-pulse">EN VIVO</span> : null}
                </>
              ) : (
                <span className="nav-link-text">{link.label}</span>
              )}
            </a>
          );
        })}
      </nav>

      <Link href="/#contacto" className="nav-proposal-cta">
        Solicitar Propuesta
      </Link>
    </header>
  );
};

export default Navbar;
