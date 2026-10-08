import { expect, test } from "@playwright/test";

const message = "Hola, quiero conocer las opciones para ser sponsor de ACROX TV";
const programs = ["/alta-data-te-tire", "/mas-que-nutricion"] as const;

type VisibilitySample = {
  left: number;
  right: number;
  width: number;
  viewportLeft: number;
  viewportRight: number;
  leftDelta: number;
  rightDelta: number;
  scrollLeft: number;
  transform: string;
  matrix: string;
  activeElement: string | undefined;
  outlineStyle: string;
  outlineWidth: string;
};

async function expectFocusedItemVisible(locator: import("@playwright/test").Locator, page: import("@playwright/test").Page, path: string, width: number, item: string) {
  let previous: VisibilitySample | null = null;
  let current: VisibilitySample | null = null;
  let pollAttempt = 0;
  try {
    await expect.poll(async () => {
      pollAttempt += 1;
      const sample = await locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const viewport = element.closest(".sponsor-ribbon-viewport")!.getBoundingClientRect();
        const motion = element.closest(".sponsor-ribbon-motion")!;
        const transform = getComputedStyle(motion).transform;
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          viewportLeft: viewport.left,
          viewportRight: viewport.right,
          leftDelta: rect.left - viewport.left,
          rightDelta: viewport.right - rect.right,
          scrollLeft: element.closest(".sponsor-ribbon-viewport")!.scrollLeft,
          transform,
          matrix: new DOMMatrixReadOnly(transform).toString(),
          activeElement: document.activeElement?.outerHTML.slice(0, 240),
          outlineStyle: getComputedStyle(element).outlineStyle,
          outlineWidth: getComputedStyle(element).outlineWidth,
        };
      });
      previous = current;
      current = sample;
      // Allow only subpixel layout/transform rounding; this does not mask visible clipping.
      return (sample.leftDelta >= -0.1 && sample.rightDelta >= -0.1 && sample.outlineStyle !== "none");
    }).toBe(true);
  } catch (error) {
    console.log(JSON.stringify({ visibilityPollFailure: true, path, width, item, pollAttempt, sampleBefore: previous, sampleAtFailure: current, url: page.url() }));
    throw error;
  }
}

test("program ribbons offer a full-width, directly actionable sponsor invitation", async ({ page }) => {
  await page.route("https://**", async (route) => route.fulfill({ status: 204, body: "" }));
  await page.route("**/api/acroxtv-feed/**", async (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ episodes: { state: "unavailable" }, instagram: { state: "unavailable" }, live: { state: "unavailable" } }) }));
  await page.route("**/api/acroxtv-feed", async (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ liveItem: null, latestEpisode: null, topEpisode: null, episodes: [], instagram: [], youtubeError: false, instagramError: true }) }));

  for (const width of [375, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of programs) {
      await page.addInitScript(() => {
        localStorage.setItem("acrox-ga-consent", "rejected");
        document.addEventListener("click", (event) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>(".sponsor-ribbon-invitation");
        if (link) { sessionStorage.setItem("invitation-click", link.href); event.preventDefault(); }
        }, true);
      });
      await page.goto(path);
      const ribbon = page.getByRole("region", { name: "Nos acompañan" });
      await expect(ribbon).toBeVisible();
      const track = ribbon.locator(".sponsor-ribbon-track").first();
      const invitation = track.getByRole("link", { name: /Próximamente.*Tu marca acá.*Ser sponsor de ACROX TV/ });
      await expect(invitation).toHaveCount(1);
      const configuredNumber = await page.evaluate(() => document.querySelector<HTMLAnchorElement>(".sponsor-ribbon-invitation")?.href);
      expect(configuredNumber).toMatch(new RegExp(`wa\\.me/\\d+\\?text=${encodeURIComponent(message)}`));
      await expect(invitation).toHaveAttribute("target", "_blank");
      await expect(invitation).toHaveAttribute("rel", "noopener noreferrer");
      expect(await ribbon.locator(".sponsor-ribbon-track[aria-hidden='true'] a").evaluateAll((links) => links.every((link) => (link as HTMLAnchorElement).tabIndex === -1))).toBe(true);
      const geometry = await track.evaluate((element) => ({ track: element.getBoundingClientRect().width, viewport: element.closest(".sponsor-ribbon-viewport")!.getBoundingClientRect().width, overflow: document.documentElement.scrollWidth > innerWidth }));
      expect(geometry.track).toBeGreaterThanOrEqual(geometry.viewport);
      expect(geometry.overflow).toBe(false);
      const styleOf = (cell: import("@playwright/test").Locator) => cell.evaluate((node) => {
        const style = getComputedStyle(node);
        const viewport = getComputedStyle(node.closest(".sponsor-ribbon-viewport")!);
        return { background: style.backgroundColor, border: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth], shadow: style.boxShadow, mask: viewport.maskImage };
      });
      const viewport = ribbon.locator(".sponsor-ribbon-viewport");
      const pseudoPaint = await viewport.evaluate((node) => [getComputedStyle(node, "::before").backgroundImage, getComputedStyle(node, "::after").backgroundImage]);
      expect(pseudoPaint).toEqual(["none", "none"]);
      for (const invitationCard of await ribbon.locator(".sponsor-ribbon-invitation-cell").all()) {
        const invitationStyle = await styleOf(invitationCard);
        expect(invitationStyle.background).toBe("rgba(0, 0, 0, 0)");
        expect(invitationStyle.border).toEqual(["0px", "0px", "0px", "0px"]);
        expect(invitationStyle.shadow).toBe("none");
        expect(invitationStyle.mask).toContain("linear-gradient");
      }
      if (path === programs[0]) {
        await expect(track.locator("li")).toHaveCount(6);
        await expect(track.locator("a[target='_blank'][rel='noopener noreferrer']")).toHaveCount(6);
      } else {
        await expect(track.locator("li")).toHaveCount(7);
        await expect(track.locator(".sponsor-ribbon-invitation")).toHaveCount(7);
        await expect(track.getByRole("link", { name: /Próximamente.*Tu marca acá.*Ser sponsor de ACROX TV/ })).toHaveCount(1);
      }
      const visibleInvitation = ribbon.locator(".sponsor-ribbon-track:not([aria-hidden]) .sponsor-ribbon-invitation").first();
      await ribbon.hover();
      await visibleInvitation.click();
      expect(await page.evaluate(() => sessionStorage.getItem("invitation-click"))).toMatch(new RegExp(`wa\\.me/\\d+\\?text=${encodeURIComponent(message)}`));
      if (path === programs[1]) {
        const visualCopies = ribbon.locator(".sponsor-ribbon-invitation");
        const finalCopy = visualCopies.last();
        await finalCopy.click();
        expect(await page.evaluate(() => sessionStorage.getItem("invitation-click"))).toContain("wa.me/");
      }
      if (path === programs[0]) await track.locator("a").nth(4).focus();
      else await ribbon.focus();
      await page.keyboard.press("Tab");
      await expect(visibleInvitation).toBeFocused();
      await expectFocusedItemVisible(visibleInvitation, page, path, width, "invitation-after-tab");
    }
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(programs[0]);
  const ribbon = page.getByRole("region", { name: "Nos acompañan" });
  const canonicalTrack = ribbon.locator(".sponsor-ribbon-track:not([aria-hidden])");
  await expect.poll(() => ribbon.locator(".sponsor-ribbon-motion").evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41)).toBeLessThan(-100);
  const finalSponsor = canonicalTrack.locator("a").nth(4);
  await finalSponsor.focus();
  await page.keyboard.press("Tab");
  const lastInvitation = canonicalTrack.locator(".sponsor-ribbon-invitation");
  await expect(lastInvitation).toBeFocused();
  await expectFocusedItemVisible(lastInvitation, page, programs[0], 375, "late-phase-invitation-after-tab");
  await page.keyboard.press("Shift+Tab");
  await expect(finalSponsor).toBeFocused();
  await expect.poll(() => finalSponsor.evaluate((element) => { const r = element.getBoundingClientRect(); const v = element.closest(".sponsor-ribbon-viewport")!.getBoundingClientRect(); return r.left >= v.left && r.right <= v.right; })).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => ribbon.locator(".sponsor-ribbon-motion").evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("hides repeated invitation cells from accessibility while preserving canonical sponsor items", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
  await page.route("https://**", async (route) => route.fulfill({ status: 204, body: "" }));
  await page.route("**/api/acroxtv-feed/**", async (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ episodes: { state: "unavailable" }, instagram: { state: "unavailable" }, live: { state: "unavailable" } }) }));
  await page.route("**/api/acroxtv-feed", async (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ liveItem: null, latestEpisode: null, topEpisode: null, episodes: [], instagram: [], youtubeError: false, instagramError: true }) }));

  for (const [path, expectedItems, expectedVisualCells] of [[programs[0], 6, 6], [programs[1], 1, 7]] as const) {
    await page.goto(path);
    const ribbon = page.getByRole("region", { name: "Nos acompañan" });
    const canonicalTrack = ribbon.locator(".sponsor-ribbon-track:not([aria-hidden])");
    await expect(canonicalTrack.getByRole("listitem")).toHaveCount(expectedItems);
    await expect(canonicalTrack.locator("li")).toHaveCount(expectedVisualCells);
    if (path === programs[1]) await expect(canonicalTrack.getByRole("link", { name: /Próximamente.*Tu marca acá.*Ser sponsor de ACROX TV/ })).toHaveCount(1);
  }
});

test("every repeated Nutrition invitation card activates its WhatsApp link", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("acrox-ga-consent", "rejected");
    document.addEventListener("click", (event) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>(".sponsor-ribbon-invitation");
      if (link) { sessionStorage.setItem("invitation-click", link.href); event.preventDefault(); }
    }, true);
  });
  await page.route("https://**", async (route) => route.fulfill({ status: 204, body: "" }));
  await page.route("**/api/acroxtv-feed/**", async (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ episodes: { state: "unavailable" }, instagram: { state: "unavailable" }, live: { state: "unavailable" } }) }));
  await page.route("**/api/acroxtv-feed", async (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ liveItem: null, latestEpisode: null, topEpisode: null, episodes: [], instagram: [], youtubeError: false, instagramError: true }) }));
  await page.goto(programs[1]);
  const copies = page.locator(".sponsor-ribbon-invitation");
  await expect(copies).toHaveCount(14);
  for (const copy of await copies.all()) {
    await copy.click();
    expect(await page.evaluate(() => sessionStorage.getItem("invitation-click"))).toMatch(new RegExp(`wa\\.me/\\d+\\?text=${encodeURIComponent(message)}`));
  }
});
