import { expect, test, type Locator } from "@playwright/test";

async function getVisibleLabel(locator: Locator): Promise<string> {
  return locator.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const words: string[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent?.trim()) continue;
      let ancestor = node.parentElement;
      let hidden = false;
      while (ancestor && ancestor !== element.parentElement) {
        if (ancestor.getAttribute("aria-hidden") === "true" || getComputedStyle(ancestor).display === "none" || getComputedStyle(ancestor).visibility === "hidden") {
          hidden = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (!hidden) words.push(node.textContent.trim());
    }
    return words.join(" ").replace(/\s+/g, " ").trim();
  });
}

const feed = { liveItem: null, latestEpisode: null, topEpisode: null, episodes: [], instagram: [], youtubeError: false, instagramError: true };

test.describe("approved home Lighthouse regressions", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
    // Keep external embeds/social endpoints deterministic without contacting production services.
    await page.route("https://**", (route) => route.fulfill({ status: 204, body: "" }));
    await page.route("**/api/acroxtv-feed**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(feed) }));
  });

  test("hero image advertises its source aspect ratio and keeps the desktop panel reserved", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    const hero = page.locator(".home-page .hero");
    await hero.scrollIntoViewIfNeeded();
    const image = hero.locator(".hero-logo");
    await expect(image).toHaveAttribute("width", "560");
    await expect(image).toHaveAttribute("height", "315");
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const dimensions = await hero.evaluate((element) => {
      const panel = element.querySelector(".hero-panel")!;
      const wrap = element.querySelector(".hero-logo-wrap")!;
      const img = element.querySelector(".hero-logo") as HTMLImageElement;
      const panelBox = panel.getBoundingClientRect();
      const wrapBox = wrap.getBoundingClientRect();
      const imageStyle = getComputedStyle(img);
      const imageBox = img.getBoundingClientRect();
      return { panelWidth: panelBox.width, panelHeight: panelBox.height, wrapWidth: wrapBox.width, wrapHeight: wrapBox.height, fit: imageStyle.objectFit, imageWidth: imageBox.width, imageHeight: imageBox.height, ratio: img.naturalWidth / img.naturalHeight, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
    });
    expect(dimensions.panelWidth).toBeGreaterThan(0);
    expect(dimensions.panelHeight).toBeGreaterThan(0);
    expect(dimensions.wrapWidth).toBeGreaterThan(0);
    expect(dimensions.wrapHeight).toBeGreaterThan(0);
    expect(dimensions.imageWidth / dimensions.imageHeight).toBeCloseTo(16 / 9, 2);
    expect(Math.abs(dimensions.ratio - 560 / 315)).toBeLessThanOrEqual(1 / dimensions.naturalHeight);
  });

  test("program logos use optimized delivery and reserve contained artwork inside one linked card", async ({ page }) => {
    for (const width of [375, 890, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const directory = page.locator("#acroxtv");
      await directory.scrollIntoViewIfNeeded();
      const card = directory.locator(".program-directory-card").first();
      await card.scrollIntoViewIfNeeded();
      const image = card.locator("img.program-directory-card-logo");
      await expect(image).toHaveCount(1);
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      const attrs = await image.evaluate((img: HTMLImageElement) => ({ src: img.currentSrc, sizes: img.sizes, fit: getComputedStyle(img).objectFit, box: img.getBoundingClientRect(), parent: img.parentElement!.getBoundingClientRect() }));
      expect(new URL(attrs.src).pathname).toBe("/_next/image");
      expect(attrs.sizes).toContain("330px");
      expect(attrs.sizes).not.toMatch(/^\s*(?:100vw|50vw)\s*$/);
      expect(attrs.fit).toBe("contain");
      expect(attrs.box.width).toBeGreaterThan(0);
      expect(attrs.box.height).toBeGreaterThan(0);
      expect(attrs.parent.width).toBeGreaterThan(0);
      await expect(directory.locator(".program-directory-card").first()).toHaveAttribute("href", /\/(alta-data-te-tire|mas-que-nutricion)$/);
      await expect(directory.locator(".program-directory-card").first().locator("a")).toHaveCount(0);
    }
  });

  test("program logo failure reveals the reserved fallback without changing the single card link", async ({ page }) => {
    await page.setViewportSize({ width: 890, height: 900 });
    await page.route((url) => url.pathname === "/_next/image" && url.searchParams.get("url")?.includes("/alta-data-logo.png"), (route) => route.fulfill({ status: 500, body: "image unavailable" }));
    await page.goto("/");
    const card = page.locator("#acroxtv .program-directory-card").first();
    await card.scrollIntoViewIfNeeded();
    const failedCard = page.locator("#acroxtv .program-directory-card").first();
    await failedCard.scrollIntoViewIfNeeded();
    await expect(failedCard.locator(".program-directory-card-placeholder")).toBeVisible();
    await expect(failedCard.locator(".program-directory-card-art")).toHaveAttribute("aria-hidden", "true");
    await expect(failedCard.locator("a")).toHaveCount(0);
    await expect(failedCard).toHaveAttribute("href", /\/(alta-data-te-tire|mas-que-nutricion)$/);
  });

  test("visible labels contribute to the six navigation and project link names", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const live = page.locator(".nav-stream-mobile");
    await expect(live).toContainText("ACROX TV");
    const accessibleNamePattern = (text: string) => new RegExp(text.trim().split(/\s+/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+"), "i");
    const liveVisible = await live.innerText();
    await expect(live).toHaveAccessibleName(accessibleNamePattern(liveVisible));
    const projects = page.locator("#proyectos");
    await projects.scrollIntoViewIfNeeded();
    const projectLinks = projects.locator(".home-projects-teaser-grid > article a");
    await expect(projectLinks).toHaveCount(4);
    for (const link of await projectLinks.all()) {
      const visible = await getVisibleLabel(link);
      await expect(link).toHaveAccessibleName(accessibleNamePattern(visible));
    }
    const discovery = projects.locator("a.home-projects-teaser-card--cta");
    await expect(discovery).toContainText("Descubrí todos los proyectos");
    const discoveryVisible = await getVisibleLabel(discovery);
    await expect(discovery).toHaveAccessibleName(accessibleNamePattern(discoveryVisible));
  });
});
