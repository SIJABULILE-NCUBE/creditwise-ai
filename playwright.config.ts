import { defineConfig, devices } from '@playwright/test';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: CI provides the variables.
}

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    viewport: { width: 390, height: 844 },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        {
          command: 'npm run dev:api',
          port: 3001,
          reuseExistingServer: !process.env.CI,
        },
        {
          command: 'npm run dev',
          port: 5173,
          reuseExistingServer: !process.env.CI,
        },
      ],
});
