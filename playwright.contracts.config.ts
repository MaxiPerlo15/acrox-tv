import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: ["tests/e2e/acroxtv-contracts.spec.ts", "tests/contracts/**/*.test.ts"],
  forbidOnly: true,
  projects: [{ name: "contracts" }]
});
