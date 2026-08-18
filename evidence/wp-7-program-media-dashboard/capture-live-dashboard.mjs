import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3027";
const outputDirectory = fileURLToPath(new URL(".", import.meta.url));
const routes = ["alta-data-te-tire", "mas-que-nutricion"];
const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "mobile", width: 375, height: 812 }
];

const captures = [];
const browser = await chromium.launch({ headless: true });

try {
  await mkdir(outputDirectory, { recursive: true });

  for (const route of routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        colorScheme: "light",
        reducedMotion: "reduce"
      });
      const page = await context.newPage();

      await page.goto(`${baseUrl}/${route}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      const dashboard = page.getByRole("region", { name: "Dashboard de medios" });
      const lead = dashboard.getByRole("region", { name: "Último episodio" });
      const image = lead.locator("img");
      await image.waitFor({ state: "visible" });
      await image.evaluate((element) => {
        if (!(element instanceof HTMLImageElement) || element.naturalWidth < 100) {
          throw new Error("The scoped lead thumbnail did not load at a faithful media resolution.");
        }
      });
      await dashboard.scrollIntoViewIfNeeded();

      const thumbnailFile = `${route}-${viewport.name}-thumbnail.png`;
      await dashboard.screenshot({ path: `${outputDirectory}/${thumbnailFile}`, animations: "disabled" });

      const feedResponse = await page.request.get(`${baseUrl}/api/acroxtv-feed/${route}`);
      const feed = await feedResponse.json();
      const thumbnail = await image.evaluate((element) => ({
        src: element.currentSrc,
        naturalWidth: element.naturalWidth,
        naturalHeight: element.naturalHeight
      }));
      const panels = dashboard.getByRole("region", { name: /Panel (Más visto|Episodios|Instagram)/ });
      const boxes = await Promise.all([lead.boundingBox(), ...Array.from({ length: 3 }, (_, index) => panels.nth(index).boundingBox())]);

      captures.push({
        route,
        viewport,
        state: "thumbnail",
        file: thumbnailFile,
        feed: {
          status: feedResponse.status(),
          episodeState: feed.episodes?.state,
          itemCount: feed.episodes?.items?.length ?? 0,
          titles: (feed.episodes?.items ?? []).slice(0, 3).map((item) => item.title),
          videoIds: (feed.episodes?.items ?? []).slice(0, 3).map((item) => item.videoId)
        },
        thumbnail,
        layout: { lead: boxes[0], panels: boxes.slice(1) }
      });

      await lead.getByRole("button", { name: /Reproducir / }).click();
      const player = lead.locator("iframe");
      await player.waitFor({ state: "visible" });
      const playerFile = `${route}-${viewport.name}-player.png`;
      await dashboard.screenshot({ path: `${outputDirectory}/${playerFile}`, animations: "disabled" });
      captures.push({
        route,
        viewport,
        state: "player",
        file: playerFile,
        player: {
          title: await player.getAttribute("title"),
          src: await player.getAttribute("src"),
          box: await player.boundingBox()
        }
      });

      await context.close();
    }
  }

  await writeFile(
    `${outputDirectory}/capture-metadata.json`,
    `${JSON.stringify({ baseUrl, source: "live scoped program-feed API", captures }, null, 2)}\n`
  );
} finally {
  await browser.close();
}
