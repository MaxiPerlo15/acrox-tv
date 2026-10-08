import { expect, test, type Locator } from "@playwright/test";

const programSlug = "alta-data-te-tire";
const routePath = `/${programSlug}`;
const fixtureThumbnailUrl = "/e2e-thumbnail.svg";

const episodes = [
  {
    videoId: "alta-latest",
    title: "Alta episodio más reciente",
    watchUrl: "https://youtube.com/watch?v=alta-latest",
    thumbnailUrl: fixtureThumbnailUrl,
    publishedAt: "2026-08-18T00:00:00.000Z",
    durationSeconds: 120,
    viewCount: 12
  },
  {
    videoId: "alta-popular",
    title: "Alta episodio más visto",
    watchUrl: "https://youtube.com/watch?v=alta-popular",
    thumbnailUrl: fixtureThumbnailUrl,
    publishedAt: "2026-08-17T00:00:00.000Z",
    durationSeconds: 120,
    viewCount: 100
  },
  {
    videoId: "alta-archive",
    title: "Alta episodio de archivo",
    watchUrl: "https://youtube.com/watch?v=alta-archive",
    thumbnailUrl: fixtureThumbnailUrl,
    publishedAt: "2026-08-16T00:00:00.000Z",
    durationSeconds: 120,
    viewCount: 50
  }
];

const programFeed = {
  programSlug,
  episodes: { state: "available", asOf: "2026-08-18T00:00:00.000Z", items: episodes },
  instagram: { state: "unavailable" },
  live: { state: "unavailable" }
};

const expectPreviewPlayerToFillContainer = async (
  preview: ReturnType<import("@playwright/test").Page["locator"]>,
  title: string
) => {
  const player = preview.locator(`iframe[title="${title}"]`);

  await expect(player).toBeVisible();
  const dimensions = await preview.evaluate((container) => {
    const { width, height } = container.getBoundingClientRect();
    const { width: playerWidth, height: playerHeight } = container.querySelector("iframe")!.getBoundingClientRect();
    return { width, height, playerWidth, playerHeight };
  });

  expect(dimensions.width).toBeGreaterThan(0);
  expect(dimensions.height).toBeGreaterThan(0);
  expect(dimensions.width / dimensions.height).toBeCloseTo(16 / 9, 2);
  expect(Math.abs(dimensions.playerWidth - dimensions.width)).toBeLessThanOrEqual(2.5);
  expect(Math.abs(dimensions.playerHeight - dimensions.height)).toBeLessThanOrEqual(2.5);
};

const settleRevealedCards = async (cards: Locator) => {
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.evaluate((element) => element.closest("[data-reveal]")?.classList.contains("is-visible"))).toBe(true);
    await expect.poll(() => card.evaluate((element) => getComputedStyle(element.closest("[data-reveal]")!).opacity)).toBe("1");
    await expect.poll(() => card.evaluate((element) => getComputedStyle(element.closest("[data-reveal]")!).transform)).toBe("none");
  }
};

const readCarouselPosition = async (
  carousel: ReturnType<import("@playwright/test").Page["locator"]>
) => carousel.locator(".carousel-track").evaluate((track) => {
  const firstCard = track.querySelector(".social-card");
  if (!firstCard) throw new Error("Carousel track has no card to measure.");

  return {
    translateX: new DOMMatrixReadOnly(getComputedStyle(track).transform).m41,
    firstCardX: firstCard.getBoundingClientRect().x
  };
});

test.describe("program media previews", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
    await page.route(`**/api/acroxtv-feed/${programSlug}`, async (route) => {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(programFeed) });
    });
    await page.goto(routePath);
  });

  test("opens the scoped latest preview and restores its thumbnail with Escape", async ({ page }) => {
    const latest = page.getByRole("region", { name: "Último episodio" }).getByRole("button", { name: /Reproducir Alta episodio más reciente/i });

    await expect(latest).toBeVisible();
    await expect(latest.locator("img")).toHaveAttribute("alt", "Alta episodio más reciente");
    await expect.poll(() => latest.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await latest.click();
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toHaveAttribute(
      "src",
      /youtube-nocookie\.com\/embed\/alta-latest/
    );

    await page.keyboard.press("Escape");
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toHaveCount(0);
    await expect(latest).toBeVisible();
    await expect(latest).toBeFocused();
  });

  test("closes the latest preview after outside interaction", async ({ page }) => {
    const latest = page.getByRole("region", { name: "Último episodio" }).getByRole("button", { name: /Reproducir Alta episodio más reciente/i });

    await latest.click();
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toBeVisible();

    await page.getByRole("heading", { name: "Alta Data ¡Te Tire!" }).click();
    await expect(page.locator('iframe[title="Alta episodio más reciente"]')).toHaveCount(0);
    await expect(latest).toBeFocused();
  });

  test("fills the latest preview media container on desktop", async ({ page }) => {
    const latestPreview = page.locator(".program-latest-preview");

    await latestPreview.getByRole("button", { name: /Reproducir Alta episodio más reciente/i }).click();
    await expectPreviewPlayerToFillContainer(latestPreview, "Alta episodio más reciente");
  });

  test("reuses the home carousel contract for the scoped YouTube cards without external controls", async ({ page }) => {
    const mediaRow = page.getByRole("region", { name: "Medios del programa" });
    const mostViewed = mediaRow.getByRole("region", { name: "Más visto" });
    const episodesCarousel = mediaRow.getByRole("region", { name: "Episodios" });

    await expect(mostViewed.getByRole("button", { name: /Reproducir Alta episodio más visto/i })).toBeVisible();
    await expect(episodesCarousel.getByRole("button", { name: /Reproducir Alta episodio más reciente/i })).toBeVisible();
    await expect(mostViewed.locator(".media-platform-badge").first()).toHaveText("Más visto");
    await expect(mostViewed.locator(".inline-play-badge").first()).toHaveText("Reproducir");
    await expect(mostViewed.getByRole("button", { name: /Siguiente|Anterior|Ir al item/i })).toHaveCount(0);
    await expect(episodesCarousel.getByRole("button", { name: /Siguiente|Anterior|Ir al item/i })).toHaveCount(0);

    const beforeMostViewedAutoSlide = await readCarouselPosition(mostViewed);
    const beforeEpisodesAutoSlide = await readCarouselPosition(episodesCarousel);
    await page.waitForTimeout(4_700);
    const afterMostViewedAutoSlide = await readCarouselPosition(mostViewed);
    const afterEpisodesAutoSlide = await readCarouselPosition(episodesCarousel);

    expect(afterMostViewedAutoSlide.translateX).toBeLessThan(beforeMostViewedAutoSlide.translateX - 1);
    expect(afterMostViewedAutoSlide.firstCardX).toBeLessThan(beforeMostViewedAutoSlide.firstCardX - 1);
    expect(afterEpisodesAutoSlide.translateX).toBeLessThan(beforeEpisodesAutoSlide.translateX - 1);
    expect(afterEpisodesAutoSlide.firstCardX).toBeLessThan(beforeEpisodesAutoSlide.firstCardX - 1);
  });

  test("keeps the program feed isolated and renders an honest unavailable Instagram card plus Footer", async ({ page }) => {
    const main = page.getByRole("main");
    const instagram = page.getByRole("region", { name: "Instagram" });

    await expect(main.getByText("Episodio de Más que Nutrición")).toHaveCount(0);
    await expect(instagram.getByText("Instagram aún no está disponible para este programa.")).toBeVisible();
    await expect(instagram.locator("img")).toHaveCount(0);
    await expect(instagram.getByRole("button")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toBeVisible();
    const sponsors = page.getByRole("region", { name: "Nos acompañan" });
    await expect(sponsors).toHaveCount(1);
    await expect(page.getByText("Estamos preparando este espacio para futuras colaboraciones.", { exact: true })).toHaveCount(0);
    await expect(page.locator(".sponsor-ribbon-placeholder")).toHaveCount(0);
    const sponsorNames = ["Pinar Tenis Las Varillas", "Magnus", "FG Beauty", "San José", "Sharol moda"];
    const visibleSponsors = sponsors.locator(".sponsor-ribbon-track:not([aria-hidden]) li");
    await expect(visibleSponsors).toHaveCount(sponsorNames.length + 1);
    const renderedSponsorNames = await visibleSponsors.evaluateAll((items) => items.slice(0, 5).map((item) => {
      const link = item.querySelector("a");
      return link?.getAttribute("aria-label") ?? item.querySelector("img")?.getAttribute("alt");
    }));
    expect(renderedSponsorNames).toEqual(sponsorNames);
    const sponsorLinks = await visibleSponsors.evaluateAll((items) => items.slice(0, 5).map((item) => item.querySelector("a")?.getAttribute("href")));
    expect(new Set(sponsorLinks).size).toBe(5);
    expect(sponsorLinks).toEqual([
      "https://www.instagram.com/pinartenislasvarillas/",
      "https://www.instagram.com/empanadasmagnus/",
      "https://www.instagram.com/fgbeautyday/",
      "https://www.instagram.com/distribuidora_sanjose/",
      "https://www.instagram.com/sharolmoda/"
    ]);
    const duplicateTrack = sponsors.locator('.sponsor-ribbon-track[aria-hidden="true"]');
    await expect(duplicateTrack.locator("a")).toHaveCount(6);
    for (const link of await duplicateTrack.locator("a").all()) await expect(link).toHaveAttribute("tabindex", "-1");
    await expect(sponsors.locator("a[target='_blank']:not([rel~='noopener'])")).toHaveCount(0);
    await expect(sponsors.locator("a[target='_blank']:not([rel~='noreferrer'])")).toHaveCount(0);
    const [mediaBox, sponsorsBox, footerBox] = await Promise.all([
      page.getByRole("region", { name: "Medios del programa" }).boundingBox(),
      sponsors.boundingBox(),
      page.getByRole("contentinfo").boundingBox()
    ]);
    expect(mediaBox).not.toBeNull();
    expect(sponsorsBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    expect(sponsorsBox!.y).toBeGreaterThanOrEqual(mediaBox!.y + mediaBox!.height);
    expect(sponsorsBox!.y).toBeLessThan(footerBox!.y);
  });

  test("fills the latest preview media container without mobile overflow @mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const latestPreview = page.locator(".program-latest-preview");
    await latestPreview.getByRole("button", { name: /Reproducir Alta episodio más reciente/i }).click();
    await expectPreviewPlayerToFillContainer(latestPreview, "Alta episodio más reciente");
    expect(await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("presents a dominant lead preview above three equal home-style media cards on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });

    const media = page.getByRole("region", { name: "Medios del programa" });
    const lead = media.getByRole("region", { name: "Último episodio" });
    const cards = media.getByRole("region", { name: /^(Más visto|Episodios|Instagram)$/ });

    await expect(media).toBeVisible();
    await expect(lead.getByRole("button", { name: /Reproducir Alta episodio más reciente/i })).toBeVisible();
    await expect(cards).toHaveCount(3);
    await settleRevealedCards(cards);

    const [leadBox, outerFrame, previewBox, firstCard, secondCard, thirdCard] = await Promise.all([
      lead.boundingBox(),
      lead.locator(".program-latest").boundingBox(),
      lead.locator(".program-latest-preview").boundingBox(),
      cards.nth(0).boundingBox(),
      cards.nth(1).boundingBox(),
      cards.nth(2).boundingBox()
    ]);

    expect(leadBox).not.toBeNull();
    expect(outerFrame).not.toBeNull();
    expect(previewBox).not.toBeNull();
    expect(firstCard).not.toBeNull();
    expect(secondCard).not.toBeNull();
    expect(thirdCard).not.toBeNull();

    expect(previewBox!.width / previewBox!.height).toBeCloseTo(16 / 9, 1);
    expect(outerFrame!.height).toBeLessThanOrEqual(495.1);
    expect(Math.abs(outerFrame!.x - firstCard!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(outerFrame!.x + outerFrame!.width - (thirdCard!.x + thirdCard!.width))).toBeLessThanOrEqual(2);
    expect(leadBox!.width).toBeGreaterThan(firstCard!.width * 1.8);
    expect(Math.abs(leadBox!.width - await media.evaluate((element) => element.getBoundingClientRect().width))).toBeLessThanOrEqual(2);
    expect(Math.abs(firstCard!.y - secondCard!.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(secondCard!.y - thirdCard!.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(firstCard!.height - secondCard!.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(secondCard!.height - thirdCard!.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(firstCard!.width - secondCard!.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(secondCard!.width - thirdCard!.width)).toBeLessThanOrEqual(2);
    await page.screenshot({ path: "test-results/program-latest-aligned-desktop.png" });
    expect(firstCard!.x).toBeLessThan(secondCard!.x);
    expect(secondCard!.x).toBeLessThan(thirdCard!.x);
  });

  test("stacks the home-style media cards without overflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const media = page.getByRole("region", { name: "Medios del programa" });
    const lead = media.getByRole("region", { name: "Último episodio" });
    const cards = media.getByRole("region", { name: /^(Más visto|Episodios|Instagram)$/ });

    await expect(lead).toBeVisible();
    await expect(cards).toHaveCount(3);
    await settleRevealedCards(cards);

    const [leadBox, previewBox, firstCard, secondCard, thirdCard] = await Promise.all([
      lead.boundingBox(),
      lead.locator(".program-latest-preview").boundingBox(),
      cards.nth(0).boundingBox(),
      cards.nth(1).boundingBox(),
      cards.nth(2).boundingBox()
    ]);

    expect(leadBox).not.toBeNull();
    expect(previewBox).not.toBeNull();
    expect(firstCard).not.toBeNull();
    expect(secondCard).not.toBeNull();
    expect(thirdCard).not.toBeNull();

    expect(previewBox!.width / previewBox!.height).toBeCloseTo(16 / 9, 1);
    expect(Math.abs(firstCard!.x - secondCard!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(secondCard!.x - thirdCard!.x)).toBeLessThanOrEqual(2);
    expect(firstCard!.y).toBeLessThan(secondCard!.y);
    expect(secondCard!.y).toBeLessThan(thirdCard!.y);
    expect(await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
