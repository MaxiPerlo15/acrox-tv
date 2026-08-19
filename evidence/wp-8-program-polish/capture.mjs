import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3029";
const outputDirectory = fileURLToPath(new URL(".", import.meta.url));
const programSlug = "alta-data-te-tire";
const programFeeds = {
  "alta-data-te-tire": {
    programSlug: "alta-data-te-tire",
    episodes: {
      state: "available",
      asOf: "2026-08-18T00:00:00.000Z",
      items: [{
        videoId: "alta-latest",
        title: "Alta episodio más reciente",
        watchUrl: "https://youtube.com/watch?v=alta-latest",
        thumbnailUrl: "/e2e-thumbnail.svg",
        publishedAt: "2026-08-18T00:00:00.000Z",
        durationSeconds: 120,
        viewCount: 12
      }]
    },
    instagram: { state: "unavailable" },
    live: { state: "unavailable" }
  },
  "mas-que-nutricion": {
    programSlug: "mas-que-nutricion",
    episodes: { state: "unavailable" },
    instagram: { state: "unavailable" },
    live: { state: "unavailable" }
  }
};
const legacyFeed = {
  liveItem: null,
  latestEpisode: null,
  topEpisode: null,
  episodes: [],
  instagram: [],
  youtubeError: false,
  instagramError: true
};
const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "mobile", width: 375, height: 812 }
];

const browser = await chromium.launch({ headless: true });
const captures = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
    await context.route("https://**", (route) => route.fulfill({ status: 204, body: "" }));
    await context.route("**/api/acroxtv-feed", (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(legacyFeed)
    }));
    await Promise.all(Object.entries(programFeeds).map(async ([slug, feed]) => {
      await context.route(`**/api/acroxtv-feed/${slug}`, (route) => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(feed)
      }));
    }));
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const homeSection = page.locator("#acroxtv");
    await homeSection.screenshot({ path: `${outputDirectory}/home-${viewport.name}.png`, animations: "disabled" });
    captures.push({ route: "/", viewport, file: `home-${viewport.name}.png` });

    await page.goto(`${baseUrl}/${programSlug}`, { waitUntil: "networkidle" });
    const programMain = page.getByRole("main");
    await programMain.screenshot({ path: `${outputDirectory}/program-${viewport.name}.png`, animations: "disabled" });
    captures.push({ route: `/${programSlug}`, viewport, file: `program-${viewport.name}.png` });

    await context.close();
  }

  await writeFile(`${outputDirectory}/capture-metadata.json`, `${JSON.stringify({
    baseUrl,
    source: "Capture-only legacy and both canonical scoped program-feed fixtures; Instagram remains unavailable and all external media is locally fulfilled.",
    captures
  }, null, 2)}\n`);
} finally {
  await browser.close();
}
