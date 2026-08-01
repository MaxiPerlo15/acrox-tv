import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: true,
  projects: [{ name: "contracts" }]
});
