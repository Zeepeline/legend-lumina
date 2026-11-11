// Tes otomatis memakai Playwright. Jalankan: npm test (server lokal dinyalakan otomatis).
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: 'tests',
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }], ['list']] : 'list',
  outputDir: 'test-results',
  use: {
    serviceWorkers: 'block',
    baseURL: 'http://localhost:8000',
    viewport: { width: 390, height: 800 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
    launchOptions: { args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'], executablePath: process.env.CHROME_PATH || undefined },
  },
  webServer: { command: 'python3 -m http.server 8000', url: 'http://localhost:8000/index.html', reuseExistingServer: !process.env.CI, timeout: 30_000 },
});
