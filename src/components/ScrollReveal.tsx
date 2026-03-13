"use client";

import { useEffect } from "react";

const ScrollReveal = () => {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observed = new WeakSet<Element>();

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
    };
  }, []);

  return null;
};

export default ScrollReveal;
