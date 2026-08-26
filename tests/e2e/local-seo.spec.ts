import { expect, test } from "@playwright/test";

test.describe("Local SEO business identity", () => {
  test("publishes the official local business data in JSON-LD and the footer", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("p.footer-contact-line")).toHaveText(
      "Tucuman 32, Las Varillas, Cordoba, Argentina"
    );
    await expect(page.getByRole("link", { name: "+54 9 3533 58-9122" })).toHaveAttribute(
      "href",
      "tel:+5493533589122"
    );

    const localBusiness = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => {
        const graphs = scripts.map((script) => JSON.parse(script.textContent ?? "{}"));
        return graphs
          .flatMap((graph) => graph["@graph"] ?? [])
          .find((node) => node["@type"] === "ProfessionalService");
      });

    expect(localBusiness).toMatchObject({
      name: "Acrox",
      category: "Produccion audiovisual",
      telephone: "+54 9 3533 58-9122",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Tucuman 32",
        addressLocality: "Las Varillas",
        addressRegion: "Cordoba",
        addressCountry: "AR"
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+54 9 3533 58-9122"
      }
    });
  });
});
