import { expect, test } from "@playwright/test";

const programSlug = "alta-data-te-tire";
const programPath = `/${programSlug}`;
const canonicalProgramPaths = ["/alta-data-te-tire", "/mas-que-nutricion"];

const programFeeds = {
  "alta-data-te-tire": {
    programSlug: "alta-data-te-tire",
    episodes: {
      state: "available",
      asOf: "2026-08-18T00:00:00.000Z",
      items: [
        {
          videoId: "alta-latest",
          title: "Alta episodio más reciente",
          watchUrl: "https://youtube.com/watch?v=alta-latest",
          thumbnailUrl: "/e2e-thumbnail.svg",
          publishedAt: "2026-08-18T00:00:00.000Z",
          durationSeconds: 120,
          viewCount: 12
        }
      ]
    },
    instagram: { state: "unavailable" },
    live: { state: "unavailable" }
  },
  "mas-que-nutricion": {
    programSlug: "mas-que-nutricion",
    episodes: { state: "unavailable" },
    instagram: { state: "unavailable" },
    live: { state: "unavailable" }
  }
};
const legacyFeed = {
  liveItem: null,
  latestEpisode: null,
  topEpisode: null,
  episodes: [],
  instagram: [],
  youtubeError: false,
  instagramError: true
};

test.describe("program visual polish", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://**", async (route) => {
      await route.fulfill({ status: 204, body: "" });
    });
    await page.route("**/api/acroxtv-feed", async (route) => {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(legacyFeed) });
    });
    await Promise.all(Object.entries(programFeeds).map(async ([slug, feed]) => {
      await page.route(`**/api/acroxtv-feed/${slug}`, async (route) => {
        await route.fulfill({ contentType: "application/json", body: JSON.stringify(feed) });
      });
    }));
  });

  test("removes program-only copy while preserving an accessible, closable latest preview", async ({ page }) => {
    await page.goto(programPath);

    const main = page.getByRole("main");
    const latest = main.getByRole("region", { name: "Último episodio" });
    const trigger = latest.getByRole("button", { name: "Reproducir Alta episodio más reciente" });

    await expect(main.getByText("SEÑAL DEL PROGRAMA", { exact: true })).toHaveCount(0);
    await expect(main.getByText("Último episodio", { exact: true })).toHaveCount(0);
    await expect(main.getByText("Conducción Acrox TV", { exact: true })).toHaveCount(0);
    await expect(latest).toBeVisible();
    await expect(trigger).toBeVisible();

    await trigger.click();
    await expect(latest.getByTitle("Alta episodio más reciente")).toBeVisible();
    expect(await latest.evaluate((element) => getComputedStyle(element, "::after").content)).toBe("none");

    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  test("keeps the shared Footer navigating from a program page to home anchors", async ({ page }) => {
    await page.goto(programPath);

    const footer = page.getByRole("contentinfo");
    const aboutLink = footer.getByRole("link", { name: "Nosotros" });

    await expect(footer).toBeVisible();
    await expect(aboutLink).toHaveAttribute("href", "/#quienes-somos");
    await aboutLink.click();
    await expect(page).toHaveURL(/\/#quienes-somos$/);
    await expect(page.locator("#quienes-somos")).toBeVisible();
  });

  for (const canonicalProgramPath of canonicalProgramPaths) {
    test(`reveals the shared Footer and keeps its root anchors on ${canonicalProgramPath}`, async ({ page }) => {
      await page.goto(canonicalProgramPath);

      const footer = page.getByRole("contentinfo");
      const aboutLink = footer.getByRole("link", { name: "Nosotros" });

      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toHaveClass(/is-visible/);
      await expect.poll(() => footer.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
      await expect(aboutLink).toHaveAttribute("href", "/#quienes-somos");

      await aboutLink.click();
      await expect(page).toHaveURL(/\/#quienes-somos$/);
    });
  }

  test("uses the same rendered kicker treatment for the home program directory as Quiénes Somos", async ({ page }) => {
    await page.goto("/");

    const aboutKicker = page.getByText("QUIÉNES SOMOS", { exact: true });
    const programKicker = page.getByText("ACROX TV / PROGRAMACIÓN ORIGINAL", { exact: true });

    await expect(aboutKicker).toBeVisible();
    await expect(programKicker).toBeVisible();

    const styles = await Promise.all([aboutKicker, programKicker].map((kicker) => kicker.evaluate((element) => {
      const marker = element.parentElement?.querySelector("span:first-child");
      if (!marker) throw new Error("Kicker marker is missing.");
      const markerStyle = getComputedStyle(marker);
      const kickerStyle = getComputedStyle(element.parentElement!);
      return {
        display: kickerStyle.display,
        gap: kickerStyle.gap,
        markerHeight: markerStyle.height,
        markerWidth: markerStyle.width,
        markerBackground: markerStyle.backgroundImage
      };
    })));

    expect(styles[1]).toEqual(styles[0]);
  });

  test("keeps the polished direct-program layout free of horizontal overflow on mobile @mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(programPath);

    const main = page.getByRole("main");
    await expect(main.getByText("SEÑAL DEL PROGRAMA", { exact: true })).toHaveCount(0);
    await expect(main.getByText("Último episodio", { exact: true })).toHaveCount(0);
    await expect(main.getByText("Conducción Acrox TV", { exact: true })).toHaveCount(0);
    expect(await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
