import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { disableAnalytics, enableAnalytics, GA_ID, trackPageView, trackWhatsAppClick } from "@/lib/google-analytics";

test("GA4 helpers require explicit grant and queue only approved fields", () => {
  const queued: unknown[] = [];
  const fakeWindow = { dataLayer: queued, location: { hostname: "www.acrox.com.ar" } } as unknown as Window & { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void; [key: string]: unknown };
  const cookieWrites: string[] = [];
  const fakeDocument = {
    get cookie() { return "_ga=host; _ga_test=parent"; },
    set cookie(value: string) { cookieWrites.push(value); },
    head: { appendChild: () => undefined },
    querySelector: () => null,
    createElement: () => ({ dataset: {}, set async(_value: boolean) {}, set src(_value: string) {} })
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  Object.defineProperty(globalThis, "document", { configurable: true, value: fakeDocument });

  trackPageView("https://acrox.com.ar/?utm_campaign=gbp");
  trackWhatsAppClick();
  expect(queued).toHaveLength(0);

  enableAnalytics();
  trackPageView("https://acrox.com.ar/?utm_campaign=gbp");
  trackWhatsAppClick();
  const commands = queued.map((entry) => Array.from(entry as ArrayLike<unknown>));
  expect(commands.some(([command, id]) => command === "config" && id === GA_ID)).toBe(true);
  expect(commands).toContainEqual(["event", "page_view", { page_location: "https://acrox.com.ar/?utm_campaign=gbp" }]);
  expect(commands).toContainEqual(["event", "click_enviar_whatsapp", { channel: "contact_form", platform: "whatsapp" }]);
  disableAnalytics();
  const lengthAfterRevoke = queued.length;
  trackWhatsAppClick();
  expect(queued).toHaveLength(lengthAfterRevoke);
  expect(fakeWindow[`ga-disable-${GA_ID}`]).toBe(true);
  expect(cookieWrites.some((value) => value.includes("domain=.acrox.com.ar"))).toBe(true);

  const docs = readFileSync(resolve(process.cwd(), "docs/analytics-gbp.md"), "utf8");
  expect(docs).toContain("https://acrox.com.ar/?utm_source=google&utm_medium=organic&utm_campaign=gbp");
});
