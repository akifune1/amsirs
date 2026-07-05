import { defineConfig, devices } from '@playwright/test';

/**
 * AMSIRS E2E Test Configuration
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Global setup: pre-authenticates all test accounts */
  globalSetup: './tests/global-setup.ts',

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshot only when a test fails */
    screenshot: 'only-on-failure',

    /* Default timeout for actions like click, fill */
    actionTimeout: 15_000,
  },

  /* Global test timeout */
  timeout: 60_000,

  /* Configure projects for different authenticated roles */
  projects: [
    // --- Thesis Screenshots (Custom script) ---
    {
      name: 'screenshots',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        'thesis-screenshots.spec.ts',
      ],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
