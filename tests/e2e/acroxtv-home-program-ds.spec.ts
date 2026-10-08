import { expect, test } from "@playwright/test";

const viewports = [{ width: 375, height: 812 }, { width: 1440, height: 900 }];
const legacyFeed = { liveItem: null, latestEpisode: null, topEpisode: null, episodes: [], instagram: [], youtubeError: false, instagramError: true };
const slugFeeds = ["alta-data-te-tire", "mas-que-nutricion"].map((programSlug) => ({
  programSlug,
  episodes: { state: "unavailable" },
  instagram: { state: "unavailable" },
  live: { state: "unavailable" }
}));

test.describe("home program design-system alignment", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
    await page.route("https://**", (route) => route.fulfill({ status: 204, body: "" }));
    await page.route("**/api/acroxtv-feed**", async (route) => {
      const url = new URL(route.request().url());
      const slug = url.searchParams.get("slug");
      const feed = slug ? slugFeeds.find((item) => item.programSlug === slug) ?? legacyFeed : legacyFeed;
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(feed) });
    });
  });

  for (const viewport of viewports) {
    test(`matches home program card contract at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);

      const hero = page.locator(".home-page .hero");
      await expect(hero.locator(".hero-metrics")).toHaveCount(0);
      const programHeading = page.locator("#acroxtv");
      await programHeading.scrollIntoViewIfNeeded();
      await expect(programHeading.locator(".program-directory-heading")).toHaveClass(/is-visible/);
      await expect(programHeading.getByText("ACROX TV", { exact: true })).toBeVisible();
      await expect(programHeading.getByText(/PROGRAMACIÓN ORIGINAL/)).toHaveCount(0);
      const accent = hero.locator(".hero-title-accent");
      const gradient = await accent.evaluate((element) => {
        const style = getComputedStyle(element);
        const token = getComputedStyle(document.documentElement).getPropertyValue("--brand-accent-gradient").trim();
        return { backgroundImage: style.backgroundImage, token };
      });
      expect(gradient.token).not.toBe("");
      expect(gradient.backgroundImage).toContain("linear-gradient");
      expect(await accent.evaluate((element) => {
        const probe = document.createElement("span");
        probe.style.backgroundImage = "var(--brand-accent-gradient)";
        document.body.append(probe);
        const expected = getComputedStyle(probe).backgroundImage;
        probe.remove();
        return getComputedStyle(element).backgroundImage === expected;
      })).toBe(true);

      const projectsSection = page.locator("#proyectos");
      await projectsSection.scrollIntoViewIfNeeded();
      await expect(projectsSection).toHaveClass(/is-visible/);
      const projectsCard = projectsSection.locator(".home-projects-teaser-card").first();
      await projectsCard.scrollIntoViewIfNeeded();
      const programCard = programHeading.locator(".program-directory-card").first();
      await programCard.scrollIntoViewIfNeeded();
      for (const image of [
        ...await projectsCard.locator("img[loading='lazy']").all(),
        ...await programCard.locator("img").all()
      ]) {
        await expect.poll(() => image.evaluate((element) => {
          const img = element as HTMLImageElement;
          return img.complete && img.naturalWidth > 0;
        }), { message: "A relevant visible home card image must load successfully" }).toBe(true);
      }
      await expect(programCard).toHaveClass(/home-projects-teaser-card/);
      await expect(programHeading.locator(".program-directory-card-meta")).toHaveCount(0);
      await expect(programCard).toContainText(/Alta Data|Nutrición/);
      const surface = async (locator: typeof projectsCard) => locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return { background: style.backgroundImage, borderRadius: style.borderRadius, borderColor: style.borderColor, boxShadow: style.boxShadow };
      });
      expect(await surface(programCard)).toEqual(await surface(projectsCard));
      await expect(programCard).toHaveAttribute("href", /\/(alta-data-te-tire|mas-que-nutricion)$/);
      const cardHoverSurface = async (locator: typeof projectsCard) => locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return { transform: style.transform, borderColor: style.borderColor, boxShadow: style.boxShadow };
      });
      const settleCardTransitions = async (locator: typeof projectsCard) => locator.evaluate(async (element) => {
        // Flush styles so newly triggered CSS transitions are observable.
        void getComputedStyle(element).transform;
        const transitions = element.getAnimations().filter((animation) =>
          Number.isFinite(animation.effect?.getComputedTiming().endTime)
        );
        await Promise.all(transitions.map((animation) => animation.finished));
      });
      await projectsCard.hover();
      await settleCardTransitions(projectsCard);
      const projectsHover = await cardHoverSurface(projectsCard);
      await programCard.hover();
      await settleCardTransitions(programCard);
      await expect.poll(() => cardHoverSurface(programCard)).toEqual(projectsHover);
      const secondProgramCard = programHeading.locator(".program-directory-card").nth(1);
      await programCard.focus();
      await expect(programCard).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(secondProgramCard).toBeFocused();
      await expect.poll(() => secondProgramCard.evaluate((element) => element.tagName)).toBe("A");
      await expect.poll(() => secondProgramCard.evaluate((element) => getComputedStyle(element).outlineWidth)).toBe("2px");
      await secondProgramCard.press("Enter");
      await expect(page).toHaveURL(/\/(alta-data-te-tire|mas-que-nutricion)$/);
    });
  }
});
