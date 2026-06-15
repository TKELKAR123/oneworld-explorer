import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 30_000,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["list"]]
    : "list",
  use: {
    baseURL: "http://127.0.0.1:3458",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start -w @oneworld-explorer/web -- -p 3458",
    url: "http://127.0.0.1:3458",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
