import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3028";
const outputDirectory = fileURLToPath(new URL(".", import.meta.url));
const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "mobile", width: 375, height: 812 }
];

const feeds = {
  "alta-data-te-tire": {
    programSlug: "alta-data-te-tire",
    episodes: {
      state: "available",
      asOf: "2026-08-18T00:00:00.000Z",
      items: [
        ["H5oLwWoIeaI", "ALTA DATA ¡te tiré! — último episodio", 12],
        ["H5oLwWoIeaI", "ALTA DATA ¡te tiré! — más visto", 100],
        ["H5oLwWoIeaI", "ALTA DATA ¡te tiré! — archivo", 50]
      ].map(([videoId, title, viewCount], index) => ({
        videoId,
        title,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: `2026-08-${18 - index}T00:00:00.000Z`,
        durationSeconds: 120,
        viewCount
      }))
    },
    instagram: { state: "unavailable" },
    live: { state: "unavailable" }
  },
  "mas-que-nutricion": {
    programSlug: "mas-que-nutricion",
    episodes: {
      state: "available",
      asOf: "2026-08-18T00:00:00.000Z",
      items: [
        ["n3BBkIrSUFc", "Más que nutrición — último episodio", 12],
        ["n3BBkIrSUFc", "Más que nutrición — más visto", 100],
        ["n3BBkIrSUFc", "Más que nutrición — archivo", 50]
      ].map(([videoId, title, viewCount], index) => ({
        videoId,
        title,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: `2026-08-${18 - index}T00:00:00.000Z`,
        durationSeconds: 120,
        viewCount
      }))
    },
    instagram: { state: "unavailable" },
    live: { state: "unavailable" }
  }
};

const captures = [];
const browser = await chromium.launch({ headless: true });

try {
  await mkdir(outputDirectory, { recursive: true });
  for (const [programSlug, feed] of Object.entries(feeds)) {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
      await context.route(`**/api/acroxtv-feed/${programSlug}`, (route) => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(feed)
      }));
      const page = await context.newPage();
      await page.goto(`${baseUrl}/${programSlug}`, { waitUntil: "networkidle" });
      const media = page.getByRole("region", { name: "Medios del programa" });
      const cards = media.getByRole("region", { name: /^(Más visto|Episodios|Instagram)$/ });
      await cards.nth(1).getByRole("button", { name: /Reproducir/ }).first().waitFor({ state: "visible" });
      await page.waitForFunction(() => Array.from(document.querySelectorAll(".program-media-row img")).every((image) => image instanceof HTMLImageElement && image.naturalWidth > 100));
      const file = `${programSlug}-${viewport.name}.png`;
      await media.screenshot({ path: `${outputDirectory}/${file}`, animations: "disabled" });
      captures.push({
        programSlug,
        viewport,
        file,
        cards: await cards.count(),
        thumbnails: await media.locator("img").evaluateAll((images) => images.map((image) => ({ src: image.currentSrc, width: image.naturalWidth, height: image.naturalHeight })))
      });
      await context.close();
    }
  }
  await writeFile(`${outputDirectory}/capture-metadata.json`, `${JSON.stringify({ baseUrl, source: "Capture-only scoped program-feed fixtures with public per-program YouTube thumbnails; Instagram remains unavailable.", captures }, null, 2)}\n`);
} finally {
  await browser.close();
}
