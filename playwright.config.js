// Tests automatiques SetMate : Chrome (ordinateur) et le moteur de Safari (WebKit, format iPhone).
// WebKit n'a pas l'accès aux dossiers de Chrome : c'est exactement le cas des erreurs E-009 et E-013.
const { defineConfig, devices } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.js/,
  timeout: 90000,
  expect: { timeout: 8000 },
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:4173", serviceWorkers: "block", trace: "retain-on-failure" },
  webServer: { command: "node tests/serveur.js 4173", url: "http://127.0.0.1:4173/index.html", reuseExistingServer: true, timeout: 20000 },
  projects: [
    { name: "chrome", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "iphone-safari", use: { ...devices["iPhone 13"] } }
  ]
});
