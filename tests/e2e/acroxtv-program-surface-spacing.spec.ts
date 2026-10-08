import { expect, test } from "@playwright/test";

const sponsors = [
  ["Pinar Tenis Las Varillas", "https://www.instagram.com/pinartenislasvarillas/"],
  ["Magnus", "https://www.instagram.com/empanadasmagnus/"],
  ["FG Beauty", "https://www.instagram.com/fgbeautyday/"],
  ["San José", "https://www.instagram.com/distribuidora_sanjose/"],
  ["Sharol moda", "https://www.instagram.com/sharolmoda/"]
] as const;

test("raises desktop program copy and lowers artwork without shrinking it; preserves mobile composition", async ({ page }) => {
  const baseline = {
    "alta-data-te-tire": {
      1440: { cover: 417.06, host: 53, titleTop: 214, summaryTop: 414.72, actionsTop: 530.06, shift: 24 },
      1024: { cover: 351.4, host: 52.99, titleTop: 201.19, summaryTop: 354.97, actionsTop: 464.41, shift: 20 }
    },
    "mas-que-nutricion": {
      1440: { cover: 373.28, host: 96.78, titleTop: 214, summaryTop: 414.72, actionsTop: 530.06, shift: 24 },
      1024: { cover: 307.63, host: 96.78, titleTop: 201.19, summaryTop: 354.97, actionsTop: 464.41, shift: 20 }
    }
  } as const;
  await page.route("https://**", async (route) => route.fulfill({ status: 204, body: "" }));
  await page.route("**/api/acroxtv-feed/**", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ episodes: { state: "unavailable" }, instagram: { state: "unavailable" }, live: { state: "unavailable" } })
  }));
  await page.route("**/api/acroxtv-feed", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ liveItem: null, latestEpisode: null, topEpisode: null, episodes: [], instagram: [], youtubeError: false, instagramError: true })
  }));

  for (const slug of ["alta-data-te-tire", "mas-que-nutricion"] as const) {
    for (const width of [1440, 1024, 375] as const) {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 960 });
      await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
      await page.goto(`/${slug}`);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.querySelectorAll(".program-hero img"), (image) => (image as HTMLImageElement).decode().catch(() => undefined)));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const hero = page.locator(".program-hero");
      const heading = hero.getByRole("heading", { level: 1 });
      await expect(heading).toBeAttached();
      const metrics = await hero.evaluate((element) => {
        const visibleBounds = (image: HTMLImageElement) => {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext("2d")!;
          context.drawImage(image, 0, 0);
          const alpha = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let top = canvas.height, bottom = -1;
          for (let pixel = 3; pixel < alpha.length; pixel += 4) {
            if (alpha[pixel] > 8) {
              const y = Math.floor((pixel - 3) / 4 / canvas.width);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y);
            }
          }
          const rect = image.getBoundingClientRect();
          const ratio = canvas.width / canvas.height;
          const boxRatio = rect.width / rect.height;
          const contentHeight = getComputedStyle(image).objectFit === "contain" && ratio > boxRatio ? rect.width / ratio : rect.height;
          const contentTop = rect.top + (rect.height - contentHeight) / 2;
          return { top: contentTop + top / canvas.height * contentHeight, height: (bottom + 1 - top) / canvas.height * contentHeight };
        };
        const kicker = element.querySelector(".program-hero-kicker")!.getBoundingClientRect();
        const title = element.querySelector("h1")!.getBoundingClientRect();
        const summary = element.querySelector(".program-hero-summary")!.getBoundingClientRect();
        const actions = element.querySelector(".program-hero-copy nav")!.getBoundingClientRect();
        const artwork = element.querySelector(".program-hero-identity")!.getBoundingClientRect();
        const cover = visibleBounds(element.querySelector(".program-hero-cover") as HTMLImageElement);
        const host = visibleBounds(element.querySelector(".program-host-name") as HTMLImageElement);
        const heroRect = element.getBoundingClientRect();
        const supporting = document.querySelector(".program-supporting") ?? document.querySelector(".program-latest-section")!;
        return {
          kickerTop: kicker.top, kickerBottom: kicker.bottom, titleTop: title.top,
          summaryTop: summary.top, actionsTop: actions.top, coverTop: cover.top,
          coverHeight: cover.height, hostHeight: host.height, artBottom: artwork.bottom,
          heroBottom: heroRect.bottom, supportingTop: supporting.getBoundingClientRect().top,
          rowGap: getComputedStyle(element).rowGap, headingClip: getComputedStyle(element.querySelector("h1")!).clip,
          scrollWidth: document.body.scrollWidth, viewportWidth: innerWidth
        };
      });

      if (width > 800) {
        const expected = baseline[slug][width];
        expect(metrics.rowGap).toBe("0px");
        expect(metrics.titleTop - metrics.kickerBottom).toBe(14);
        expect(metrics.kickerTop).toBe(104);
        expect(metrics.coverTop - metrics.kickerTop).toBeGreaterThanOrEqual(20);
        expect(Math.abs(metrics.coverHeight - expected.cover) / expected.cover).toBeLessThanOrEqual(.05);
        expect(Math.abs(metrics.hostHeight - expected.host) / expected.host).toBeLessThanOrEqual(.05);
        expect(metrics.titleTop).toBeLessThan(expected.titleTop);
        expect(metrics.summaryTop).toBeLessThan(expected.summaryTop);
        expect(metrics.actionsTop).toBeLessThan(expected.actionsTop);
        expect(metrics.artBottom).toBeLessThan(metrics.heroBottom);
        expect(metrics.artBottom).toBeLessThan(metrics.supportingTop);
      } else {
        expect(metrics.headingClip).toBe("rect(0px, 0px, 0px, 0px)");
        expect(metrics.coverTop).toBeLessThan(metrics.summaryTop);
        expect(metrics.rowGap).toBe("0px");
        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);
      }

      if (width === 1440 || width === 375) {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.screenshot({ path: `/tmp/program-surface-spacing/${slug}-${width}.png`, fullPage: true });
      }
    }
  }
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 }
]) {
  test(`Alta Data sponsor cards are transparent, accessible Instagram links on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.route("https://**", async (route) => route.fulfill({ status: 204, body: "" }));
    await page.route("**/api/acroxtv-feed/alta-data-te-tire", async (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ programSlug: "alta-data-te-tire", episodes: { state: "unavailable" }, instagram: { state: "unavailable" }, live: { state: "unavailable" } })
    }));
    await page.route("**/api/acroxtv-feed", async (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ liveItem: null, latestEpisode: null, topEpisode: null, episodes: [], instagram: [], youtubeError: false, instagramError: true })
    }));
    await page.goto("/alta-data-te-tire");

    const ribbon = page.getByRole("region", { name: "Nos acompañan" });
    await expect(ribbon.getByRole("heading", { name: "Con el apoyo de" })).toBeVisible();
    await ribbon.focus();
    const tracks = ribbon.locator("ul.sponsor-ribbon-track");
    await expect(tracks).toHaveCount(2);
    const originalTrack = tracks.nth(0);
    const duplicateTrack = tracks.nth(1);
    await expect(duplicateTrack).toHaveAttribute("aria-hidden", "true");

    for (let index = 0; index < sponsors.length; index += 1) {
      const [name, url] = sponsors[index];
      const originalLink = originalTrack.getByRole("link", { name });
      const duplicateLink = duplicateTrack.locator("a").nth(index);
      await expect(originalLink).toHaveAttribute("href", url);
      await expect(originalLink).toHaveAttribute("target", "_blank");
      await expect(originalLink).toHaveAttribute("rel", "noopener noreferrer");
      await expect(originalLink.locator("img")).toHaveAttribute("alt", name);
      await expect(duplicateLink).toHaveAttribute("href", url);
      await expect(duplicateLink).toHaveAttribute("tabindex", "-1");

      const card = originalLink.locator("..");
      const normalBorderWidth = await card.evaluate((element) => getComputedStyle(element).borderWidth);
      await card.hover();
      const geometry = await card.evaluate((element) => {
        const cardRect = element.getBoundingClientRect();
        const linkRect = element.querySelector("a")!.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          card: { x: cardRect.x, y: cardRect.y, width: cardRect.width, height: cardRect.height },
          link: { x: linkRect.x, y: linkRect.y, width: linkRect.width, height: linkRect.height },
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          hoverBackgroundImage: style.backgroundImage,
          borderWidth: style.borderWidth,
          before: getComputedStyle(element, "::before").backgroundImage,
          after: getComputedStyle(element, "::after").backgroundImage
        };
      });
      expect(normalBorderWidth).toBe("0px");
      expect(geometry.borderWidth).toBe("0px");
      expect(geometry.link).toEqual(geometry.card);
      expect(geometry.backgroundColor).toBe("rgba(0, 0, 0, 0)");
      expect(geometry.backgroundImage).toBe("none");
      expect(geometry.hoverBackgroundImage).toBe("none");
      expect(geometry.before).toBe("none");
      expect(geometry.after).toBe("none");
    }

    await expect(originalTrack.locator("a")).toHaveCount(5);
    expect(await originalTrack.locator("a").evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).tabIndex))).toEqual([0, 0, 0, 0, 0]);
    const firstLink = originalTrack.locator("a").first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
    expect(await firstLink.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
    if (viewport.name === "desktop") {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await firstLink.scrollIntoViewIfNeeded();
      await originalTrack.locator("li").first().screenshot({ path: "/tmp/program-surface-spacing/alta-data-sponsor-card.png" });
    }
  });
}
