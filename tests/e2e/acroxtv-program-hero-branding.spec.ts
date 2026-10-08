import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

const programs = [
  { path: "/alta-data-te-tire", name: "Alta Data ¡Te Tire!", host: "Luichi Garavoglia, conductora", logo: /alta-data-logo\.png/ },
  { path: "/mas-que-nutricion", name: "Más que Nutrición", host: "Romina Cerutti, conductora", logo: /mas-que-nutricion\.webp/ }
];

test.describe("program hero branding", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
    await page.route("https://**", async (route) => route.fulfill({ status: 204, body: "" }));
  });

  test("host-name slots and contain-painted heights match across programs", async ({ page }) => {
    for (const width of [375, 1440]) {
      const metrics = [];
      for (const program of programs) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(program.path);
        const image = page.locator(".program-host-name");
        await image.evaluate(async (element) => (element as HTMLImageElement).decode());
        metrics.push(await image.evaluate((element) => {
          const image = element as HTMLImageElement;
          const box = element.getBoundingClientRect();
          const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
          return { width: box.width, height: box.height, paintedWidth: image.naturalWidth * scale, paintedHeight: image.naturalHeight * scale, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
        }));
      }
      expect(Math.abs(metrics[0].width - metrics[1].width)).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics[0].height - metrics[1].height)).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics[0].paintedHeight - metrics[1].paintedHeight)).toBeLessThanOrEqual(1);
      expect(metrics[1].paintedWidth).toBeLessThan(metrics[0].paintedWidth);
    }
  });

  for (const program of programs) {
    test(`${program.name} retains its accessible title, host identity, and responsive order`, async ({ page }) => {
      for (const viewport of [{ width: 375, height: 812 }, { width: 1024, height: 900 }, { width: 1440, height: 960 }]) {
        await page.setViewportSize(viewport);
        await page.goto(program.path);
        const hero = page.locator(".program-hero");
        const heading = hero.getByRole("heading", { level: 1, name: program.name });
        const logo = heading.locator("img");
        const silhouette = hero.locator(".program-hero-cover");
        const host = hero.locator(".program-host-name");

        await expect(heading).toBeVisible();
        await expect(logo).toBeVisible();
        await expect(logo).toHaveAttribute("src", program.logo);
        await expect(logo).toHaveAttribute("alt", "");
        await expect(silhouette).toBeVisible();
        await expect(host).toHaveAttribute("alt", program.host);
        await expect(hero.getByRole("link", { name: "Ver último programa" })).toHaveAttribute("href", "#ultimo-programa");
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(Array.from(document.querySelectorAll(".program-hero img"), (image) => (image as HTMLImageElement).decode()));
        });
        expect(await page.locator("body").evaluate((body) => body.scrollWidth <= innerWidth)).toBe(true);
        if (viewport.width === 375 || viewport.width === 1440) {
          mkdirSync("/tmp/acrox-host-artwork-refresh", { recursive: true });
          await page.screenshot({ path: `/tmp/acrox-host-artwork-refresh/${program.path.slice(1)}-${viewport.width}.png`, fullPage: true });
        }

        const layout = await hero.evaluate((element) => {
          const cover = element.querySelector<HTMLImageElement>(".program-hero-cover")!;
          const logo = element.querySelector(".program-hero-logo")!.getBoundingClientRect();
          const copy = element.querySelector(".program-hero-summary")!.getBoundingClientRect();
          const silhouette = element.querySelector(".program-hero-cover")!.getBoundingClientRect();
          const host = element.querySelector(".program-host-name")!.getBoundingClientRect();
          return {
            logo: { x: logo.x, y: logo.y, right: logo.right, bottom: logo.bottom, width: logo.width, height: logo.height },
            silhouette: { x: silhouette.x, y: silhouette.y, right: silhouette.right, bottom: silhouette.bottom, width: silhouette.width, height: silhouette.height },
            host: { x: host.x, y: host.y, right: host.right, bottom: host.bottom, width: host.width, height: host.height },
            copy: { x: copy.x, y: copy.y, right: copy.right, bottom: copy.bottom, width: copy.width, height: copy.height },
            naturalRatio: cover.naturalWidth / cover.naturalHeight
          };
        });
        if (viewport.width >= 800) console.log(`${program.path} ${viewport.width}px hero geometry`, JSON.stringify(layout));
        if (viewport.width < 800) {
          expect(layout.logo.bottom).toBeLessThanOrEqual(layout.silhouette.y);
          expect(layout.host.bottom).toBeLessThanOrEqual(layout.copy.y);
        } else {
          expect(layout.logo.x).toBeLessThan(layout.silhouette.x);
          expect(layout.copy.x).toBeLessThan(layout.host.x);
          expect(layout.logo.width).toBeGreaterThanOrEqual(300);
          const centerDelta = Math.abs((layout.logo.x + layout.logo.width / 2) - (layout.copy.x + layout.copy.width / 2));
          console.log(`${program.path} ${viewport.width}px logo-to-copy center delta`, `${centerDelta.toFixed(2)}px`);
          expect(centerDelta).toBeLessThanOrEqual(2);
          const paintedPortraitBottom = layout.silhouette.y + layout.silhouette.width / layout.naturalRatio;
          expect(Math.abs(layout.host.y - paintedPortraitBottom)).toBeLessThanOrEqual(3);
        }
      }
    });
  }
});
