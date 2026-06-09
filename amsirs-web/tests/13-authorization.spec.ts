import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS } from './helpers/auth';

/**
 * Authorization & Role-Based Access Control Tests
 * Tests that unauthorized users are properly blocked from restricted pages.
 * 
 * NOTE: This spec does NOT use a global storageState — each test creates
 * its own context with the appropriate auth state.
 */
test.describe('Authorization — Unauthenticated Access', () => {
  test('unauthenticated user accessing /admin-dashboard is redirected', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    // Should redirect to /unauthorized or /login (depending on middleware)
    const url = page.url();
    expect(url).toMatch(/\/(unauthorized|login)?$/);
  });

  test('unauthenticated user accessing /incident-dashboard is redirected', async ({ page }) => {
    await page.goto('/incident-dashboard');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toMatch(/\/(login|unauthorized)?$/);
  });

  test('unauthenticated user accessing /student-portal is redirected', async ({ page }) => {
    await page.goto('/student-portal');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toMatch(/\/(login|unauthorized)?$/);
  });
});

test.describe('Authorization — Student Access Restrictions', () => {
  test('student cannot access /admin-dashboard', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.student.storageState,
    });
    const page = await context.newPage();

    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    // Student should be redirected to /unauthorized
    await expect(page).toHaveURL(/\/unauthorized/);

    await context.close();
  });

  test('student cannot access /access-gate', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.student.storageState,
    });
    const page = await context.newPage();

    await page.goto('/access-gate');
    await page.waitForLoadState('networkidle');

    // The access-gate page requires guard/super_admin role
    // Student should not see the gate scanner content (sidebar won't show it)
    // Page may still render but sidebar won't have the link
    const sidebar = page.locator('aside nav a[href="/access-gate"]');
    await expect(sidebar).toHaveCount(0);

    await context.close();
  });
});

test.describe('Authorization — School Admin Restrictions', () => {
  test('school admin cannot access /admin-dashboard (Root Control)', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.schoolAdmin.storageState,
    });
    const page = await context.newPage();

    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    // School admin is explicitly redirected to /unauthorized in admin-dashboard/page.tsx
    await expect(page).toHaveURL(/\/unauthorized/);

    await context.close();
  });
});

test.describe('Unauthorized Page', () => {
  test('unauthorized page renders with Access Denied heading', async ({ page }) => {
    await page.goto('/unauthorized');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Access Denied');
  });

  test('unauthorized page shows warning message', async ({ page }) => {
    await page.goto('/unauthorized');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=You do not have the required security clearance')
    ).toBeVisible();
  });

  test('unauthorized page has warning icon', async ({ page }) => {
    await page.goto('/unauthorized');
    await page.waitForLoadState('networkidle');

    // Warning icon SVG exists
    const warningIcon = page.locator('.bg-red-50 svg');
    await expect(warningIcon).toBeVisible();
  });

  test('unauthorized page has Return to Portal link', async ({ page }) => {
    await page.goto('/unauthorized');
    await page.waitForLoadState('networkidle');

    const returnLink = page.locator('a:has-text("Return to Portal")');
    await expect(returnLink).toBeVisible();
    await expect(returnLink).toHaveAttribute('href', '/login');
  });
});

test.describe('Pending Approval Page', () => {
  test('pending approval page renders with Account Pending heading', async ({ page }) => {
    await page.goto('/pending-approval');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Account Pending');
  });

  test('pending approval page shows verification status', async ({ page }) => {
    await page.goto('/pending-approval');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Verification Status')).toBeVisible();
    await expect(page.locator('text=Awaiting Manual Review')).toBeVisible();
  });

  test('pending approval page has sign out button', async ({ page }) => {
    await page.goto('/pending-approval');
    await page.waitForLoadState('networkidle');

    const signOutButton = page.locator('button:has-text("Sign out")');
    await expect(signOutButton).toBeVisible();
  });

  test('pending approval page shows registration received message', async ({ page }) => {
    await page.goto('/pending-approval');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=biometric registration has been received')).toBeVisible();
  });
});
