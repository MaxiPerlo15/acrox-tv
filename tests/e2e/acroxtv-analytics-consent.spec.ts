import { expect, test } from "@playwright/test";

type MockGaWindow = Window & {
  __gaCalls?: unknown[][];
  __gaConsumed?: unknown[][];
  __gaQueueTypes?: string[];
};

const gaScript = `
  window.__gaQueueTypes = (window.dataLayer || []).map(command => Object.prototype.toString.call(command));
  window.__gaConsumed = (window.dataLayer || []).map(command => Array.from(command));
  window.__gaCalls = [];
  window.gtag = function () { window.__gaCalls.push(Array.from(arguments)); };
`;

function collectHydrationErrors(page: import("@playwright/test").Page, errors: string[]) {
  page.on("pageerror", (error) => {
    const message = error.message.toLowerCase();
    if (message.includes("hydration") || message.includes("ssr mismatch") || message.includes("react #418")) errors.push(error.message);
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    const lower = text.toLowerCase();
    if (lower.includes("hydration") || lower.includes("ssr mismatch") || lower.includes("react #418")) errors.push(text);
  });
}

test.describe("initial consent presentation", () => {
  test("production HTML contains the consent panel outside serialized scripts", async ({ request }) => {
    const response = await request.get("/");
    expect(response.ok()).toBe(true);
    const html = await response.text();
    const documentMarkup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    expect(documentMarkup).toMatch(/<section\b(?=[^>]*role=["']dialog["'])[^>]*>[\s\S]*?(?:Aceptar analítica|Rechazar)[\s\S]*?<\/section>/i);
  });

  test("fresh prompt is visible before Next.js scripts load without requesting analytics", async ({ page }) => {
    const analyticsRequests: string[] = [];
    await page.route((url) => url.pathname.startsWith("/_next/static/") && url.pathname.endsWith(".js"), (route) => route.abort());
    await page.route(/googletagmanager\.com\/gtag\/js|google-analytics\.com/, (route) => {
      analyticsRequests.push(route.request().url());
      return route.abort();
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Aceptar analítica" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Aceptar analítica" })).toBeDisabled();
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    expect(analyticsRequests).toEqual([]);
  });

  test("stored choices stay hidden and invalid or inaccessible storage stays visible before hydration", async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/_next/static/") && url.pathname.endsWith(".js"), (route) => route.abort());
    await page.addInitScript(() => { if (!localStorage.getItem("__consent-test-seeded")) { localStorage.setItem("acrox-ga-consent", "accepted"); localStorage.setItem("__consent-test-seeded", "1"); } });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.evaluate(() => localStorage.setItem("acrox-ga-consent", "rejected"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.evaluate(() => localStorage.setItem("acrox-ga-consent", "invalid"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.addInitScript(() => Object.defineProperty(Storage.prototype, "getItem", { configurable: true, value() { throw new Error("storage unavailable"); } }));
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test("restored accepted consent requests no analytics while Next.js is blocked", async ({ page }) => {
  const analyticsRequests: string[] = [];
  await page.route((url) => url.pathname.startsWith("/_next/static/") && url.pathname.endsWith(".js"), (route) => route.abort());
  await page.route(/googletagmanager\.com\/gtag\/js|google-analytics\.com/, (route) => {
    analyticsRequests.push(route.request().url());
    return route.abort();
  });
  await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "accepted"));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("acrox-ga-consent"))).toBe("accepted");
  expect(analyticsRequests).toEqual([]);
});

test("preview shows before Next.js without changing accepted or rejected consent or requesting analytics", async ({ page }) => {
  const analyticsRequests: string[] = [];
  await page.context().route((url) => url.pathname.startsWith("/_next/static/") && url.pathname.endsWith(".js"), (route) => route.abort());
  await page.context().route(/googletagmanager\.com\/gtag\/js|google-analytics\.com/, (route) => {
    analyticsRequests.push(route.request().url());
    return route.abort();
  });
  for (const choice of ["accepted", "rejected"]) {
    const previewPage = await page.context().newPage();
    await previewPage.addInitScript((value) => localStorage.setItem("acrox-ga-consent", value), choice);
    await previewPage.goto("/privacy?analytics-preferences=show&utm_source=test#fragment", { waitUntil: "domcontentloaded" });
    await expect(previewPage.getByRole("dialog")).toBeVisible();
    expect(await previewPage.evaluate(() => localStorage.getItem("acrox-ga-consent"))).toBe(choice);
    await previewPage.close();
  }
  expect(analyticsRequests).toEqual([]);
});

test("hydration preserves fresh and stored consent without hydration warnings", async ({ page }) => {
  const hydrationErrors: string[] = [];
  collectHydrationErrors(page, hydrationErrors);
  await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Rechazar" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.reload();
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(hydrationErrors).toEqual([]);
});

test("preview cleans only its parameter, preserves history and tracks one landing view", async ({ page }) => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/javascript", body: gaScript });
  });
  await page.addInitScript(() => {
    localStorage.setItem("acrox-ga-consent", "accepted");
    history.replaceState({ marker: "preserved" }, "", "/?analytics-preferences=show&utm_source=test#fragment");
  });
  const hydrationErrors: string[] = [];
  collectHydrationErrors(page, hydrationErrors);
  await page.goto("/?analytics-preferences=show&utm_source=test#fragment");
  await expect(page.getByRole("dialog")).toBeVisible();
  const pageviewCount = () => page.evaluate(() => [...((window as MockGaWindow).__gaConsumed ?? []), ...((window as MockGaWindow).__gaCalls ?? [])].filter((command) => command[0] === "event" && command[1] === "page_view").length);
  await expect.poll(pageviewCount).toBe(1);
  expect(await page.evaluate(() => ({ url: location.href, state: history.state }))).toMatchObject({
    url: `${new URL(page.url()).origin}/?utm_source=test#fragment`, state: { marker: "preserved" },
  });
  await expect(page.getByRole("button", { name: "Aceptar analítica" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('footer a[href="/privacy"]').click();
  await expect(page).toHaveURL(/\/privacy/);
  const preferencesButton = page.getByRole("button", { name: "Preferencias de analítica" });
  await preferencesButton.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(preferencesButton).toBeFocused();
  expect(hydrationErrors).toEqual([]);
});

test("SPA preview opens after cleaning only its query parameter without changing consent", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
  await page.goto("/privacy");
  await page.getByRole("button", { name: "Preferencias de analítica" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  const origin = new URL(page.url()).origin;
  await page.evaluate(() => {
    history.pushState({ marker: "spa-preview" }, "", "/privacy?analytics-preferences=show&utm_source=test#fragment");
  });
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(`${origin}/privacy?utm_source=test#fragment`);
  expect(await page.evaluate(() => ({ choice: localStorage.getItem("acrox-ga-consent"), state: history.state }))).toMatchObject({ choice: "rejected", state: { marker: "spa-preview" } });
});

test("consent survives rejection and reload without requesting Google", async ({ page }) => {
  const requests: string[] = [];
  await page.route(/google-analytics\.com|googletagmanager\.com/, async (route) => {
    requests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "application/javascript", body: gaScript });
  });
  await page.goto("/?utm_source=google&utm_medium=organic&utm_campaign=gbp");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Rechazar" }).click();
  await page.reload();
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(requests).toEqual([]);
  await page.goto("/privacy");
  await page.getByRole("button", { name: "Preferencias de analítica" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("accept loads a standard gtag queue, retains UTMs, and tracks one SPA view", async ({ page }) => {
  const scriptRequests: string[] = [];
  await page.route(/google-analytics\.com|googletagmanager\.com/, async (route) => {
    if (route.request().resourceType() === "script") scriptRequests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "application/javascript", body: gaScript });
  });
  await page.goto("/?utm_source=google&utm_medium=organic&utm_campaign=gbp");
  const landingUrl = page.url();
  await page.getByRole("button", { name: "Aceptar analítica" }).click();
  await expect.poll(() => page.evaluate(() => Boolean((window as MockGaWindow).__gaCalls))).toBe(true);
  const queued = await page.evaluate(() => (window as MockGaWindow).__gaConsumed ?? []);
  const queueTypes = await page.evaluate(() => (window as MockGaWindow).__gaQueueTypes ?? []);
  expect(queueTypes).toContain("[object Arguments]");
  expect(queued.some((command) => command[0] === "event" && command[1] === "page_view" && (command[2] as { page_location: string }).page_location.includes("utm_campaign=gbp"))).toBe(true);
  const before = await page.evaluate(() => ((window as MockGaWindow).__gaCalls ?? []).filter((command) => command[0] === "event" && command[1] === "page_view").length);
  const privacyLink = page.locator('footer a[href="/privacy"]');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await privacyLink.evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page).toHaveURL(/\/privacy/);
  const pageviewCount = () => page.evaluate(() => ((window as MockGaWindow).__gaCalls ?? []).filter((command) => command[0] === "event" && command[1] === "page_view").length);
  await expect.poll(pageviewCount).toBe(before + 1);
  await page.goBack();
  await expect(page).toHaveURL(landingUrl);
  await expect.poll(pageviewCount).toBe(before + 2);
  await page.goForward();
  await expect(page).toHaveURL(/\/privacy/);
  await expect.poll(pageviewCount).toBe(before + 3);
  expect(scriptRequests).toHaveLength(1);
});

test("restored accepted choice loads GA and emits one landing pageview", async ({ page }) => {
  const scripts: string[] = [];
  await page.route(/google-analytics\.com|googletagmanager\.com/, async (route) => {
    if (route.request().resourceType() === "script") scripts.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "application/javascript", body: gaScript });
  });
  await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "accepted"));
  await page.goto("/?utm_source=google&utm_medium=organic&utm_campaign=gbp");
  const pageviews = () => page.evaluate(() => [...((window as MockGaWindow).__gaConsumed ?? []), ...((window as MockGaWindow).__gaCalls ?? [])].filter((command) => command[0] === "event" && command[1] === "page_view"));
  await expect.poll(async () => (await pageviews()).length).toBe(1);
  const calls = await pageviews();
  expect(calls.some((command) => (command[2] as { page_location: string }).page_location.includes("utm_campaign=gbp"))).toBe(true);
  expect(scripts).toHaveLength(1);
});

test("revoking before script completion flushes no stale grant or events; reaccept reuses script", async ({ page }) => {
  let releaseScript!: () => void;
  const scriptPaused = new Promise<void>((resolve) => { releaseScript = resolve; });
  const requests: string[] = [];
  await page.route(/google-analytics\.com|googletagmanager\.com/, async (route) => {
    requests.push(route.request().url());
    await scriptPaused;
    await route.fulfill({ status: 200, contentType: "application/javascript", body: gaScript });
  });
  await page.goto("/privacy");
  await page.getByRole("button", { name: "Aceptar analítica" }).click();
  await expect.poll(() => requests.length).toBe(1);
  await page.getByRole("button", { name: "Preferencias de analítica" }).click();
  await page.getByRole("button", { name: "Retirar consentimiento" }).click();
  releaseScript();
  await expect.poll(() => page.evaluate(() => Array.isArray((window as MockGaWindow).__gaConsumed))).toBe(true);
  const consumed = await page.evaluate(() => (window as MockGaWindow).__gaConsumed ?? []);
  expect(consumed.filter((command) => ["config", "event", "consent"].includes(String(command[0])))).toEqual([]);
  await page.getByRole("button", { name: "Preferencias de analítica" }).click();
  await page.getByRole("button", { name: "Aceptar analítica" }).click();
  await expect.poll(() => page.evaluate(() => (window as MockGaWindow).__gaCalls?.some((command) => command[0] === "config"))).toBe(true);
  expect(requests).toHaveLength(1);
});

test("withdrawal clears accessible GA cookies", async ({ page }) => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort());
  await page.goto("/privacy");
  await page.evaluate(() => { document.cookie = "_ga=host; path=/"; });
  await page.getByRole("button", { name: "Aceptar analítica" }).click();
  await page.getByRole("button", { name: "Preferencias de analítica" }).click();
  await page.getByRole("button", { name: "Retirar consentimiento" }).click();
  expect(await page.evaluate(() => document.cookie)).not.toMatch(/_ga/);
});
