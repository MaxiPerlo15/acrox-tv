import { expect, test } from "@playwright/test";

const programPaths = ["/alta-data-te-tire", "/mas-que-nutricion"];

test.describe("Acrox TV program UI consistency", () => {
  test("captures the home directory at desktop and mobile widths", async ({ page }) => {
    for (const viewport of [{ width: 1440, height: 960 }, { width: 375, height: 812 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `test-results/acroxtv-home-t4-${viewport.width}.png`, fullPage: true });
    }
  });

  test("keeps program descriptions in readable body typography", async ({ page }) => {
    await page.goto("/");
    const home = await page.locator(".program-directory-card-copy p").first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { family: style.fontFamily, weight: style.fontWeight, tracking: style.letterSpacing, transform: style.textTransform };
    });
    expect(home.weight).toBe("400");
    expect(home.tracking).toBe("normal");
    expect(home.transform).toBe("none");
    const directoryDescription = await page.locator(".program-directory-heading > p:last-child").evaluate((element) => {
      const style = getComputedStyle(element);
      return { family: style.fontFamily, weight: style.fontWeight, tracking: style.letterSpacing, transform: style.textTransform };
    });
    expect(directoryDescription).toEqual(home);

    for (const path of programPaths) {
      await page.goto(path);
      const description = await page.locator(".program-hero-summary").evaluate((element) => {
        const style = getComputedStyle(element);
        return { family: style.fontFamily, weight: style.fontWeight, tracking: style.letterSpacing, transform: style.textTransform };
      });
      expect(description).toEqual({ ...home, weight: "400", tracking: "normal", transform: "none" });
    }
  });

  test("uses one directory card surface and structure without arrow affordances", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("[data-program-cover]");
    await expect(cards).toHaveCount(2);
    const cardDetails = await cards.evaluateAll((elements) => elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        surface: style.backgroundImage === "none" ? style.backgroundColor : style.backgroundImage,
        border: `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`,
        radius: style.borderRadius,
        padding: style.padding,
        children: Array.from(element.children, (child) => child.tagName),
        arrowElements: element.querySelectorAll(".program-directory-card-copy > strong").length
      };
    }));
    expect(cardDetails[0]).toEqual(cardDetails[1]);
    expect(cardDetails.map(({ arrowElements }) => arrowElements)).toEqual([0, 0]);
  });

  test("keeps mixed-platform media aligned through playback at desktop and mobile widths", async ({ page }) => {
    await page.route("**/api/acroxtv-feed/alta-data-te-tire", async (route) => {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({
        programSlug: "alta-data-te-tire",
        episodes: { state: "available", asOf: "2026-08-18T00:00:00.000Z", items: [{ videoId: "mixed-youtube", title: "YouTube fixture", watchUrl: "https://youtube.com/watch?v=mixed-youtube", thumbnailUrl: "/e2e-thumbnail.svg", publishedAt: "2026-08-18T00:00:00.000Z", durationSeconds: 120, viewCount: 20 }] },
        instagram: { state: "unavailable" }, live: { state: "unavailable" }
      }) });
    });


    for (const viewport of [{ width: 1440, height: 960 }, { width: 375, height: 812 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/alta-data-te-tire");
      const youtube = page.locator(".program-media-row__cards .platform-block.youtube").first();
      const instagram = page.locator(".program-media-row__cards .platform-block.instagram");
      await expect(youtube.locator(".social-card")).toBeVisible();
      await expect(instagram.locator(".social-card")).toBeVisible();

      const geometry = async () => Promise.all([youtube, instagram].map((platform) => platform.evaluate((element) => {
        const card = element.querySelector(".social-card")!.getBoundingClientRect();
        const media = element.querySelector(".social-image-wrap")!.getBoundingClientRect();
        const round = (value: number) => Math.round(value * 10) / 10;
        return { cardHeight: round(card.height), mediaHeight: round(media.height), mediaWidth: round(media.width), mediaCardGap: round(card.bottom - media.bottom) };
      })));
      const before = await geometry();
      expect(Math.abs(before[0].cardHeight - before[1].cardHeight)).toBeLessThanOrEqual(2);
      for (const item of before) expect(item.mediaWidth / item.mediaHeight).toBeCloseTo(16 / 9, 1);

      await youtube.getByRole("button", { name: /Reproducir YouTube fixture/i }).click();
      const player = youtube.locator("iframe[title='YouTube fixture']");
      await expect(player).toBeVisible();
      const playerBox = await player.boundingBox();
      const mediaBox = await youtube.locator(".social-image-wrap").boundingBox();
      expect(playerBox).not.toBeNull();
      expect(mediaBox).not.toBeNull();
      expect(Math.abs(playerBox!.x - mediaBox!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(playerBox!.y - mediaBox!.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(playerBox!.width - mediaBox!.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(playerBox!.height - mediaBox!.height)).toBeLessThanOrEqual(1);
      await page.keyboard.press("Escape");
      await expect(player).toHaveCount(0);
      const after = await geometry();
      expect(after).toEqual(before);
    }
  });

  test("loads the approved Nutrition identity with its complete descriptive logo alt", async ({ page }) => {
    await page.goto("/");
    const card = page.locator('[data-program-cover][href="/mas-que-nutricion"]');
    const logo = card.locator("img");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", /mas-que-nutricion\.webp/);
    await expect(logo).toHaveAttribute("alt", "Logo de Más que Nutrición");
    expect(await logo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  });
});
