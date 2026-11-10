import { defineConfig, devices } from "@playwright/test";
import fs from "fs";

const localChromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const useLocalChrome = !process.env.CI && fs.existsSync(localChromePath);
const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 45000,
  use: {
    baseURL: baseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(useLocalChrome ? { channel: "chrome" } : {}),
      },
    },
  ],
  ...(process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          url: baseUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120000,
        },
      }),
});
