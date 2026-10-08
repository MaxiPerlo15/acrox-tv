import { expect, test } from "@playwright/test";

const programs = [
  { path: "/alta-data-te-tire", title: "Alta Data ¡Te Tire!", schedule: "Jueves · 20:00", instagram: "https://www.instagram.com/altadata.tetire/" },
  { path: "/mas-que-nutricion", title: "Más que Nutrición", schedule: "Miércoles · 19:30", instagram: "https://www.instagram.com/masquenutricion.lv/" }
];

test.describe("program hero reference adaptation", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://**", async (route) => route.fulfill({ status: 204, body: "" }));
    await page.route("**/api/acroxtv-feed/**", async (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ episodes: { state: "unavailable" }, instagram: { state: "unavailable" }, live: { state: "unavailable" } }) }));
    await page.route("**/api/acroxtv-feed", async (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ liveItem: null, latestEpisode: null, topEpisode: null, episodes: [], instagram: [], youtubeError: false, instagramError: true }) }));
  });

  test("uses visible artwork pixels as desktop anchors and keeps mobile identity before the description", async ({ page }) => {
    for (const program of programs) {
      for (const viewport of [{ width: 1440, height: 960 }, { width: 375, height: 812 }, { width: 320, height: 812 }]) {
        await page.setViewportSize(viewport);
        await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
        await page.goto(program.path);
        await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.querySelectorAll(".program-hero img"), (image) => (image as HTMLImageElement).decode().catch(() => undefined))); });
        const hero = page.locator(".program-hero");
        const heading = hero.getByRole("heading", { level: 1, name: program.title });
        const metrics = await hero.evaluate((element) => {
          const pixelBounds = (image: HTMLImageElement) => {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext("2d")!;
            context.drawImage(image, 0, 0);
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
            let top = canvas.height, bottom = -1;
            for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
              if (pixels[(y * canvas.width + x) * 4 + 3] > 8) { top = Math.min(top, y); bottom = Math.max(bottom, y); }
            }
            const rect = image.getBoundingClientRect();
            const style = getComputedStyle(image);
            const sourceRatio = canvas.width / canvas.height;
            const boxRatio = rect.width / rect.height;
            const contentHeight = style.objectFit === "contain" && sourceRatio > boxRatio ? rect.width / sourceRatio : rect.height;
            const contentTop = rect.top + (rect.height - contentHeight) / 2;
            const visibleTop = contentTop + top / canvas.height * contentHeight;
            const visibleBottom = contentTop + (bottom + 1) / canvas.height * contentHeight;
            return { top: visibleTop, bottom: visibleBottom, height: visibleBottom - visibleTop };
          };
          const kicker = element.querySelector(".program-hero-kicker")!.getBoundingClientRect();
          const cta = element.querySelector(".program-hero-copy nav")!.getBoundingClientRect();
          const cover = pixelBounds(element.querySelector(".program-hero-cover") as HTMLImageElement);
          const host = pixelBounds(element.querySelector(".program-host-name") as HTMLImageElement);
          const title = element.querySelector("h1")!;
          const headingStyle = getComputedStyle(title);
          const artRect = element.querySelector(".program-hero-identity")!.getBoundingClientRect();
          const hostRect = element.querySelector(".program-host-name")!.getBoundingClientRect();
          const coverRect = element.querySelector(".program-hero-cover")!.getBoundingClientRect();
          return { coverTop: cover.top, coverHeight: cover.height, hostBottom: host.bottom, hostHeight: host.height, kickerTop: kicker.top, ctaBottom: cta.bottom, artBottom: artRect.bottom, hostRectBottom: hostRect.bottom, coverRectBottom: coverRect.bottom, headingDisplay: headingStyle.display, headingClip: headingStyle.clip, headingPosition: headingStyle.position, summaryTop: element.querySelector(".program-hero-summary")!.getBoundingClientRect().top, coverTopBox: element.querySelector(".program-hero-cover")!.getBoundingClientRect().top, scrollWidth: document.body.scrollWidth, viewportWidth: innerWidth, titleColor: headingStyle.color };
        });
        if (viewport.width > 700) {
          const baseline = program.path.includes("alta") ? { coverHeight: 417.06, hostHeight: 53 } : { coverHeight: 373.28, hostHeight: 96.78 };
          expect(metrics.coverTop - metrics.kickerTop, `${program.path} visible cover below kicker`).toBeGreaterThanOrEqual(20);
          expect(Math.abs(metrics.coverHeight - baseline.coverHeight) / baseline.coverHeight).toBeLessThanOrEqual(.05);
          expect(Math.abs(metrics.hostHeight - baseline.hostHeight) / baseline.hostHeight).toBeLessThanOrEqual(.05);
          expect(metrics.titleColor).toBe("rgb(245, 247, 255)");
        } else {
          await expect(heading).toBeAttached();
          expect(metrics.headingDisplay).not.toBe("none");
          expect(metrics.headingClip).toBe("rect(0px, 0px, 0px, 0px)");
          expect(metrics.headingPosition).toBe("absolute");
          expect(metrics.coverTopBox).toBeLessThan(metrics.summaryTop);
          expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);
          const order = await hero.evaluate((element) => Array.from(element.children).map((child) => (child as HTMLElement).classList.contains("program-hero-identity") ? "artwork" : (child as HTMLElement).classList.contains("program-hero-copy") ? "copy" : "kicker"));
          expect(order).toEqual(["kicker", "artwork", "copy"]);
        }
        await expect(hero.getByRole("link", { name: "Ver último programa" })).toHaveAttribute("href", "#ultimo-programa");
        if (viewport.width === 1440 || viewport.width === 375) {
          await page.emulateMedia({ reducedMotion: "reduce" });
          await page.screenshot({ path: `/tmp/program-surface-spacing/hero-reference-${program.path.slice(1)}-${viewport.width}.png`, fullPage: true });
        }
      }
    }
  });
  test("does not render the future-collaborations placeholder on either program", async ({ page }) => {
    for (const program of programs) {
      await page.goto(program.path);
      await expect(page.getByText("Estamos preparando este espacio para futuras colaboraciones.", { exact: true })).toHaveCount(0);
    }
  });
  test("loads transparent hero cutouts and separate host-name artwork with actual 19:30 metadata", async ({ page }) => {
    for (const viewport of [
      { name: "desktop", width: 1440, height: 960 },
      { name: "mobile", width: 375, height: 812 }
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
      await page.goto("/mas-que-nutricion");
      const cover = page.locator(".program-hero-cover");
      await expect(cover).toBeVisible();
      await expect(page.locator(".program-schedule")).toHaveText("Miércoles · 19:30");
      if (viewport.name === "mobile") await cover.scrollIntoViewIfNeeded();
      await expect(cover).toHaveAttribute("src", /caratula-masquenutricion-trimmed\.webp/);
      await expect(cover).toHaveAttribute("alt", "");
      const intrinsic = await cover.evaluate((image) => {
        const source = image as HTMLImageElement;
        const style = getComputedStyle(image);
        return { naturalWidth: source.naturalWidth, naturalHeight: source.naturalHeight, objectFit: style.objectFit, mask: style.maskImage };
      });
      expect(intrinsic.naturalWidth).toBe(1040);
      expect(intrinsic.naturalHeight).toBe(1346);
      expect(intrinsic.objectFit).toBe("contain");
      expect(intrinsic.mask).toBe("none");
      const hostName = page.locator(".program-host-name");
      await expect(hostName).toHaveAttribute("src", /nombre-conductora-masnutri-trimmed\.webp/);
      await expect(hostName).toHaveAttribute("alt", /conductora/i);
      expect(await hostName.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(2088);
      if (viewport.name === "desktop") { await page.emulateMedia({ reducedMotion: "reduce" }); await page.screenshot({ path: "/tmp/program-surface-spacing/hero-reference-nutrition-1440.png", fullPage: true }); }
    }
  });
  test("renders the Nutrition logo in the home program card with descriptive alternative text", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/");
    const card = page.locator('[data-program-cover]').filter({ hasText: "Más que Nutrición" });
    const logo = card.locator("img");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", /mas-que-nutricion\.webp/);
    expect(await logo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(card.locator(".program-directory-card-placeholder")).toHaveCount(0);
    await card.scrollIntoViewIfNeeded();
    await card.screenshot({ path: "/tmp/program-surface-spacing/home-nutrition-logo-1440.png" });
    await expect(logo).toHaveAttribute("alt", /logo.*Más que Nutrición/i);
  });

  test("matches home CTA and program display typography while placing the factual schedule before actions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    for (const program of programs) {
      await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
      await page.goto("/");
      const homeStyles = await page.evaluate(() => {
        const button = getComputedStyle(document.querySelector(".hero-actions .btn.primary")!);
        const title = getComputedStyle(document.querySelector("#inicio h1")!);
        const accent = getComputedStyle(document.querySelector("#inicio .hero-title-accent")!);
        return { button: [button.padding, button.borderRadius, button.backgroundImage, button.fontWeight], title: [title.fontFamily, title.fontSize], accent: accent.backgroundImage };
      });
      if (program === programs[0]) await page.screenshot({ path: "/tmp/program-surface-spacing/program-hero-home-ds-1440.png" });
      await page.goto(program.path);
      if (program.path === "/alta-data-te-tire") {
        await expect(page.locator(".sponsor-ribbon")).toBeVisible();
        await expect(page.locator(".sponsor-ribbon-track:not([aria-hidden]) li")).toHaveCount(5);
      } else {
        await expect(page.locator(".sponsor-ribbon")).toHaveCount(0);
      }
      await expect(page.locator(".program-media-heading")).toBeVisible();
      const hero = page.locator(".program-hero");
      const schedule = hero.locator(".program-schedule");
      const cta = hero.getByRole("link", { name: "Ver último programa" });
      await expect(schedule).toHaveText(program.schedule);
      await expect(schedule).toHaveCSS("text-transform", "uppercase");
      expect(await hero.evaluate((element) => {
        const summary = element.querySelector(".program-hero-summary")!;
        const schedule = element.querySelector(".program-schedule")!;
        return Boolean(summary.compareDocumentPosition(schedule) & Node.DOCUMENT_POSITION_FOLLOWING);
      })).toBe(true);
      await expect(cta).toHaveAttribute("class", "btn primary");
      const [programButtonStyle, programTitleStyle, programAccent, eyebrowColors] = await Promise.all([
        cta.evaluate((element) => { const s = getComputedStyle(element); return [s.padding, s.borderRadius, s.backgroundImage, s.fontWeight]; }),
        hero.locator("h1").evaluate((element) => { const s = getComputedStyle(element); return [s.fontFamily, s.fontSize, s.lineHeight, s.letterSpacing]; }),
        hero.locator("h1 span").last().evaluate((element) => getComputedStyle(element).backgroundImage),
        hero.evaluate((element) => {
          const kicker = getComputedStyle(element.querySelector(".program-hero-kicker")!).color;
          const sponsorHeading = document.querySelector(".sponsor-ribbon h2");
          const sponsor = sponsorHeading ? getComputedStyle(sponsorHeading).color : null;
          const latest = getComputedStyle(document.querySelector(".program-media-heading")!).color;
          return [kicker, sponsor, latest];
        })
      ]);
      expect(programButtonStyle).toEqual(homeStyles.button);
      expect(programTitleStyle[0]).toBe(homeStyles.title[0]);
      expect(parseFloat(programTitleStyle[1])).toBeGreaterThan(parseFloat(homeStyles.title[1]));
      expect(parseFloat(programTitleStyle[2])).toBeCloseTo(parseFloat(programTitleStyle[1]) * 1.04, 1);
      expect(parseFloat(programTitleStyle[3])).toBeCloseTo(-parseFloat(programTitleStyle[1]) * .02, 1);
      expect(programAccent).toBe(homeStyles.accent);
      expect(eyebrowColors[0]).toBe(eyebrowColors[2]);
      if (eyebrowColors[1]) expect(eyebrowColors[0]).toBe(eyebrowColors[1]);
    }
  });
  for (const program of programs) {
    test(`keeps ${program.title} readable and contained at desktop and mobile sizes`, async ({ page }) => {
      for (const viewport of [{ width: 1440, height: 960 }, { width: 375, height: 812 }]) {
        await page.setViewportSize(viewport);
        await page.addInitScript(() => localStorage.setItem("acrox-ga-consent", "rejected"));
        await page.goto(program.path);

        const hero = page.locator(".program-hero");
        const heading = hero.getByRole("heading", { level: 1, name: program.title });
        await expect(heading).toHaveCount(1);
        await expect(heading).toHaveAttribute("aria-label", program.title);
        if (program.path.includes("alta")) await expect(heading.locator("span")).toHaveText(["Alta Data", "¡Te Tire!"]);
        if (program.path.includes("nutricion")) await expect(heading.locator("span")).toHaveText(["Más que", "Nutrición"]);
        const cover = hero.locator("img.program-hero-cover");
        await expect(cover).toBeVisible();
        await expect(hero.getByRole("link", { name: "Ver último programa" })).toHaveAttribute("href", "#ultimo-programa");
        await expect(hero.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", program.instagram);
        await expect(hero.getByText(program.schedule, { exact: true })).toBeVisible();
        await expect(page.locator("#ultimo-programa")).toHaveCount(1);
        await expect(page.locator(".program-media-heading")).toBeVisible();
        const heroStyles = await hero.evaluate((element) => ({
          titleColor: getComputedStyle(element.querySelector("h1")!).color,
          backgroundImage: getComputedStyle(element).backgroundImage,
          coverFit: getComputedStyle(element.querySelector("img")!).objectFit
        }));
        expect(heroStyles.titleColor).toBe("rgb(245, 247, 255)");
        expect(heroStyles.backgroundImage).toBe("none");
        expect(heroStyles.coverFit).toBe("contain");

        const metrics = await page.evaluate(() => {
          const hero = document.querySelector(".program-hero")!;
          const image = hero.querySelector("img.program-hero-cover")!;
          const rect = image.getBoundingClientRect();
          const label = document.querySelector(".program-media-heading")!;
          const kicker = hero.querySelector(".program-hero-kicker")!;
          const labelStyle = getComputedStyle(label);
          const kickerStyle = getComputedStyle(kicker);
          return {
            pageWidth: document.body.scrollWidth,
            viewportWidth: window.innerWidth,
            main: document.querySelector(".program-page-main")!.getBoundingClientRect().toJSON(),
            hero: hero.getBoundingClientRect().toJSON(),
            imageWidth: rect.width,
            imageHeight: rect.height,
            naturalRatio: (image as HTMLImageElement).naturalWidth / (image as HTMLImageElement).naturalHeight,
            renderedRatio: rect.width / rect.height,
            objectFit: getComputedStyle(image).objectFit,
            heroRadius: getComputedStyle(hero).borderRadius,
            coverRadius: getComputedStyle(image).borderRadius,
            coverMask: getComputedStyle(image).maskImage,
            watchCtaBackground: getComputedStyle(hero.querySelector("a")!).backgroundImage,
            heroMinHeight: parseFloat(getComputedStyle(hero).minHeight),
            heroColumns: getComputedStyle(hero).gridTemplateColumns.split(" ").length,
            titleSize: parseFloat(getComputedStyle(hero.querySelector("h1")!).fontSize),
            titleFamily: getComputedStyle(hero.querySelector("h1")!).fontFamily,
            titleLineHeight: getComputedStyle(hero.querySelector("h1")!).lineHeight,
            titleTracking: getComputedStyle(hero.querySelector("h1")!).letterSpacing,
            accent: getComputedStyle(hero).getPropertyValue("--program-accent").trim(),
            labelSize: labelStyle.fontSize,
            kickerSize: kickerStyle.fontSize,
            kickerWeight: kickerStyle.fontWeight,
            labelWeight: labelStyle.fontWeight,
            kickerWeight: kickerStyle.fontWeight,
            labelTracking: labelStyle.letterSpacing,
            kickerTracking: kickerStyle.letterSpacing
          };
        });

        expect(metrics.pageWidth).toBeLessThanOrEqual(metrics.viewportWidth);
        expect(metrics.imageWidth).toBeGreaterThan(240);
        expect(metrics.heroColumns).toBe(viewport.width > 800 ? 2 : 1);
        expect(metrics.heroMinHeight).toBe(0);
        expect(metrics.hero.x).toBe(0);
        expect(metrics.hero.width).toBe(metrics.viewportWidth);
        expect(metrics.main.x).toBe(0);
        expect(metrics.titleFamily).toContain("Exo 2");
        expect(parseFloat(metrics.titleTracking)).toBeCloseTo(-metrics.titleSize * .02, 1);
        expect(metrics.titleSize).toBeGreaterThanOrEqual(32);
        expect(metrics.titleSize).toBeLessThanOrEqual(84);
        expect(metrics.naturalRatio).toBeGreaterThan(.72);
        expect(metrics.naturalRatio).toBeLessThan(.9);
        expect(metrics.objectFit).toBe("contain");
        expect(metrics.heroRadius).toBe("0px");
        expect(parseFloat(metrics.coverRadius)).toBeLessThanOrEqual(4);
        expect(metrics.coverMask).toBe("none");
        expect(metrics.labelSize).toBe(metrics.kickerSize);
        expect(metrics.kickerWeight).toBe("600");
        expect(metrics.labelWeight).toBe(metrics.kickerWeight);
        expect(metrics.labelTracking).toBe(metrics.kickerTracking);
        if (viewport.width === 1440 || viewport.width === 375) { await page.emulateMedia({ reducedMotion: "reduce" }); await page.screenshot({ path: `/tmp/program-surface-spacing/hero-reference-${program.path.slice(1)}-${viewport.width}.png`, fullPage: true }); }
      }
    });
  }
});
