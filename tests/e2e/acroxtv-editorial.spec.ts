import { expect, test, type Page, type Route } from "@playwright/test";
import { PROGRAMS } from "@/domain/programs";

const TRANSPARENT_PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLJNgAAAABJRU5ErkJggg==", "base64");
const PANEL_FREE_PROGRAM_DIRECTORY_STYLES = {
  backgroundColor: "rgba(0, 0, 0, 0)",
  backgroundImage: "none",
  borderTopWidth: "0px"
};
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
      await expect(page.getByRole("region", { name: "Episodios" })).toBeVisible();
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

  test("keeps Instagram unavailable without sibling media", async ({ page }) => {
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
    await expect(main.getByRole("region", { name: "Episodios" })).toBeVisible();
    await expect(main.getByRole("region", { name: "Episodios" }).getByRole("button", { name: "Reproducir Episodio de Alta Data" })).toBeVisible();
    await expect(main.getByText("Instagram aún no está disponible para este programa.")).toBeVisible();
    await expect(main.getByRole("link", { name: "Publicación de Alta Data" })).toHaveCount(0);
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
    await expect(main.getByRole("region", { name: "Último episodio" }).getByRole("button", { name: "Reproducir Episodio real de Alta" })).toBeVisible();
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
    await expect(main.getByText("Este contenido puede no estar actualizado.")).toHaveCount(0);
    await expect(main.getByLabel("Último episodio")).toContainText("No hay episodios atribuidos a este programa.");
    await expect(main.getByText("No hay episodios atribuidos a este programa.")).toHaveCount(3);
    await expect(main.getByText("Instagram aún no está disponible para este programa.")).toBeVisible();
    await expect(main.getByRole("link", { name: "Publicación de Instagram en caché" })).toHaveCount(0);
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
    await expect(main.getByText("No hay episodios atribuidos a este programa.")).toHaveCount(3);
    await expect(main.getByLabel("Último episodio")).toContainText("No hay episodios atribuidos a este programa.");
    await expect(main.getByRole("button", { name: /Reproducir episodio/i })).toHaveCount(0);
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
      await expect(instagram.getByText("Instagram aún no está disponible para este programa.")).toBeVisible();
      await expect(instagram.getByText("Este contenido puede no estar actualizado.")).toHaveCount(0);
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
    await expect(main.getByText("Instagram aún no está disponible para este programa.")).toBeVisible();
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
    const latest = main.getByRole("region", { name: "Último episodio" });
    await expect(latest).toBeVisible();
    await expect(latest.getByRole("button", { name: "Reproducir Último episodio de Alta" })).toBeVisible();
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
  test("shows exactly the two canonical program cards without a home sponsor region", async ({ page }) => {
    await page.goto("/");

    const directory = page.getByRole("region", { name: "Programas de Acrox TV" });
    const cards = directory.locator("[data-program-cover]");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toHaveAttribute("href", "/alta-data-te-tire");
    await expect(cards.nth(1)).toHaveAttribute("href", "/mas-que-nutricion");
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toHaveCount(0);
  });

  test("shows the two canonical program cards without a home sponsor region on mobile @mobile", async ({ page }) => {
    await page.setViewportSize({ width: 380, height: 844 });
    await page.goto("/");

    const directory = page.getByRole("region", { name: "Programas de Acrox TV" });
    const cards = directory.locator("[data-program-cover]");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toHaveAttribute("href", "/alta-data-te-tire");
    await expect(cards.nth(1)).toHaveAttribute("href", "/mas-que-nutricion");
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toHaveCount(0);
  });

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

  test("keeps the directory sponsor-free and renders program-owned sponsor invitations", async ({ page }) => {
    await page.goto("/");

    const directory = page.getByRole("region", { name: "Programas de Acrox TV" });
    const covers = directory.locator("[data-program-cover]");
    await expect(covers).toHaveCount(2);
    await expect(covers.nth(0)).toHaveAttribute("href", "/alta-data-te-tire");
    await expect(covers.nth(1)).toHaveAttribute("href", "/mas-que-nutricion");
    const [altaDataBox, nutritionBox] = await Promise.all([covers.nth(0).boundingBox(), covers.nth(1).boundingBox()]);
    expect(altaDataBox?.width).toBe(nutritionBox?.width);
    expect(altaDataBox?.height).toBe(nutritionBox?.height);
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toHaveCount(0);

    for (const program of PROGRAMS) {
      await page.goto(`/${program.slug}`);
      const sponsors = page.getByRole("region", { name: "Nos acompañan" });
      await expect(sponsors).toHaveCount(1);
      await expect(sponsors.getByRole("link", { name: /Próximamente.*Tu marca acá.*Ser sponsor de ACROX TV/ })).toHaveCount(1);
      await expect(sponsors.locator(".sponsor-ribbon-invitation")).toHaveCount(program.slug === "alta-data-te-tire" ? 2 : 14);
      await expect(sponsors.locator("img")).toHaveCount(program.slug === "alta-data-te-tire" ? 10 : 0);
      const isAfterMedia = await page.evaluate(() => {
        const media = document.querySelector(".program-media");
        const sponsors = document.querySelector('[aria-label="Nos acompañan"]');
        const footer = document.querySelector("footer");
        return Boolean(media && sponsors && footer && media.compareDocumentPosition(sponsors) & Node.DOCUMENT_POSITION_FOLLOWING && sponsors.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      expect(isAfterMedia).toBe(true);
    }
  });

  test("keeps each canonical program name in the visible editorial hierarchy", async ({ page }) => {
    await page.goto("/");

    const directory = page.getByRole("region", { name: "Programas de Acrox TV" });
    for (const program of PROGRAMS) {
      await expect(directory.getByRole("heading", { level: 3, name: program.name })).toBeVisible();
    }
  });

  test("places the home program directory directly on the page background", async ({ page }) => {
    await page.goto("/");

    const directory = page.locator("#acroxtv.program-directory");
    await expect(directory).toBeVisible();
    const styles = await directory.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        borderTopWidth: styles.borderTopWidth
      };
    });
    expect(styles).toEqual(PANEL_FREE_PROGRAM_DIRECTORY_STYLES);
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
    await page.waitForTimeout(1_000);

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

  test("uses the shared kicker treatment and repeated sponsor invitations on both program routes", async ({ page }) => {
    for (const program of PROGRAMS) {
      await page.setViewportSize({ width: 380, height: 812 });
      await page.goto(`/${program.slug}`);

      const main = page.getByRole("main");
      const hero = main.locator(".program-hero");
      const programKicker = hero.locator(".program-hero-kicker");
      const title = hero.getByRole("heading", { level: 1, name: program.name });
      const sponsors = main.getByRole("region", { name: "Nos acompañan" });
      const sponsorHeading = sponsors.getByRole("heading", { level: 2, name: "Con el apoyo de" });
      const tile = sponsors.locator(".sponsor-ribbon-track:not([aria-hidden]) li").first();

      await expect(title).toBeVisible();
      await expect(programKicker).toHaveText("ACROX TV");
      await expect(programKicker.locator("span")).toHaveCount(1);
      await expect(sponsorHeading).toBeVisible();
      const kickerTypography = await Promise.all([programKicker, sponsorHeading].map((element) => element.evaluate((node) => {
        const style = getComputedStyle(node);
        return { color: style.color, fontWeight: style.fontWeight, letterSpacing: style.letterSpacing };
      })));
      expect(kickerTypography[1]).toEqual(kickerTypography[0]);
      await expect(sponsorHeading.locator("span")).toHaveCount(1);
      await expect(tile).toHaveCount(1);
      await expect(sponsors.getByRole("link", { name: /Próximamente.*Tu marca acá.*Ser sponsor de ACROX TV/ })).toHaveCount(1);
      await expect(sponsors.locator(".sponsor-ribbon-track:not([aria-hidden]) li")).toHaveCount(program.slug === "alta-data-te-tire" ? 6 : 7);
      await expect(sponsors.locator(".sponsor-ribbon-motion")).toHaveCount(1);

      const marker = await programKicker.locator("span").first().evaluate((element) => {
        const style = getComputedStyle(element);
        return { width: style.width, height: style.height, background: style.backgroundImage };
      });
      expect(marker).toMatchObject({ width: "4px", height: "32px" });
      expect(marker.background).toContain("linear-gradient");
      const sponsorMarker = await sponsorHeading.locator("span").evaluate((element) => {
        const style = getComputedStyle(element);
        return { width: style.width, height: style.height, background: style.backgroundImage };
      });
      expect(sponsorMarker).toMatchObject({ width: "4px", height: "32px" });
      expect(sponsorMarker.background).toContain("linear-gradient");
      const sponsorSectionStyle = await sponsors.evaluate((element) => {
        const style = getComputedStyle(element);
        return { borderRadius: style.borderRadius, backgroundImage: style.backgroundImage };
      });
      expect(sponsorSectionStyle).toEqual({ borderRadius: "0px", backgroundImage: "none" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(380);
    }
  });

  test("renders sponsor and invitation tiles with a tight rail on desktop and mobile", async ({ page }) => {
    for (const program of PROGRAMS) {
      for (const viewport of [{ width: 1440, height: 900 }, { width: 380, height: 812 }]) {
        await page.setViewportSize(viewport);
        await page.goto(`/${program.slug}`);

        const sponsors = page.getByRole("region", { name: "Nos acompañan" });
        const tile = sponsors.locator(".sponsor-ribbon-track:not([aria-hidden]) li").first();
        const metrics = await tile.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const listStyle = getComputedStyle(element.parentElement!);
          return { width: rect.width, height: rect.height, gap: listStyle.gap };
        });

        const expectedTileSize = viewport.width < 700 ? 180 : 300;
        await expect(sponsors.locator(".sponsor-ribbon-track:not([aria-hidden]) li")).toHaveCount(program.slug === "alta-data-te-tire" ? 6 : 7);
        expect(metrics).toEqual({ width: expectedTileSize, height: expectedTileSize, gap: "2px" });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test("does not render the legacy sponsor marquee in the home directory", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("region", { name: "Nos acompañan" })).toHaveCount(0);
    await expect(page.getByRole("img", { name: "Magnus" })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  });

  test("does not emit aspect-ratio warnings for program or sponsor images", async ({ page }) => {
    const affectedSources = [
      "/alta-data-logo.png",
      "/sponsors/logo-magnus.webp",
      "/sponsors/logo-fg-beauty.webp",
      "/sponsors/logo-noe-peluqueria.webp",
      "/sponsors/logo-san-jose.webp",
      "/sponsors/logo-checa.webp"
    ];
    const imageWarnings: string[] = [];

    page.on("console", (message) => {
      const text = message.text();
      if (text.includes("Image with src") && affectedSources.some((source) => text.includes(source))) {
        imageWarnings.push(text);
      }
    });

    await page.goto("/");
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toHaveCount(0);

    await page.goto("/alta-data-te-tire");
    const programCover = page.getByRole("img", { name: "Alta Data ¡Te Tire! — portada del programa" });
    await expect(programCover).toBeVisible();
    await expect(programCover).toHaveAttribute("src", /adtt-1\.webp/);

    expect(imageWarnings).toEqual([]);
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
    await expect(page.getByRole("region", { name: "Nos acompañan" })).toHaveCount(0);
  });

  test("keeps the home program directory panel-free on mobile @mobile", async ({ page }) => {
    await page.goto("/");

    const directory = page.locator("#acroxtv.program-directory");
    await expect(directory).toBeVisible();
    const styles = await directory.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        borderTopWidth: styles.borderTopWidth
      };
    });
    expect(styles).toEqual(PANEL_FREE_PROGRAM_DIRECTORY_STYLES);
  });
});
