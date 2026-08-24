import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3027";
const outputDirectory = fileURLToPath(new URL(".", import.meta.url));
const routes = ["alta-data-te-tire", "mas-que-nutricion"];
const youtubeNoCookieEmbedOrigin = "https://www.youtube-nocookie.com";
const playerCaptureOnly = process.env.CAPTURE_PLAYER_FIXTURE === "1";
const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "mobile", width: 375, height: 812 }
];

// Capture evidence only: headless Chromium paints live YouTube iframes black.
// This intercept responds only to the embed navigation after the real page has
// activated its production iframe; it never changes application code or its URL.
const captureOnlyPlayerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { box-sizing: border-box; }
      body { align-items: center; background: #0f0f0f; color: #f1f1f1; display: flex; font: 600 14px/1.35 Arial, sans-serif; height: 100vh; justify-content: center; margin: 0; }
      .player { align-items: center; background: linear-gradient(135deg, #222 0%, #080808 70%); display: flex; height: 100%; justify-content: center; overflow: hidden; position: relative; width: 100%; }
      .badge { align-items: center; background: #ff0000; border-radius: 8px; display: flex; height: 62px; justify-content: center; width: 88px; }
      .badge::after { border-bottom: 14px solid transparent; border-left: 22px solid white; border-top: 14px solid transparent; content: ""; margin-left: 5px; }
      .label { background: rgba(0, 0, 0, .7); bottom: 16px; left: 16px; letter-spacing: .05em; padding: 7px 10px; position: absolute; text-transform: uppercase; }
      .notice { bottom: 16px; color: #bdbdbd; font-size: 11px; position: absolute; right: 16px; }
    </style>
  </head>
  <body>
    <main class="player" aria-label="Capture-only YouTube player fixture">
      <div class="badge" aria-hidden="true"></div>
      <div class="label">YouTube</div>
      <div class="notice">Capture-only player fixture</div>
    </main>
  </body>
</html>`;

// These public, previously live-captured leading items make the player-only
// capture reproducible without a credential. They are never served by the app.
const playerCaptureFeeds = {
  "alta-data-te-tire": {
    programSlug: "alta-data-te-tire",
    episodes: {
      state: "available",
      asOf: "2026-08-18T17:00:00.000Z",
      items: [{
        videoId: "H5oLwWoIeaI",
        title: "ALTA DATA ¡te tiré!",
        watchUrl: "https://www.youtube.com/watch?v=H5oLwWoIeaI",
        thumbnailUrl: "/e2e-thumbnail.svg",
        publishedAt: "2026-08-18T00:00:00.000Z",
        durationSeconds: 120,
        viewCount: 1
      }]
    },
    instagram: { state: "unavailable" },
    live: { state: "unavailable" }
  },
  "mas-que-nutricion": {
    programSlug: "mas-que-nutricion",
    episodes: {
      state: "available",
      asOf: "2026-08-18T17:00:00.000Z",
      items: [{
        videoId: "n3BBkIrSUFc",
        title: "Más que nutrición - Cocinando con Mirko",
        watchUrl: "https://www.youtube.com/watch?v=n3BBkIrSUFc",
        thumbnailUrl: "/e2e-thumbnail.svg",
        publishedAt: "2026-08-18T00:00:00.000Z",
        durationSeconds: 120,
        viewCount: 1
      }]
    },
    instagram: { state: "unavailable" },
    live: { state: "unavailable" }
  }
};

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
      await context.route(`${youtubeNoCookieEmbedOrigin}/embed/**`, async (request) => {
        await request.fulfill({ contentType: "text/html; charset=utf-8", body: captureOnlyPlayerHtml });
      });
      if (playerCaptureOnly) {
        await context.route(`**/api/acroxtv-feed/${route}`, async (request) => {
          await request.fulfill({ contentType: "application/json", body: JSON.stringify(playerCaptureFeeds[route]) });
        });
      }
      const page = await context.newPage();

      await page.goto(`${baseUrl}/${route}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      const dashboard = page.getByRole("region", { name: "Dashboard de medios" });
      const lead = dashboard.getByRole("region", { name: "Último episodio" });
      const image = lead.locator("img");
      await image.waitFor({ state: "visible" });
      await image.evaluate((element, requiresFaithfulThumbnail) => {
        if (requiresFaithfulThumbnail && (!(element instanceof HTMLImageElement) || element.naturalWidth < 100)) {
          throw new Error("The scoped lead thumbnail did not load at a faithful media resolution.");
        }
      }, !playerCaptureOnly);
      await dashboard.scrollIntoViewIfNeeded();

      const feedResponse = playerCaptureOnly ? null : await page.request.get(`${baseUrl}/api/acroxtv-feed/${route}`);
      const feed = playerCaptureOnly ? playerCaptureFeeds[route] : await feedResponse.json();

      if (!playerCaptureOnly) {
        const thumbnailFile = `${route}-${viewport.name}-thumbnail.png`;
        await dashboard.screenshot({ path: `${outputDirectory}/${thumbnailFile}`, animations: "disabled" });
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
      }

      await lead.getByRole("button", { name: /Reproducir / }).click();
      const player = lead.locator("iframe");
      await player.waitFor({ state: "visible" });
      const productionPlayerUrl = new URL(await player.getAttribute("src") ?? "");
      const expectedVideoId = feed.episodes?.items?.[0]?.videoId;
      if (
        productionPlayerUrl.origin !== youtubeNoCookieEmbedOrigin ||
        productionPlayerUrl.pathname !== `/embed/${expectedVideoId}`
      ) {
        throw new Error("The activated production iframe did not use the scoped youtube-nocookie video ID.");
      }
      await lead.frameLocator("iframe").getByText("Capture-only player fixture").waitFor({ state: "visible" });
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
          box: await player.boundingBox(),
          productionUrlAssertion: {
            origin: productionPlayerUrl.origin,
            scopedVideoId: expectedVideoId,
            passed: true
          },
          renderedBy: "capture-only deterministic YouTube iframe fixture"
        }
      });

      await context.close();
    }
  }

  const priorMetadata = playerCaptureOnly
    ? JSON.parse(await readFile(`${outputDirectory}/capture-metadata.json`, "utf8"))
    : null;
  const retainedLiveThumbnailCaptures = priorMetadata?.captures?.filter((capture) => capture.state === "thumbnail") ?? [];

  await writeFile(
    `${outputDirectory}/capture-metadata.json`,
    `${JSON.stringify({
      baseUrl,
      source: "live scoped program-feed API for thumbnail captures; deterministic fixture for player captures only",
      playerCaptureOnly,
      playerCaptureFixture: {
        purpose: "Headless Chromium paints the live YouTube iframe black; this is a capture-only visual substitute, not playback evidence.",
        interception: `${youtubeNoCookieEmbedOrigin}/embed/**`,
        html: captureOnlyPlayerHtml
      },
      captures: playerCaptureOnly ? [...retainedLiveThumbnailCaptures, ...captures] : captures
    }, null, 2)}\n`
  );
} finally {
  await browser.close();
}
