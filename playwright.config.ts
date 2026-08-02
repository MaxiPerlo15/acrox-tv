import { defineConfig, devices } from "@playwright/test";

const port = "3015";
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
