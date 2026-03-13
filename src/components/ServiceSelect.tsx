"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "@/components/icons";
import { CONTACT_SERVICE_OPTIONS, type ContactServiceValue } from "@/domain/contact";

type ServiceSelectProps = {
  value: ContactServiceValue | "";
  onChange: (value: ContactServiceValue) => void;
  onBlur?: () => void;
  invalid?: boolean;
};

const ServiceSelect = ({ value, onChange, onBlur, invalid = false }: ServiceSelectProps) => {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const desktopListboxRef = useRef<HTMLDivElement | null>(null);
  const mobileListboxRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches
  );

  const selectedIndex = useMemo(
    () => CONTACT_SERVICE_OPTIONS.findIndex((option) => option.value === value),
    [value]
  );

  const selectedLabel =
    CONTACT_SERVICE_OPTIONS.find((option) => option.value === value)?.label ?? "Selecciona un servicio";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const sync = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    const close = () => {
      setOpen(false);
      onBlur?.();
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current) return;
      if (!rootRef.current.contains(target) && !sheetRef.current?.contains(target)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onBlur]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (!open) return;
    const target = isMobile ? mobileListboxRef.current : desktopListboxRef.current;
    target?.focus();
  }, [open, isMobile]);

  const commitSelection = (nextValue: ContactServiceValue) => {
    onChange(nextValue);
    setOpen(false);
    onBlur?.();
  };

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(() => {
        const base = selectedIndex >= 0 ? selectedIndex : 0;
        if (event.key === "ArrowDown") {
          return Math.min(base + 1, CONTACT_SERVICE_OPTIONS.length - 1);
        }
        return Math.max(base - 1, 0);
      });
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        const option = CONTACT_SERVICE_OPTIONS[activeIndex];
        if (option) {
          commitSelection(option.value);
        }
        return;
      }
      setOpen(true);
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  const onListboxKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, CONTACT_SERVICE_OPTIONS.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = CONTACT_SERVICE_OPTIONS[activeIndex];
      if (option) {
        commitSelection(option.value);
      }
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
      onBlur?.();
    }
  };

  return (
    <div ref={rootRef} className={`service-select${open ? " is-open" : ""}${invalid ? " is-invalid" : ""}`}>
      <button
        type="button"
        className="service-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={value ? "service-select-value" : "service-select-placeholder"}>{selectedLabel}</span>
        <ChevronDownIcon />
      </button>

      {open ? (
        isMobile ? (
          createPortal(
              <div
                ref={sheetRef}
                className="service-select-sheet"
                role="dialog"
                aria-modal="true"
                aria-label="Seleccionar servicio"
              >
                <button
                  type="button"
                  className="service-select-sheet-backdrop"
                  aria-label="Cerrar selector de servicio"
                  onClick={() => {
                    setOpen(false);
                    onBlur?.();
                  }}
                />
                <div className="service-select-sheet-panel">
                  <div className="service-select-sheet-head">
                    <h3>Seleccionar servicio</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onBlur?.();
                      }}
                      aria-label="Cerrar selector"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div
                    ref={mobileListboxRef}
                    id={listboxId}
                    className="service-select-sheet-list"
                    role="listbox"
                    tabIndex={-1}
                    aria-activedescendant={`${listboxId}-${activeIndex}`}
                    onKeyDown={onListboxKeyDown}
                  >
                    {CONTACT_SERVICE_OPTIONS.map((option, index) => {
                      const isSelected = option.value === value;
                      const isActive = index === activeIndex;

                      return (
                        <button
                          key={option.value}
                          id={`${listboxId}-${index}`}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={`service-select-sheet-item${isSelected ? " is-selected" : ""}${isActive ? " is-active" : ""}`}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => commitSelection(option.value)}
                        >
                          <span>{option.label}</span>
                          {isSelected ? <span className="service-select-option-mark">Seleccionado</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>,
              document.body
            )
        ) : (
          <div
            ref={desktopListboxRef}
            id={listboxId}
            className="service-select-listbox"
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`${listboxId}-${activeIndex}`}
            onKeyDown={onListboxKeyDown}
          >
            {CONTACT_SERVICE_OPTIONS.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <button
                  key={option.value}
                  id={`${listboxId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`service-select-option${isSelected ? " is-selected" : ""}${isActive ? " is-active" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commitSelection(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected ? <span className="service-select-option-mark">Seleccionado</span> : null}
                </button>
              );
            })}
          </div>
        )
      ) : null}
    </div>
  );
};

export default ServiceSelect;
