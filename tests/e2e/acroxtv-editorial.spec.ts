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
      await expect(page.getByRole("heading", { level: 2, name: "Episodios" })).toBeVisible();
    }
  });

  test("keeps direct program media scoped while Navbar uses the legacy feed", async ({ page }) => {
    let unscopedRequestCount = 0;
    const scopedRequestPaths: string[] = [];

    await page.route("**/api/acroxtv-feed", async (route) => {
      unscopedRequestCount += 1;
      await route.fulfill({ status: 500 });
    });
    await page.route("**/api/acroxtv-feed/*", async (route) => {
      scopedRequestPaths.push(new URL(route.request().url()).pathname);
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: route.request().url().endsWith("/alta-data") ? "alta-data" : "mas-que-nutricion",
          episodes: { state: "unavailable" },
          instagram: { state: "unavailable" },
          live: { state: "unavailable" }
        })
      });
    });

    for (const program of PROGRAMS) {
      await page.goto(`/${program.slug}`);
      await expect(page.getByRole("heading", { level: 1, name: program.name })).toBeVisible();
    }

    expect(unscopedRequestCount).toBe(PROGRAMS.length);
    expect(scopedRequestPaths).toEqual(PROGRAMS.map((program) => `/api/acroxtv-feed/${program.slug}`));
  });

  test("presents an available program feed without sibling media", async ({ page }) => {
    await page.route("**/api/acroxtv-feed/alta-data", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: "alta-data",
          episodes: {
            state: "available",
            asOf: "2026-08-01T12:00:00.000Z",
            items: [
              {
                videoId: "alta-episode",
                title: "Episodio de Alta Data",
                watchUrl: "https://youtube.com/watch?v=alta-episode",
                thumbnailUrl: "https://example.com/alta.jpg",
                publishedAt: "2026-08-01T12:00:00.000Z",
                durationSeconds: 120,
                viewCount: 10
              }
            ]
          },
          instagram: { state: "unavailable" },
          live: { state: "unavailable" }
        })
      });
    });

    await page.goto("/alta-data");

    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: "Episodios" })).toBeVisible();
    await expect(main.getByRole("link", { name: "Episodio de Alta Data" })).toBeVisible();
    await expect(main).not.toContainText("Más que Nutrición");
    await expect(main.getByText("La programación estará disponible próximamente.")).toHaveCount(0);
  });

  test("labels stale media and keeps its zero-item state honest", async ({ page }) => {
    await page.route("**/api/acroxtv-feed/alta-data", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: "alta-data",
          episodes: {
            state: "stale",
            asOf: "2026-07-31T12:00:00.000Z",
            items: []
          },
          instagram: { state: "unavailable" },
          live: { state: "unavailable" }
        })
      });
    });

    await page.goto("/alta-data");

    const main = page.getByRole("main");
    await expect(main.getByText("Este contenido puede no estar actualizado.")).toBeVisible();
    await expect(main.getByText("No hay episodios atribuidos a este programa.")).toBeVisible();
  });

  test("keeps an available zero-item feed honest", async ({ page }) => {
    await page.route("**/api/acroxtv-feed/alta-data", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: "alta-data",
          episodes: {
            state: "available",
            asOf: "2026-08-01T12:00:00.000Z",
            items: []
          },
          instagram: { state: "unavailable" },
          live: { state: "unavailable" }
        })
      });
    });

    await page.goto("/alta-data");

    const main = page.getByRole("main");
    await expect(main.getByText("No hay episodios atribuidos a este programa.")).toBeVisible();
    await expect(main.getByRole("link", { name: /episodio/i })).toHaveCount(0);
  });

  test("explains unavailable and failed media without claiming that items exist", async ({ page }) => {
    await page.route("**/api/acroxtv-feed/alta-data", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: "alta-data",
          episodes: { state: "unavailable" },
          instagram: { state: "error" },
          live: { state: "unavailable" }
        })
      });
    });

    await page.goto("/alta-data");

    const main = page.getByRole("main");
    await expect(main.getByText("La programación de YouTube aún no está disponible para este programa.")).toBeVisible();
    await expect(main.getByText("El streaming en vivo aún no está disponible para este programa.")).toBeVisible();
    await expect(main.getByRole("alert")).toHaveText("No pudimos cargar Instagram para este programa.");
    await expect(main).not.toContainText("contenido disponible");
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
    await page.route("**/alta-data-logo.png", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "text/plain",
        body: "Artwork unavailable"
      });
    });
    const artworkRequest = page.waitForRequest("**/alta-data-logo.png");

    await page.goto("/");

    const altaDataCover = page.getByRole("link", { name: /Alta Data ¡Te Tire!/ });
    await altaDataCover.scrollIntoViewIfNeeded();
    await artworkRequest;
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
