import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:4321/cowork-cookbook/',
    viewport: { width: 1500, height: 1000 },
    screenshot: 'only-on-failure',
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
  workers: 2,
  reporter: 'list',
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321/cowork-cookbook/en/',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
