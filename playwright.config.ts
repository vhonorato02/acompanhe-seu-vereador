import { defineConfig, devices } from "@playwright/test";

/*
 * E2E against a built app. Locally and in CI it starts `next start` on the build made with
 * the labelled development sample; set E2E_URL to run the same journeys against a deployment.
 */
const alvo = process.env.E2E_URL;

export default defineConfig({
  testDir: "e2e",
  outputDir: "e2e-artifacts/resultados",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "e2e-artifacts/relatorio", open: "never" }]],
  use: {
    baseURL: alvo ?? "http://localhost:3100",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "android-412", use: { ...devices["Pixel 7"] } },
    { name: "samsung-360", use: { ...devices["Galaxy S9+"], viewport: { width: 360, height: 760 } } },
    { name: "desktop-firefox", use: { ...devices["Desktop Firefox"] }, grep: /@cross/ },
    { name: "iphone-webkit", use: { ...devices["iPhone 15"] }, grep: /@cross/ },
  ],
  webServer: alvo
    ? undefined
    : { command: "npx next start -p 3100", url: "http://localhost:3100", reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
