"use client";

import { useEffect } from "react";

const ScrollReveal = () => {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const programPage = document.querySelector<HTMLElement>(".program-page");
    programPage?.classList.add("reveal-ready");

    const observed = new WeakSet<Element>();
    let programMediaReady = Boolean(programPage?.querySelector(".program-media"));

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -14% 0px",
        threshold: 0.12
      }
    );

    const observeElement = (element: Element) => {
      if (!(element instanceof HTMLElement)) return;
      if (!element.hasAttribute("data-reveal")) return;
      if (element.getAttribute("data-reveal") === "program-sponsors" && !programMediaReady) return;
      if (element.classList.contains("is-visible")) return;
      if (observed.has(element)) return;
      observer.observe(element);
      observed.add(element);
    };

    const observeFromRoot = (root: ParentNode) => {
      root.querySelectorAll?.("[data-reveal]").forEach((element) => observeElement(element));
    };

    observeFromRoot(document);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(".program-media") || node.querySelector(".program-media")) {
            programMediaReady = true;
            programPage?.querySelectorAll('[data-reveal="program-sponsors"]').forEach((element) => observeElement(element));
            observeFromRoot(node);
          }
          observeElement(node);
          observeFromRoot(node);
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      programPage?.classList.remove("reveal-ready");
    };
  }, []);

  return null;
};

export default ScrollReveal;
