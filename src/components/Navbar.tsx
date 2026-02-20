"use client";

import { useState } from "react";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#quienes-somos", label: "Nosotros" },
  { href: "#integraciones", label: "Contenido" },
  { href: "#servicios", label: "Servicios" },
  { href: "#contacto", label: "Contacto", highlight: true }
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <a href="#inicio" className="brand">
        <span className="brand-main">
          ACRO<span className="x-char">X</span>
        </span>
        <span className="brand-tv">TV</span>
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
