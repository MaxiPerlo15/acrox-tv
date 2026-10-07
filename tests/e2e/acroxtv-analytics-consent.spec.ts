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

for (const choice of ["accepted", "rejected"] as const) {
  test(`${choice} consent persists through reload and client navigation`, async ({ page }) => {
    const requests: string[] = [];
    await page.route(/google-analytics\.com|googletagmanager\.com/, async (route) => {
      requests.push(route.request().url());
      await route.fulfill({ status: 200, contentType: "application/javascript", body: gaScript });
    });
    await page.goto("/");
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(requests).toEqual([]);
    await page.getByRole("button", { name: choice === "accepted" ? "Aceptar analítica" : "Rechazar" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("acrox-ga-consent"))).toBe(choice);
    if (choice === "rejected") expect(requests).toEqual([]);

    await page.reload();
    await expect(page.getByRole("dialog")).toBeHidden();
    const privacyLink = page.locator('footer a[href="/privacy"]');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await privacyLink.evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByRole("button", { name: "Preferencias de analítica" })).toHaveCount(0);
    await page.goto("/proyectos");
    await expect(page.getByRole("button", { name: "Preferencias de analítica" })).toHaveCount(0);
  });
}

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
  await expect(page.getByRole("button", { name: "Preferencias de analítica" })).toHaveCount(0);
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
  await expect.poll(() => page.evaluate(() => ((window as MockGaWindow).__gaCalls ?? []).filter((command) => command[0] === "event" && command[1] === "page_view").length)).toBe(before + 1);
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
