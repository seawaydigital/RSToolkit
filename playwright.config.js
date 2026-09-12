import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir: './tests/browser', fullyParallel: true, workers: 3, retries: 0,
 reporter: [['list'], ['html', { open: 'never' }]], timeout: 45000,
 use: { baseURL: 'http://127.0.0.1:4187', trace: 'retain-on-failure' },
 projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
 ],
 webServer: { command: 'node scripts/serve-candidate.js', url: 'http://127.0.0.1:4187', reuseExistingServer: !process.env.CI },
});
