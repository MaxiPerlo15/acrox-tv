import { devices, expect, test, type Page } from "@playwright/test";
import { PROGRAMS, programPath } from "@/domain/programs";

const fillContactForm = async (page: Page, options?: { includeConsent?: boolean; includeService?: boolean }) => {
  const includeConsent = options?.includeConsent ?? true;
  const includeService = options?.includeService ?? true;

  await page.getByLabel("Nombre*").fill("Maximiliano");
  await page.getByLabel("Apellido*").fill("Perlo");

  if (includeService) {
    await page.locator(".service-select-trigger").click();
    await page.getByRole("option", { name: "Producción audiovisual" }).click();
  }

  if (includeConsent) {
    await page.getByLabel("Acepto el uso de mis datos para contacto comercial.").check();
  }
};

const installOpenSpy = async (page: Page, mode: "allowed" | "blocked") => {
  await page.addInitScript((openMode) => {
    const calls: string[] = [];
    const allowedPopup = { opener: null };

    Object.defineProperty(window, "__popupCalls", {
      configurable: true,
      writable: true,
      value: calls
    });

    Object.defineProperty(window, "open", {
      writable: true,
      configurable: true,
      value: (url: string) => {
        calls.push(url);
        return openMode === "allowed" ? allowedPopup : null;
      }
    });
  }, mode);
};

const getPopupCalls = async (page: Page) => {
  return page.evaluate(() => {
    const typedWindow = window as Window & { __popupCalls?: string[] };
    return typedWindow.__popupCalls ?? [];
  });
};

test.describe("Hero CTAs", () => {
  test("Solicitar Propuesta lleva a contacto", async ({ page }) => {
    await page.goto("/");

    await page.locator("#inicio .hero-actions").getByRole("link", { name: "Solicitar Propuesta" }).click();
    await expect(page).toHaveURL(/#contacto$/);
    await expect(page.locator("#contacto")).toBeVisible();
  });

  test("Ver Nuestros Proyectos navega a /proyectos", async ({ page }) => {
    await page.goto("/");

    await page.locator("#inicio .hero-actions").getByRole("link", { name: /Ver Nuestros Proyectos/i }).click();
    await expect(page).toHaveURL(/\/proyectos$/);
    await expect(page.locator(".projects-hero")).toBeVisible();
  });
});

test.describe("Navbar Desktop", () => {
  test("links principales navegan a secciones relevantes", async ({ page }) => {
    await page.goto("/");

    await page.locator("header .nav-links").getByRole("link", { name: "Nosotros" }).click();
    await expect(page).toHaveURL(/#quienes-somos$/);
    await expect(page.locator("#quienes-somos")).toBeVisible();

    await page.locator("header .nav-links").getByRole("link", { name: "Servicios" }).click();
    await expect(page).toHaveURL(/#servicios$/);
    await expect(page.locator("#servicios")).toBeVisible();

    await page.locator("header .nav-links").getByRole("link", { name: "Contacto" }).click();
    await expect(page).toHaveURL(/#contacto$/);
    await expect(page.locator("#contacto")).toBeVisible();
  });

  test("shows the live badge and opens the legacy live stream when the feed is live", async ({ page }) => {
    const liveUrl = "https://youtube.com/watch?v=live-acrox";
    await page.route("**/api/acroxtv-feed", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          liveItem: {
            videoId: "live-acrox",
            title: "Acrox en vivo",
            publishedAt: "2026-08-01T12:00:00.000Z",
            thumbnailUrl: "https://example.com/live.jpg",
            watchUrl: liveUrl,
            isLive: true
          },
          latestEpisode: null,
          topEpisode: null,
          episodes: [],
          instagram: [],
          youtubeError: false,
          instagramError: false
        })
      });
    });

    await page.goto("/");

    const streamLink = page.locator("header .nav-links").getByRole("link", { name: "ACROX TV EN VIVO" });
    await expect(streamLink).toHaveAttribute("href", liveUrl);
    await expect(streamLink).toHaveAttribute("target", "_blank");
    await expect(streamLink).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.locator("header .nav-stream-mobile")).toHaveAttribute("href", liveUrl);
  });

  test("keeps the Acrox TV anchors internal when the legacy feed is not live", async ({ page }) => {
    await page.route("**/api/acroxtv-feed", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          liveItem: null,
          latestEpisode: null,
          topEpisode: null,
          episodes: [],
          instagram: [],
          youtubeError: false,
          instagramError: false
        })
      });
    });

    await page.goto("/");

    const streamLink = page.locator("header .nav-links").getByRole("link", { name: "ACROX TV", exact: true });
    await expect(streamLink).toHaveAttribute("href", "/#acroxtv");
    await expect(streamLink).not.toHaveAttribute("target", "_blank");
    await expect(page.locator("header .nav-stream-mobile")).toHaveAttribute("href", "/#acroxtv");
    await expect(page.getByText("EN VIVO", { exact: true })).toHaveCount(0);
  });
});

test.describe("Form Negative Validations", () => {
  test("submit vacio no envia", async ({ page }) => {
    await installOpenSpy(page, "allowed");
    await page.goto("/#contacto");

    await page.getByRole("button", { name: /Enviar por WhatsApp/i }).click();
    const popupCalls = await getPopupCalls(page);

    expect(popupCalls.length).toBe(0);
    await expect(page.getByText("Nombre: entre 2 y 40 caracteres.")).toBeVisible();
    await expect(page.getByText("Apellido: entre 2 y 40 caracteres.")).toBeVisible();
    await expect(page.getByText("Servicio: seleccioná una opción.")).toBeVisible();
    await expect(page.getByText("Debés aceptar el uso de tus datos para contacto comercial.")).toBeVisible();
  });

  test("sin consentimiento no envia", async ({ page }) => {
    await installOpenSpy(page, "allowed");
    await page.goto("/#contacto");

    await fillContactForm(page, { includeConsent: false, includeService: true });
    await page.getByRole("button", { name: /Enviar por WhatsApp/i }).click();
    const popupCalls = await getPopupCalls(page);

    expect(popupCalls.length).toBe(0);
    await expect(page.getByText("Debés aceptar el uso de tus datos para contacto comercial.")).toBeVisible();
  });

  test("sin servicio no envia", async ({ page }) => {
    await installOpenSpy(page, "allowed");
    await page.goto("/#contacto");

    await fillContactForm(page, { includeConsent: true, includeService: false });
    await page.getByRole("button", { name: /Enviar por WhatsApp/i }).click();
    const popupCalls = await getPopupCalls(page);

    expect(popupCalls.length).toBe(0);
    await expect(page.getByText("Servicio: seleccioná una opción.")).toBeVisible();
  });
});

test.describe("Popup Fallback", () => {
  test("cuando window.open falla aplica fallback y no rompe flujo", async ({ page }) => {
    await installOpenSpy(page, "blocked");
    let waNavigationAttempted = false;

    await page.route("https://wa.me/**", async (route) => {
      waNavigationAttempted = true;
      await route.abort();
    });

    await page.goto("/#contacto");
    await fillContactForm(page);
    await page.getByRole("button", { name: /Enviar por WhatsApp/i }).click();

    await expect.poll(() => waNavigationAttempted).toBeTruthy();
  });
});

test.describe("Directorio de programas", () => {
  for (const program of PROGRAMS) {
    test(`la portada de ${program.name} lleva a su página canónica`, async ({ page }) => {
      await page.goto("/");

      const directory = page.getByRole("region", { name: "Programas de Acrox TV" });
      const programCover = directory.getByRole("link", { name: new RegExp(program.name) });
      await expect(programCover).toHaveAttribute("href", programPath(program.slug));
      await programCover.click();

      await expect(page).toHaveURL(new RegExp(`${programPath(program.slug)}$`));
      await expect(page.getByRole("heading", { level: 1, name: program.name })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${programPath(program.slug)}$`));
    });
  }
});

test.describe("Mobile Critical @mobile", () => {
  const iPhone12 = devices["iPhone 12"];
  test.use({
    viewport: iPhone12.viewport,
    userAgent: iPhone12.userAgent,
    deviceScaleFactor: iPhone12.deviceScaleFactor,
    isMobile: iPhone12.isMobile,
    hasTouch: iPhone12.hasTouch
  });

  test("navbar mobile navega a ACROX TV y Contacto @mobile", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.locator("header .nav-links.open").getByRole("link", { name: "ACROX TV" }).click();
    await expect(page).toHaveURL(/#acroxtv$/);
    await expect(page.locator("#acroxtv")).toBeVisible();

    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.locator("header .nav-links.open").getByRole("link", { name: "Contacto" }).click();
    await expect(page).toHaveURL(/#contacto$/);
    await expect(page.locator("#contacto")).toBeVisible();
  });

  test("service select mobile abre sheet, selecciona y cierra @mobile", async ({ page }) => {
    await page.goto("/#contacto");

    await page.locator(".service-select-trigger").click();
    await expect(page.getByRole("dialog", { name: "Seleccionar servicio" })).toBeVisible();

    await page.getByRole("option", { name: "Streaming" }).click();
    await expect(page.locator(".service-select-trigger")).toContainText("Streaming");

    await page.locator(".service-select-trigger").click();
    await expect(page.getByRole("dialog", { name: "Seleccionar servicio" })).toBeVisible();
    await page.locator(".service-select-sheet-head button").click();
    await expect(page.getByRole("dialog", { name: "Seleccionar servicio" })).toBeHidden();
  });
});
