import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000/';
const outputDirectory = fileURLToPath(new URL('.', import.meta.url));
const targetSelector = '#acroxtv.program-directory';
const captures = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
];

const browser = await chromium.launch({ headless: false });

try {
  console.log(`browser=${browser.version()}`);

  for (const capture of captures) {
    const context = await browser.newContext({
      viewport: { width: capture.width, height: capture.height },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
    });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const target = page.locator(targetSelector);
    await target.scrollIntoViewIfNeeded();
    await target.screenshot({
      path: `${outputDirectory}po-follow-up-${capture.name}.png`,
      animations: 'disabled',
    });
    const { backgroundColor, backgroundImage, borderTopWidth } =
      await target.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          borderTopWidth: style.borderTopWidth,
        };
      });
    const box = await target.boundingBox();

    console.log(
      `${capture.name}: viewport=${capture.width}x${capture.height}, target=${box?.width}x${box?.height}, selector=${targetSelector}, background=${backgroundColor}, image=${backgroundImage}, borderTop=${borderTopWidth}`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
