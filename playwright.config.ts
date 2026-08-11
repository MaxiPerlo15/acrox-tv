import { defineConfig, devices } from "@playwright/test";

const port = process.env.E2E_PORT ?? "3015";
const baseURL = `http://127.0.0.1:${port}`;
const publicEnvironment = {
  NEXT_PUBLIC_WHATSAPP_NUMBER: "5491100000000",
  NEXT_PUBLIC_CONTACT_EMAIL: "contact@example.com",
  NEXT_PUBLIC_INSTAGRAM_URL: "https://instagram.com/example",
  NEXT_PUBLIC_TIKTOK_URL: "https://tiktok.com/@example",
  NEXT_PUBLIC_YOUTUBE_URL: "https://youtube.com/@example"
};

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["critical.spec.ts", "smoke.spec.ts", "acroxtv-*.spec.ts"],
  // WP-1 evidence owns its execution; keep the normal green suite free of self-managed builds and intentional RED proof.
  testIgnore: [
    "acroxtv-wp1-capture-contract.spec.ts",
    "acroxtv-wp1-legacy-alias.red.spec.ts"
  ],
  forbidOnly: true,
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${port}`,
    env: {
      ...process.env,
      ...publicEnvironment,
      NODE_ENV: "production"
    },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@mobile/
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      grepInvert: /@mobile/
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      grepInvert: /@mobile/
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 12"] },
      grep: /@mobile/
    }
  ]
});
