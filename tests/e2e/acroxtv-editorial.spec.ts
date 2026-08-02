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

test.describe("Acrox TV editorial directory", () => {
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

  test("renders equally prominent canonical program covers and keeps the approved-only ribbon off program pages", async ({ page }) => {
    await page.goto("/");

    const directory = page.getByRole("region", { name: "Programas de Acrox TV" });
    const covers = directory.locator("[data-program-cover]");
    await expect(covers).toHaveCount(2);
    await expect(covers.nth(0)).toHaveAttribute("href", "/alta-data");
    await expect(covers.nth(1)).toHaveAttribute("href", "/mas-que-nutricion");
    const [altaDataBox, nutritionBox] = await Promise.all([covers.nth(0).boundingBox(), covers.nth(1).boundingBox()]);
    expect(altaDataBox?.width).toBe(nutritionBox?.width);
    expect(altaDataBox?.height).toBe(nutritionBox?.height);
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toBeVisible();

    await page.goto("/alta-data");
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toHaveCount(0);
  });

  test("keeps editorial covers in the Tab sequence and activates them with the keyboard", async ({ page }) => {
    await page.goto("/");

    const firstCover = page.getByRole("link", { name: new RegExp(PROGRAMS[0].name) });
    const secondCover = page.getByRole("link", { name: new RegExp(PROGRAMS[1].name) });
    await firstCover.focus();
    await expect(firstCover).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(secondCover).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/${PROGRAMS[1].slug}$`));
  });

  test("keeps reverse Tab navigation between editorial covers", async ({ page }) => {
    await page.goto("/");

    const firstCover = page.getByRole("link", { name: new RegExp(PROGRAMS[0].name) });
    const secondCover = page.getByRole("link", { name: new RegExp(PROGRAMS[1].name) });
    await secondCover.focus();
    await expect(secondCover).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(firstCover).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/${PROGRAMS[0].slug}$`));
  });

  test("shows a visible program fallback when artwork fails to load", async ({ page }) => {
    await page.goto("/");

    const altaDataCover = page.getByRole("link", { name: /Alta Data ¡Te Tire!/ });
    const artwork = altaDataCover.locator("img");
    await expect(artwork).toBeVisible();
    await artwork.dispatchEvent("error");
    await expect(altaDataCover.getByText("ACROX TV", { exact: true })).toBeVisible();
  });

  test("shows a visible program fallback when artwork failed before hydration", async ({ page }) => {
    await page.addInitScript(() => {
      const originalComplete = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "complete");
      const originalNaturalWidth = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "naturalWidth");
      const isAltaDataArtwork = (image: HTMLImageElement) => image.src.includes("/alta-data-logo.png");

      Object.defineProperty(HTMLImageElement.prototype, "complete", {
        configurable: true,
        get() {
          return isAltaDataArtwork(this) ? true : (originalComplete?.get?.call(this) ?? false);
        }
      });
      Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
        configurable: true,
        get() {
          return isAltaDataArtwork(this) ? 0 : (originalNaturalWidth?.get?.call(this) ?? 0);
        }
      });
    });

    await page.goto("/");

    const altaDataCover = page.getByRole("link", { name: /Alta Data ¡Te Tire!/ });
    await expect(altaDataCover.locator("img")).toHaveCount(0);
    await expect(altaDataCover.getByText("ACROX TV", { exact: true })).toBeVisible();
  });

  test("keeps loaded artwork visible", async ({ page }) => {
    await page.goto("/");

    const altaDataCover = page.getByRole("link", { name: /Alta Data ¡Te Tire!/ });
    await expect(altaDataCover.locator("img")).toBeVisible();
    await expect(altaDataCover.getByText("ACROX TV", { exact: true })).toHaveCount(0);
  });

  test("reserves an empty sponsor ribbon without rendering sponsor items", async ({ page }) => {
    await page.goto("/");

    const ribbon = page.getByRole("region", { name: "Nos acompañan" });
    await expect(ribbon.getByText("Espacio reservado para aliados aprobados")).toBeVisible();
    await expect(ribbon.getByRole("listitem")).toHaveCount(0);
  });

  test("keeps legacy media, live, and feed content out of the home directory", async ({ page }) => {
    await page.goto("/");

    const directory = page.getByRole("region", { name: "Programas de Acrox TV" });
    await expect(directory).not.toContainText("EN VIVO");
    await expect(directory).not.toContainText("Últimos episodios");
    await expect(directory).not.toContainText("Instagram");
    await expect(directory).not.toContainText("YouTube");
    await expect(directory.locator("video, audio, iframe, picture, source")).toHaveCount(0);
  });

  test("keeps both covers available and readable on mobile @mobile", async ({ page }) => {
    await page.goto("/");

    const directory = page.getByRole("region", { name: "Programas de Acrox TV" });
    const altaDataCover = directory.getByRole("link", { name: /Alta Data ¡Te Tire!/ });
    const nutritionCover = directory.getByRole("link", { name: /Más que Nutrición/ });
    await expect(altaDataCover).toBeVisible();
    await expect(nutritionCover).toBeVisible();
    const [altaDataBox, nutritionBox] = await Promise.all([altaDataCover.boundingBox(), nutritionCover.boundingBox()]);
    expect(altaDataBox?.x).toBe(nutritionBox?.x);
    expect(nutritionBox?.y).toBeGreaterThan(altaDataBox?.y ?? 0);
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toBeVisible();
  });
});
