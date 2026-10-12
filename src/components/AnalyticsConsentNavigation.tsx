"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsConsentNavigation() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("analytics-preferences") === "show") {
      const trigger = document.activeElement as HTMLElement;
      url.searchParams.delete("analytics-preferences");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      window.dispatchEvent(new CustomEvent("acrox:open-analytics-preferences", { detail: { trigger } }));
      window.dispatchEvent(new CustomEvent("acrox:analytics-clean-url", { detail: { url: window.location.href } }));
    } else {
      window.dispatchEvent(new CustomEvent("acrox:analytics-clean-url", { detail: { url: window.location.href } }));
    }
  }, [pathname, search]);

  return null;
}
