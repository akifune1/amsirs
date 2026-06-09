import { test, expect } from '@playwright/test';

/**
 * Sidebar & Navigation Tests
 * Uses Super Admin storageState (configured in playwright.config.ts).
 * Tests role-based visibility are done by checking the links rendered.
 */
test.describe('Sidebar & Navigation', () => {

  // ==========================================
  // SIDEBAR VISIBILITY RULES
  // ==========================================

  test('sidebar is hidden on login page', async ({ page }) => {
    // Navigate to root (login page) — sidebar should not render
    await page.goto('/');
    // The sidebar checks pathname and returns null for '/'
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeHidden();
  });

  test('sidebar is hidden on register page', async ({ page }) => {
    await page.goto('/register');
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeHidden();
  });

  // ==========================================
  // SIDEBAR RENDERING (SUPER ADMIN)
  // ==========================================

  test('sidebar renders on admin-dashboard', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('sidebar shows AMSIRS branding', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    // "A" logo in maroon
    await expect(page.locator('aside .bg-cavite-maroon').first()).toBeVisible();
    // "AMSIRS" text
    await expect(page.locator('aside >> text=AMSIRS')).toBeVisible();
  });

  test('Super Admin sees all expected navigation links', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    const navLinks = page.locator('aside nav a');

    // Super Admin should see 7 links:
    // Dashboard, Access Gate, Exit Gate, Access Logs, Incidents, Student Support, Campus Status
    const expectedLinks = [
      'Dashboard',
      'Access Gate',
      'Exit Gate',
      'Access Logs',
      'Incidents',
      'Student Support',
      'Campus Status',
    ];

    for (const linkText of expectedLinks) {
      await expect(navLinks.filter({ hasText: linkText })).toBeVisible();
    }
  });

  test('active page link is visually highlighted', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    // The Dashboard link should have active styling (bg-cavite-light)
    const dashboardLink = page.locator('aside nav a[href="/admin-dashboard"]');
    await expect(dashboardLink).toHaveClass(/bg-cavite-light/);
  });

  test('user info section shows email and role', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    const userBlock = page.locator('aside .bg-zinc-50');
    await expect(userBlock).toBeVisible();
    // Should show the super admin email
    await expect(userBlock).toContainText('super.admin@cnhs.com');
  });

  test('sign out button is visible', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    const signOutButton = page.locator('aside form button');
    await expect(signOutButton).toBeVisible();
  });

  // ==========================================
  // NAVIGATION WORKS
  // ==========================================

  test('clicking Incidents link navigates to /incident-dashboard', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    await page.locator('aside nav a[href="/incident-dashboard"]').click();
    await expect(page).toHaveURL(/\/incident-dashboard/);
  });

  test('clicking Access Logs link navigates to /access-logs', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    await page.locator('aside nav a[href="/access-logs"]').click();
    await expect(page).toHaveURL(/\/access-logs/);
  });

  test('clicking Campus Status link navigates to /campus-status', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    await page.locator('aside nav a[href="/campus-status"]').click();
    await expect(page).toHaveURL(/\/campus-status/);
  });

  test('clicking Student Support link navigates to /student-support', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    await page.locator('aside nav a[href="/student-support"]').click();
    await expect(page).toHaveURL(/\/student-support/);
  });
});
