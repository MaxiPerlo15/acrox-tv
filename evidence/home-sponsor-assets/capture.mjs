import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3030";
const outputDirectory = fileURLToPath(new URL(".", import.meta.url));
const legacyFeed = {
  liveItem: null,
  latestEpisode: null,
  topEpisode: null,
  episodes: [],
  instagram: [],
  youtubeError: false,
  instagramError: false
};
const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "mobile", width: 390, height: 844 }
];

const browser = await chromium.launch({ headless: true });
const captures = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    await context.route("**/api/acroxtv-feed", (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(legacyFeed)
    }));
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const ribbon = page.getByRole("region", { name: "Nos acompañan" });
    await ribbon.scrollIntoViewIfNeeded();
    await ribbon.screenshot({ path: `${outputDirectory}/home-ribbon-${viewport.name}.png`, animations: "disabled" });
    captures.push({ route: "/#acroxtv", viewport, file: `home-ribbon-${viewport.name}.png` });
    await context.close();
  }

  await writeFile(join(outputDirectory, "capture-metadata.json"), `${JSON.stringify({
    baseUrl,
    source: "Home legacy feed is locally fulfilled; no direct-program feeds or external media are requested.",
    captures
  }, null, 2)}\n`);
} finally {
  await browser.close();
}
