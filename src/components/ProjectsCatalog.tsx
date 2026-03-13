"use client";

import { useEffect, useMemo, useState } from "react";
import ProjectCarousel from "@/components/ProjectCarousel";
import {
  PROJECT_CATEGORY_META,
  PROJECT_CATEGORY_ORDER,
  PROJECT_ITEMS,
  type ProjectCategory
} from "@/domain/projects";

const categoryAnchors: Record<ProjectCategory, string> = {
  eventos: "eventos",
  musicales: "musicales",
  produccion: "produccion",
  cortos: "cortos"
};

type ProjectsFilter = "all" | ProjectCategory;

const ProjectsCatalog = () => {
  const [activeFilter, setActiveFilter] = useState<ProjectsFilter>("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (!isSheetOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSheetOpen]);

  const visibleCategories = useMemo(
    () =>
      activeFilter === "all"
        ? PROJECT_CATEGORY_ORDER
        : PROJECT_CATEGORY_ORDER.filter((category) => category === activeFilter),
    [activeFilter]
  );

  const activeFilterLabel = activeFilter === "all"
    ? "Todos"
    : PROJECT_CATEGORY_META[activeFilter].label;

  const applyFilter = (filter: ProjectsFilter) => {
    setActiveFilter(filter);
    setIsSheetOpen(false);
  };

  return (
    <>
      <nav className="projects-filters" aria-label="Filtrar proyectos por categoría">
        <button
          type="button"
          className={`projects-filter-pill${activeFilter === "all" ? " is-active" : ""}`}
          aria-pressed={activeFilter === "all"}
          onClick={() => applyFilter("all")}
        >
          Todos
        </button>
        {PROJECT_CATEGORY_ORDER.map((category) => (
          <button
            key={`filter-${category}`}
            type="button"
            className={`projects-filter-pill${activeFilter === category ? " is-active" : ""}`}
            aria-pressed={activeFilter === category}
            onClick={() => applyFilter(category)}
          >
            {PROJECT_CATEGORY_META[category].label}
          </button>
        ))}
      </nav>

      <div className="projects-filters-mobile">
        <button
          type="button"
          className="projects-filter-mobile-trigger"
          onClick={() => setIsSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isSheetOpen}
          aria-controls="projects-filter-sheet"
          aria-label={`Abrir filtro de proyectos. Selección actual: ${activeFilterLabel}`}
        >
          <span className="projects-filter-mobile-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                fill="currentColor"
                d="M3 5h18v2H3V5zm4 6h10v2H7v-2zm3 6h4v2h-4v-2z"
              />
            </svg>
          </span>
          <span className="projects-filter-mobile-label">{activeFilterLabel}</span>
          <span aria-hidden="true">▾</span>
        </button>
      </div>

      {isSheetOpen ? (
        <div
          id="projects-filter-sheet"
          className="projects-filter-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Seleccionar categoría de proyectos"
        >
          <button
            type="button"
            className="projects-filter-sheet-backdrop"
            aria-label="Cerrar selector de categorías"
            onClick={() => setIsSheetOpen(false)}
          />
          <div className="projects-filter-sheet-panel">
            <div className="projects-filter-sheet-head">
              <h3>Filtrar proyectos</h3>
              <button type="button" onClick={() => setIsSheetOpen(false)} aria-label="Cerrar filtro">
                Cerrar
              </button>
            </div>
            <div className="projects-filter-sheet-list">
              <button
                type="button"
                className={`projects-filter-sheet-item${activeFilter === "all" ? " is-active" : ""}`}
                aria-pressed={activeFilter === "all"}
                onClick={() => applyFilter("all")}
              >
                Todos
              </button>
              {PROJECT_CATEGORY_ORDER.map((category) => (
                <button
                  key={`sheet-${category}`}
                  type="button"
                  className={`projects-filter-sheet-item${activeFilter === category ? " is-active" : ""}`}
                  aria-pressed={activeFilter === category}
                  onClick={() => applyFilter(category)}
                >
                  {PROJECT_CATEGORY_META[category].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div id="proyectos-catalogo" />
      {visibleCategories.map((category) => {
        const meta = PROJECT_CATEGORY_META[category];
        return (
          <ProjectCarousel
            key={category}
            id={categoryAnchors[category]}
            category={category}
            title={meta.label}
            description={meta.description}
            emptyTitle={meta.emptyTitle}
            emptyDescription={meta.emptyDescription}
            items={PROJECT_ITEMS[category]}
            groupedLayout={activeFilter !== "all"}
            prioritizeFirstItem={activeFilter === "all" && visibleCategories[0] === category}
          />
        );
      })}
    </>
  );
};

export default ProjectsCatalog;
