import { expect, test } from "@playwright/test";

test("home renders key sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /producción/i })).toBeVisible();
  await expect(page.locator("#acroxtv")).toBeVisible();
  await expect(page.locator("#servicios")).toBeVisible();
  await expect(page.locator("#contacto")).toBeVisible();
});

test("proyectos page loads", async ({ page }) => {
  await page.goto("/proyectos");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".projects-hero")).toBeVisible();
});

test("terms and privacy pages load", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("sitemap includes proyectos", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("/proyectos");
});

test("contact form submits and reaches success state", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "open", {
      writable: true,
      configurable: true,
      value: () => ({ opener: null })
    });
  });

  await page.goto("/#contacto");

  await page.getByLabel("Nombre*").fill("Maximiliano");
  await page.getByLabel("Apellido*").fill("Perlo");
  await page.locator(".service-select-trigger").click();
  await page.getByRole("option", { name: "Producción audiovisual" }).click();
  await page.getByLabel("Acepto el uso de mis datos para contacto comercial.").check();
  await page.getByRole("button", { name: /Enviar por WhatsApp/i }).click();

  await expect(page.getByRole("button", { name: /Enviado por WhatsApp/i })).toBeVisible();
});
