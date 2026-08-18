import { expect, test } from "@playwright/test";

const programSlug = "alta-data-te-tire";
const routePath = `/${programSlug}`;
const fixtureThumbnailUrl = "/e2e-thumbnail.svg";

const episodes = [
  {
    videoId: "alta-latest",
    title: "Alta episodio más reciente",
    watchUrl: "https://youtube.com/watch?v=alta-latest",
    thumbnailUrl: fixtureThumbnailUrl,
    publishedAt: "2026-08-18T00:00:00.000Z",
    durationSeconds: 120,
    viewCount: 12
  },
  {
    videoId: "alta-popular",
    title: "Alta episodio más visto",
    watchUrl: "https://youtube.com/watch?v=alta-popular",
    thumbnailUrl: fixtureThumbnailUrl,
    publishedAt: "2026-08-17T00:00:00.000Z",
    durationSeconds: 120,
    viewCount: 100
  },
  {
    videoId: "alta-archive",
    title: "Alta episodio de archivo",
    watchUrl: "https://youtube.com/watch?v=alta-archive",
    thumbnailUrl: fixtureThumbnailUrl,
    publishedAt: "2026-08-16T00:00:00.000Z",
    durationSeconds: 120,
    viewCount: 50
  }
];

const programFeed = {
  programSlug,
  episodes: { state: "available", asOf: "2026-08-18T00:00:00.000Z", items: episodes },
  instagram: { state: "unavailable" },
  live: { state: "unavailable" }
};

const expectPreviewPlayerToFillContainer = async (
  preview: ReturnType<import("@playwright/test").Page["locator"]>,
  title: string
) => {
  const player = preview.locator(`iframe[title="${title}"]`);

  await expect(player).toBeVisible();
  const dimensions = await preview.evaluate((container) => {
    const { width, height } = container.getBoundingClientRect();
    const { width: playerWidth, height: playerHeight } = container.querySelector("iframe")!.getBoundingClientRect();
    return { width, height, playerWidth, playerHeight };
  });

  expect(dimensions.width).toBeGreaterThan(0);
  expect(dimensions.height).toBeGreaterThan(0);
  expect(dimensions.width / dimensions.height).toBeCloseTo(16 / 9, 2);
  expect(Math.abs(dimensions.playerWidth - dimensions.width)).toBeLessThanOrEqual(2.5);
  expect(Math.abs(dimensions.playerHeight - dimensions.height)).toBeLessThanOrEqual(2.5);
};

test.describe("program media previews", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/acroxtv-feed/${programSlug}`, async (route) => {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(programFeed) });
    });
    await page.goto(routePath);
  });

  test("opens the scoped latest preview and restores its thumbnail with Escape", async ({ page }) => {
    const latest = page.getByRole("region", { name: "Último episodio" }).getByRole("button", { name: /Reproducir Alta episodio más reciente/i });

    await expect(latest).toBeVisible();
    await expect(latest.locator("img")).toHaveAttribute("alt", "Alta episodio más reciente");
    await expect.poll(() => latest.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await latest.click();
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toHaveAttribute(
      "src",
      /youtube-nocookie\.com\/embed\/alta-latest/
    );

    await page.keyboard.press("Escape");
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toHaveCount(0);
    await expect(latest).toBeVisible();
    await expect(latest).toBeFocused();
  });

  test("closes the latest preview after outside interaction", async ({ page }) => {
    const latest = page.getByRole("region", { name: "Último episodio" }).getByRole("button", { name: /Reproducir Alta episodio más reciente/i });

    await latest.click();
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toBeVisible();

    await page.getByRole("heading", { name: "Alta Data ¡Te Tire!" }).click();
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toHaveCount(0);
    await expect(latest).toBeFocused();
  });

  test("fills the latest preview media container on desktop", async ({ page }) => {
    const latestPreview = page.locator(".program-latest-preview");

    await latestPreview.getByRole("button", { name: /Reproducir Alta episodio más reciente/i }).click();
    await expectPreviewPlayerToFillContainer(latestPreview, "Alta episodio más reciente");
  });

  test("uses keyboard-operable scoped carousels for Más visto and Episodios", async ({ page }) => {
    const mostViewed = page.getByRole("region", { name: "Carrusel Más visto" });
    const episodesCarousel = page.getByRole("region", { name: "Carrusel Episodios" });

    await expect(mostViewed.getByText("Alta episodio más visto")).toBeVisible();
    await expect(episodesCarousel.getByText("Alta episodio más reciente")).toBeVisible();

    await episodesCarousel.getByRole("button", { name: "Siguiente episodio" }).focus();
    await page.keyboard.press("Enter");
    await expect(episodesCarousel.getByText("Alta episodio más visto")).toBeVisible();
  });

  test("keeps the program feed isolated and preserves unavailable Instagram plus Footer", async ({ page }) => {
    const main = page.getByRole("main");

    await expect(main.getByText("Episodio de Más que Nutrición")).toHaveCount(0);
    await expect(main.getByText("Instagram aún no está disponible para este programa.")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("fills the latest preview media container without mobile overflow @mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const latestPreview = page.locator(".program-latest-preview");
    await latestPreview.getByRole("button", { name: /Reproducir Alta episodio más reciente/i }).click();
    await expectPreviewPlayerToFillContainer(latestPreview, "Alta episodio más reciente");
    expect(await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("presents a dominant lead preview above three aligned media panels on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });

    const dashboard = page.getByRole("region", { name: "Dashboard de medios" });
    const lead = dashboard.getByRole("region", { name: "Último episodio" });
    const panels = dashboard.getByRole("region", { name: /Panel (Más visto|Episodios|Instagram)/ });

    await expect(dashboard).toBeVisible();
    await expect(lead.getByRole("button", { name: /Reproducir Alta episodio más reciente/i })).toBeVisible();
    await expect(panels).toHaveCount(3);

    const [leadBox, firstPanel, secondPanel, thirdPanel] = await Promise.all([
      lead.boundingBox(),
      panels.nth(0).boundingBox(),
      panels.nth(1).boundingBox(),
      panels.nth(2).boundingBox()
    ]);

    expect(leadBox).not.toBeNull();
    expect(firstPanel).not.toBeNull();
    expect(secondPanel).not.toBeNull();
    expect(thirdPanel).not.toBeNull();

    expect(leadBox!.width / leadBox!.height).toBeCloseTo(16 / 9, 1);
    expect(leadBox!.width).toBeGreaterThan(firstPanel!.width * 2.4);
    expect(Math.abs(firstPanel!.y - secondPanel!.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(secondPanel!.y - thirdPanel!.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(firstPanel!.height - secondPanel!.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(secondPanel!.height - thirdPanel!.height)).toBeLessThanOrEqual(2);
    expect(firstPanel!.x).toBeLessThan(secondPanel!.x);
    expect(secondPanel!.x).toBeLessThan(thirdPanel!.x);
  });

  test("stacks the dashboard panels without overflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const dashboard = page.getByRole("region", { name: "Dashboard de medios" });
    const lead = dashboard.getByRole("region", { name: "Último episodio" });
    const panels = dashboard.getByRole("region", { name: /Panel (Más visto|Episodios|Instagram)/ });

    await expect(lead).toBeVisible();
    await expect(panels).toHaveCount(3);

    const [leadBox, firstPanel, secondPanel, thirdPanel] = await Promise.all([
      lead.boundingBox(),
      panels.nth(0).boundingBox(),
      panels.nth(1).boundingBox(),
      panels.nth(2).boundingBox()
    ]);

    expect(leadBox).not.toBeNull();
    expect(firstPanel).not.toBeNull();
    expect(secondPanel).not.toBeNull();
    expect(thirdPanel).not.toBeNull();

    expect(leadBox!.width / leadBox!.height).toBeCloseTo(16 / 9, 1);
    expect(Math.abs(firstPanel!.x - secondPanel!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(secondPanel!.x - thirdPanel!.x)).toBeLessThanOrEqual(2);
    expect(firstPanel!.y).toBeLessThan(secondPanel!.y);
    expect(secondPanel!.y).toBeLessThan(thirdPanel!.y);
    expect(await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
