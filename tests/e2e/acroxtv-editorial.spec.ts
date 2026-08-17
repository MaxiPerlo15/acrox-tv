import { expect, test, type Page, type Route } from "@playwright/test";
import { PROGRAMS } from "@/domain/programs";

const TRANSPARENT_PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLJNgAAAABJRU5ErkJggg==", "base64");
const mockExternalThumbnails = async (page: Page) => {
  const fulfillThumbnail = (route: Route) => route.fulfill({ contentType: "image/png", body: TRANSPARENT_PNG });
  await Promise.all([page.route("**/i.ytimg.com/**", fulfillThumbnail), page.route("**/scontent.cdninstagram.com/**", fulfillThumbnail)]);
  await page.route("**/_next/image?url=**", async (route) => {
    const source = new URL(route.request().url()).searchParams.get("url");
    if (source?.startsWith("https://i.ytimg.com/") || source?.startsWith("https://scontent.cdninstagram.com/")) {
      await fulfillThumbnail(route);
      return;
    }
    await route.continue();
  });
};

test.describe("Acrox TV direct program routes", () => {
  test.beforeEach(async ({ page }) => {
    await mockExternalThumbnails(page);
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
      await expect(page.getByRole("contentinfo")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toContainText("Acrox ©");
      await expect(page.getByRole("heading", { level: 2, name: "Episodios" })).toBeVisible();
      await expect(
        page.getByRole("contentinfo").getByLabel("Navegacion del pie de pagina").getByRole("link", { name: "Inicio" })
      ).toHaveAttribute("href", "/#inicio");
    }
  });

  test("serves the canonical Alta URL and rejects the former direct alias", async ({ page }) => {
    await page.goto("/alta-data-te-tire");
    await expect(page.getByRole("heading", { level: 1, name: "Alta Data ¡Te Tire!" })).toBeVisible();

    const response = await page.goto("/alta-data");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Esta página no está disponible" })).toBeVisible();
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
          programSlug: route.request().url().endsWith("/alta-data-te-tire") ? "alta-data-te-tire" : "mas-que-nutricion",
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

  test("renders available Instagram items without sibling media", async ({ page }) => {
    const siblingThumbnail = "https://i.ytimg.com/vi/sibling-nutrition/hqdefault.jpg";
    await page.route("**/api/acroxtv-feed/*", async (route) => {
      const isAlta = route.request().url().endsWith("/alta-data-te-tire");
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: isAlta ? "alta-data-te-tire" : "mas-que-nutricion",
          episodes: {
            state: "available",
            asOf: "2026-08-01T12:00:00.000Z",
            items: [
              {
                videoId: isAlta ? "alta-episode" : "sibling-nutrition",
                title: isAlta ? "Episodio de Alta Data" : "Episodio de Más que Nutrición",
                watchUrl: `https://youtube.com/watch?v=${isAlta ? "alta-episode" : "sibling-nutrition"}`,
                thumbnailUrl: isAlta ? "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" : siblingThumbnail,
                publishedAt: "2026-08-01T12:00:00.000Z",
                durationSeconds: 120,
                viewCount: 10
              }
            ]
          },
          instagram: {
            state: "available",
            asOf: "2026-08-01T12:00:00.000Z",
            items: [{ id: "instagram-alta", platform: "instagram", title: "Publicación de Alta Data", url: "https://instagram.com/p/alta", thumbnailUrl: "https://scontent.cdninstagram.com/alta.jpg", publishedAt: "2026-08-01T12:00:00.000Z" }]
          },
          live: { state: "unavailable" }
        })
      });
    });

    await page.goto("/alta-data-te-tire");

    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: "Episodios" })).toBeVisible();
    await expect(main.getByLabel("Episodios").getByRole("link", { name: "Episodio de Alta Data" })).toBeVisible();
    await expect(main.getByRole("link", { name: "Publicación de Alta Data" })).toHaveAttribute("href", "https://instagram.com/p/alta");
    await expect(main.locator('img[src*="dQw4w9WgXcQ"]')).toHaveCount(3);
    await expect(main.locator('img[src*="sibling-nutrition"]')).toHaveCount(0);
    await expect(main).not.toContainText("Más que Nutrición");
    await expect(main.getByText("La programación estará disponible próximamente.")).toHaveCount(0);
  });

  test("renders unavailable Instagram distinctly with a latest-episode fallback", async ({ page }) => {
    await page.route("**/api/acroxtv-feed/alta-data-te-tire", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: "alta-data-te-tire",
          episodes: {
            state: "available",
            asOf: "2026-08-01T12:00:00.000Z",
            items: [{ videoId: "alta-latest", title: "Episodio real de Alta", watchUrl: "https://youtube.com/watch?v=alta-latest", thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", publishedAt: "2026-08-01T12:00:00.000Z", durationSeconds: 120, viewCount: 10 }]
          },
          instagram: { state: "unavailable" },
          live: { state: "available", asOf: "2026-08-01T12:00:00.000Z", items: null }
        })
      });
    });

    await page.goto("/alta-data-te-tire");
    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: "Episodio real de Alta" }).first()).toHaveAttribute("href", "https://youtube.com/watch?v=alta-latest");
    await expect(main.getByText("Instagram aún no está disponible para este programa.")).toBeVisible();
    await expect(main.getByRole("heading", { level: 2, name: "En vivo" })).toHaveCount(0);
  });

  test("renders stale Instagram items with a stale indication", async ({ page }) => {
    await page.route("**/api/acroxtv-feed/alta-data-te-tire", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: "alta-data-te-tire",
          episodes: {
            state: "stale",
            asOf: "2026-07-31T12:00:00.000Z",
            items: []
          },
          instagram: {
            state: "stale",
            asOf: "2026-07-31T12:00:00.000Z",
            items: [{ id: "instagram-stale", platform: "instagram", title: "Publicación de Instagram en caché", url: "https://instagram.com/p/stale", thumbnailUrl: "https://scontent.cdninstagram.com/stale.jpg", publishedAt: "2026-07-31T12:00:00.000Z" }]
          },
          live: { state: "unavailable" }
        })
      });
    });

    await page.goto("/alta-data-te-tire");

    const main = page.getByRole("main");
    await expect(main.getByText("Este contenido puede no estar actualizado.")).toHaveCount(2);
    await expect(main.getByLabel("Último episodio")).toContainText("No hay episodios atribuidos a este programa.");
    await expect(main.getByText("No hay episodios atribuidos a este programa.")).toHaveCount(2);
    await expect(main.getByRole("link", { name: "Publicación de Instagram en caché" })).toBeVisible();
  });

  test("keeps an available zero-item feed honest", async ({ page }) => {
    await page.route("**/api/acroxtv-feed/alta-data-te-tire", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: "alta-data-te-tire",
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

    await page.goto("/alta-data-te-tire");

    const main = page.getByRole("main");
    await expect(main.getByText("No hay episodios atribuidos a este programa.")).toHaveCount(2);
    await expect(main.getByLabel("Último episodio")).toContainText("No hay episodios atribuidos a este programa.");
    await expect(main.getByRole("link", { name: /episodio/i })).toHaveCount(0);
  });

  for (const state of ["available", "stale"] as const) {
    test(`keeps a ${state} empty Instagram feed honest`, async ({ page }) => {
      await page.route("**/api/acroxtv-feed/alta-data-te-tire", async (route) => {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            programSlug: "alta-data-te-tire", episodes: { state: "unavailable" },
            instagram: { state, asOf: "2026-08-01T12:00:00.000Z", items: [] }, live: { state: "unavailable" }
          })
        });
      });
      await page.goto("/alta-data-te-tire");

      const instagram = page.getByRole("region", { name: "Instagram" });
      await expect(instagram.getByText("No hay publicaciones de Instagram atribuidas a este programa.")).toBeVisible();
      await expect(instagram.getByText("Este contenido puede no estar actualizado.")).toHaveCount(state === "stale" ? 1 : 0);
      await expect(instagram.getByRole("link")).toHaveCount(0);
    });
  }

  test("renders an Instagram error distinctly from the primary episode error", async ({ page }) => {
    await page.route("**/api/acroxtv-feed/alta-data-te-tire", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: "alta-data-te-tire",
          episodes: { state: "error" },
          instagram: { state: "error" },
          live: { state: "unavailable" }
        })
      });
    });

    await page.goto("/alta-data-te-tire");

    const main = page.getByRole("main");
    const primaryMedia = main.getByLabel("Programación del programa").getByRole("alert").first();
    await expect(primaryMedia).toHaveText("No pudimos cargar la programación de YouTube para este programa.");
    await expect(main.getByRole("alert").filter({ hasText: "No pudimos cargar Instagram para este programa." })).toBeVisible();
    await expect(main).not.toContainText("La programación de YouTube aún no está disponible para este programa.");
    await expect(main.getByRole("heading", { level: 2, name: "En vivo" })).toHaveCount(0);
  });

  test("keeps the direct program media hierarchy readable at 380px @mobile", async ({ page }) => {
    await page.setViewportSize({ width: 380, height: 844 });
    await page.route("**/api/acroxtv-feed/alta-data-te-tire", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          programSlug: "alta-data-te-tire",
          episodes: {
            state: "available",
            asOf: "2026-08-01T12:00:00.000Z",
            items: [{ videoId: "latest", title: "Último episodio de Alta", watchUrl: "https://youtube.com/watch?v=latest", thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", publishedAt: "2026-08-01T12:00:00.000Z", durationSeconds: 120, viewCount: 10 }]
          },
          instagram: { state: "unavailable" },
          live: { state: "unavailable" }
        })
      });
    });

    await page.goto("/alta-data-te-tire");
    const main = page.getByRole("main");
    const latest = main.getByRole("heading", { level: 2, name: "Último episodio" });
    await expect(latest).toBeVisible();
    await expect(main.getByRole("link", { name: "Último episodio de Alta" }).first()).toBeVisible();
    for (const name of ["Más visto", "Episodios", "Instagram"]) {
      await expect(main.getByRole("region", { name })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(380);
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
    await expect(covers.nth(0)).toHaveAttribute("href", "/alta-data-te-tire");
    await expect(covers.nth(1)).toHaveAttribute("href", "/mas-que-nutricion");
    const [altaDataBox, nutritionBox] = await Promise.all([covers.nth(0).boundingBox(), covers.nth(1).boundingBox()]);
    expect(altaDataBox?.width).toBe(nutritionBox?.width);
    expect(altaDataBox?.height).toBe(nutritionBox?.height);
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toBeVisible();

    await page.goto("/alta-data-te-tire");
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toHaveCount(0);
  });

  test("keeps each canonical program name in the visible editorial hierarchy", async ({ page }) => {
    await page.goto("/");

    const directory = page.getByRole("region", { name: "Programas de Acrox TV" });
    for (const program of PROGRAMS) {
      await expect(directory.getByRole("heading", { level: 3, name: program.name })).toBeVisible();
    }
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

  test("renders neutral sponsorship cells without inventing brands", async ({ page }) => {
    await page.goto("/");

    const ribbon = page.getByRole("region", { name: "Nos acompañan" });
    await expect(ribbon.getByRole("heading", { name: "Con el apoyo de" })).toBeVisible();
    await expect(ribbon.getByRole("listitem", { name: "Espacio de colaboración" })).toHaveCount(5);
    await expect(ribbon).not.toContainText("Logos de referencia");
    await expect(ribbon).not.toContainText("Espacio reservado para aliados aprobados");
  });

  test("pauses the sponsorship ribbon for keyboard and reduced-motion visitors", async ({ page }) => {
    await page.goto("/");

    const ribbon = page.getByRole("region", { name: "Nos acompañan" });
    const track = ribbon.locator(".sponsor-ribbon-viewport");
    await ribbon.focus();
    await expect(track).toHaveCSS("animation-play-state", "paused");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(track).toHaveCSS("animation-name", "none");
  });

  test("keeps legacy media, live, and feed content out of the home directory", async ({ page }) => {
    await page.goto("/");

    const main = page.getByRole("main");
    await expect(main.locator(".live-stream-panel, .social-feeds-stack, .social-carousel, video, audio, iframe, picture, source")).toHaveCount(0);
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
