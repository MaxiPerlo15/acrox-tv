import { expect, test } from "@playwright/test";

test.describe("program-scoped Acrox TV feed HTTP contract", () => {
  test("rejects unknown slugs without reaching a provider", async ({ page }) => {
    const unknownResponse = page.waitForResponse("**/api/acroxtv-feed/not-a-program");

    await page.goto("/api/acroxtv-feed/not-a-program", { waitUntil: "commit" });
    const unknown = await unknownResponse;

    expect(unknown.status()).toBe(404);
    expect(unknown.headers()["cache-control"]).toBe("private, no-store, max-age=0");
    expect(await unknown.text()).toBe("");
  });
});
