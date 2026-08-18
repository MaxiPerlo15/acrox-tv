import { expect, test } from "@playwright/test";

const programSlug = "alta-data-te-tire";
const routePath = `/${programSlug}`;

const episodes = [
  {
    videoId: "alta-latest",
    title: "Alta episodio más reciente",
    watchUrl: "https://youtube.com/watch?v=alta-latest",
    thumbnailUrl: "https://i.ytimg.com/vi/alta-latest/hqdefault.jpg",
    publishedAt: "2026-08-18T00:00:00.000Z",
    durationSeconds: 120,
    viewCount: 12
  },
  {
    videoId: "alta-popular",
    title: "Alta episodio más visto",
    watchUrl: "https://youtube.com/watch?v=alta-popular",
    thumbnailUrl: "https://i.ytimg.com/vi/alta-popular/hqdefault.jpg",
    publishedAt: "2026-08-17T00:00:00.000Z",
    durationSeconds: 120,
    viewCount: 100
  },
  {
    videoId: "alta-archive",
    title: "Alta episodio de archivo",
    watchUrl: "https://youtube.com/watch?v=alta-archive",
    thumbnailUrl: "https://i.ytimg.com/vi/alta-archive/hqdefault.jpg",
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
    await latest.click();
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toHaveAttribute(
      "src",
      /youtube-nocookie\.com\/embed\/alta-latest/
    );

    await page.keyboard.press("Escape");
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toHaveCount(0);
    await expect(latest).toBeVisible();
  });

  test("closes the latest preview after outside interaction", async ({ page }) => {
    await page.getByRole("region", { name: "Último episodio" }).getByRole("button", { name: /Reproducir Alta episodio más reciente/i }).click();
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toBeVisible();

    await page.getByRole("heading", { name: "Alta Data ¡Te Tire!" }).click();
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toHaveCount(0);
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

  test("does not overflow on mobile @mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    expect(await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
