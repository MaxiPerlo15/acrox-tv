import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "acroxtv-wp1-capture-contract.spec.ts",
  forbidOnly: true,
  timeout: 180_000,
  workers: 1,
  reporter: "list",
  projects: [
    {
      name: "wp1-capture-contract",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
