export const GA_ID = "G-WVV8CMW495";
export const GA_CONSENT_KEY = "acrox-ga-consent";
type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag; [key: string]: unknown };
export type AnalyticsChoice = "accepted" | "rejected";

let explicitlyGranted = false;
let scriptRequested = false;

export function readAnalyticsChoice(): AnalyticsChoice | null {
  try {
    const value = window.localStorage.getItem(GA_CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch { return null; }
}

export function saveAnalyticsChoice(choice: AnalyticsChoice): void {
  try { window.localStorage.setItem(GA_CONSENT_KEY, choice); } catch { /* Storage may be blocked. */ }
}

function removeAccessibleGaCookies(): void {
  const host = window.location.hostname;
  const domains = ["", `; domain=${host}`, "; domain=acrox.com.ar", "; domain=.acrox.com.ar"];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.trim().split("=")[0];
    if (!name.startsWith("_ga")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}; SameSite=Lax`;
    }
  }
}

function purgeQueuedGaCommands(target: AnalyticsWindow): void {
  if (!Array.isArray(target.dataLayer)) return;
  const retained = target.dataLayer.filter((entry) => {
    if (!entry || typeof entry !== "object" || !("0" in entry)) return true;
    const command = entry as { 0?: unknown; 1?: unknown; 2?: { analytics_storage?: unknown } };
    if (command[0] === "config" && command[1] === GA_ID) return false;
    if (command[0] === "event" && (command[1] === "page_view" || command[1] === "click_enviar_whatsapp")) return false;
    return !(command[0] === "consent" && command[1] === "update" && command[2]?.analytics_storage === "granted");
  });
  target.dataLayer.splice(0, target.dataLayer.length, ...retained);
}

export function disableAnalytics(): void {
  const target = window as unknown as AnalyticsWindow;
  // GA checks this flag before collecting, including when its script finishes loading later.
  target[`ga-disable-${GA_ID}`] = true;
  explicitlyGranted = false;
  purgeQueuedGaCommands(target);
  removeAccessibleGaCookies();
}

export function enableAnalytics(): void {
  const target = window as unknown as AnalyticsWindow;
  explicitlyGranted = true;
  target[`ga-disable-${GA_ID}`] = false;
  if (!target.gtag) {
    const dataLayer = target.dataLayer ?? [];
    target.dataLayer = dataLayer;
    // Google's standard gtag.js bootstrap queues the arguments object, not an array copy.
    // The canonical gtag.js bootstrap queues its arguments object.
    // eslint-disable-next-line prefer-rest-params
    target.gtag = function () { dataLayer.push(arguments); } as Gtag;
    target.gtag("js", new Date());
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.dataset.acroxGa = "true";
    if (!scriptRequested && !document.querySelector('script[data-acrox-ga="true"]')) {
      scriptRequested = true;
      document.head.appendChild(script);
    }
  }
  target.gtag("consent", "update", { analytics_storage: "granted" });
  target.gtag("config", GA_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
}

export function trackPageView(url: string): void {
  const target = window as unknown as AnalyticsWindow;
  if (explicitlyGranted && !target[`ga-disable-${GA_ID}`] && typeof target.gtag === "function") {
    target.gtag("event", "page_view", { page_location: url });
  }
}

export function trackWhatsAppClick(): void {
  const target = window as unknown as AnalyticsWindow;
  if (explicitlyGranted && !target[`ga-disable-${GA_ID}`] && typeof target.gtag === "function") {
    target.gtag("event", "click_enviar_whatsapp", { channel: "contact_form", platform: "whatsapp" });
  }
}
