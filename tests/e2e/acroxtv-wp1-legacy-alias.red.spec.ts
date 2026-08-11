import { expect, test } from "@playwright/test";

test("WP-1 RED: legacy Alta Data alias must visibly diverge from the canonical route", async ({ page }) => {
  const canonical = await page.goto("/alta-data-te-tire");
  expect(canonical?.status()).toBe(200);

  const legacy = await page.goto("/alta-data");
  // Intentionally RED: the approved baseline must retain this failed expectation as divergence evidence.
  expect(legacy?.status()).toBe(308);
  await expect(page).toHaveURL(/\/alta-data-te-tire$/);
});
