import { expect, test } from "@playwright/test";

const programs = [
  {
    path: "/alta-data-te-tire",
    name: "Alta Data ¡Te Tire!",
    siblingSlug: "mas-que-nutricion",
    siblingEpisode: "Episodio de Más que Nutrición"
  },
  {
    path: "/mas-que-nutricion",
    name: "Más que Nutrición",
    siblingSlug: "alta-data-te-tire",
    siblingEpisode: "Episodio de Alta Data"
  }
] as const;

test.describe("WP-2 program media isolation", () => {
  for (const program of programs) {
    test(`does not render ${program.siblingSlug} media on ${program.path}`, async ({ page }) => {
      await page.route(`**/api/acroxtv-feed/${program.path.slice(1)}`, async (route) => {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            programSlug: program.siblingSlug,
            episodes: {
              state: "available",
              asOf: "2026-08-11T00:00:00.000Z",
              items: [
                {
                  videoId: "sibling-episode",
                  title: program.siblingEpisode,
                  watchUrl: "https://youtube.com/watch?v=sibling-episode",
                  thumbnailUrl: "https://i.ytimg.com/vi/sibling-episode/hqdefault.jpg",
                  publishedAt: "2026-08-11T00:00:00.000Z",
                  durationSeconds: 120,
                  viewCount: 10
                }
              ]
            },
            instagram: { state: "available", asOf: "2026-08-11T00:00:00.000Z", items: [] },
            live: { state: "unavailable" }
          })
        });
      });

      await page.goto(program.path);

      const main = page.getByRole("main");
      await expect(page.getByRole("heading", { level: 1, name: program.name })).toBeVisible();
      await expect(main.getByText(program.siblingEpisode)).toHaveCount(0);
      await expect(main.getByText("La programación de YouTube aún no está disponible para este programa.")).toBeVisible();
      await expect(main.getByText("Instagram aún no está disponible para este programa.")).toBeVisible();
    });
  }
});
