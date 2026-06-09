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
    // --- Unauthenticated tests (login, register, auth checks) ---
    {
      name: 'no-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        '01-login.spec.ts',
        '02-register.spec.ts',
      ],
    },

    // --- Super Admin (has access to everything including guard pages) ---
    {
      name: 'super-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/super-admin.json',
      },
      testMatch: [
        '03-sidebar-navigation.spec.ts',
        '04-admin-dashboard-staff.spec.ts',
        '05-admin-dashboard-students.spec.ts',
        '06-incident-reporting.spec.ts',
        '07-incident-dashboard.spec.ts',
        '10-access-logs.spec.ts',
        '11-campus-status.spec.ts',
        '12-gate-pages.spec.ts',
      ],
    },

    // --- Student ---
    {
      name: 'student',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/student.json',
      },
      testMatch: [
        '08-student-portal.spec.ts',
      ],
    },

    // --- Student Support (Guidance Counselor) ---
    {
      name: 'student-support',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/student-support.json',
      },
      testMatch: [
        '09-student-support.spec.ts',
      ],
    },

    // --- Authorization tests (uses multiple auth states internally) ---
    {
      name: 'authorization',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        '13-authorization.spec.ts',
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
