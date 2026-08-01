import { expect, test } from "@playwright/test";
import { PROGRAMS } from "@/domain/programs";

test.describe("Acrox TV direct program routes", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/acroxtv-feed", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          liveItem: null,
          latestEpisode: null,
          topEpisode: null,
          episodes: [],
          instagram: [],
          youtubeError: true,
          instagramError: true
        })
      });
    });
  });

  test("serves registered programs as generated static pages with route metadata", async ({ page }) => {
    for (const program of PROGRAMS) {
      const response = await page.goto(`/${program.slug}`);

      expect(response?.headers()["x-nextjs-cache"]).toBe("HIT");
      await expect(page).toHaveTitle(`${program.name} | Acrox`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        `Novedades de ${program.name} en Acrox TV.`
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${program.slug}$`));
    }
  });

  test("renders every registered program inside the Acrox shell", async ({ page }) => {
    for (const program of PROGRAMS) {
      await page.goto(`/${program.slug}`);

      await expect(page).toHaveTitle(new RegExp(program.name));
      await expect(page.getByRole("heading", { level: 1, name: program.name })).toBeVisible();
      await expect(page.getByAltText("Logo Acrox").first()).toBeVisible();
      await expect(page.getByRole("contentinfo")).toContainText("Acrox ©");
      await expect(page.getByText("La programación estará disponible próximamente.")).toBeVisible();
    }
  });

  test("keeps the program main content media-safe", async ({ page }) => {
    await page.goto(`/${PROGRAMS[0].slug}`);

    const main = page.getByRole("main");
    await expect(main.getByText("La programación estará disponible próximamente.")).toBeVisible();
    await expect(main.locator("img, video, audio, iframe, picture, source, [aria-label*='EN VIVO' i]")).toHaveCount(0);
    await expect(main.getByRole("link")).toHaveCount(0);
    await expect(main).not.toContainText("EN VIVO");
    await expect(main).not.toContainText("Últimos episodios");
    await expect(main).not.toContainText("Instagram");
    await expect(main).not.toContainText("YouTube");
    await expect(main).not.toContainText("Directorio");
  });

  test("leaves explicit static and API routes under their current owners", async ({ page }) => {
    const privacy = await page.goto("/privacy");
    expect(privacy?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeVisible();

    const api = await page.goto("/api/acroxtv-feed/not-a-program", { waitUntil: "commit" });
    expect(api?.status()).toBe(404);
  });

  test("returns the established not-found page for unknown and reserved paths", async ({ page }) => {
    for (const path of ["/not-a-program", "/api"]) {
      const response = await page.goto(path);

      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1, name: "Esta página no está disponible" })).toBeVisible();
    }
  });
});
