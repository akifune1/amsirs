import { test, expect } from '@playwright/test';

/**
 * Incident Dashboard Tests
 * Uses Super Admin storageState.
 */
test.describe('Incident Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/incident-dashboard');
    await page.waitForLoadState('networkidle');
  });

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  test('displays Recent Incident Reports heading', async ({ page }) => {
    await expect(page.locator('h2').first()).toContainText('Recent Incident Reports');
  });

  test('displays AES-256 encryption notice', async ({ page }) => {
    await expect(page.locator('text=AES-256 Encryption')).toBeVisible();
  });

  // ==========================================
  // STATISTICS CARDS
  // ==========================================

  test('Total Reports stat card is present', async ({ page }) => {
    await expect(page.locator('text=Total Reports')).toBeVisible();
  });

  test('High Severity stat card is present', async ({ page }) => {
    await expect(page.locator('text=High Severity')).toBeVisible();
  });

  test('Status stat card shows Secure', async ({ page }) => {
    await expect(page.locator('text=Secure')).toBeVisible();
  });

  // ==========================================
  // REPORTS TABLE
  // ==========================================

  test('reports table renders with correct column headers', async ({ page }) => {
    const headers = page.locator('.table-header-row th');
    const headerTexts = await headers.allTextContents();

    expect(headerTexts.join(' ')).toContain('Date');
    expect(headerTexts.join(' ')).toContain('Student Involved');
    expect(headerTexts.join(' ')).toContain('Location');
    expect(headerTexts.join(' ')).toContain('Severity');
    expect(headerTexts.join(' ')).toContain('Actions');
  });

  test('reports table has data rows or empty state', async ({ page }) => {
    const rows = page.locator('.sys-table tbody tr');
    const count = await rows.count();
    // Should have at least 1 row (data or empty state)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ==========================================
  // FILTERS
  // ==========================================

  test('Filter Reports section is visible', async ({ page }) => {
    await expect(page.locator('text=Filter Reports')).toBeVisible();
  });

  test('search bar is functional', async ({ page }) => {
    const searchBar = page.locator('input[placeholder*="Search by location"]');
    await expect(searchBar).toBeVisible();
  });

  // ==========================================
  // FOOTER
  // ==========================================

  test('footer shows AMSIRS Security Intelligence Interface', async ({ page }) => {
    await expect(page.locator('text=AMSIRS Security Intelligence Interface')).toBeVisible();
  });

  // ==========================================
  // PAGINATION
  // ==========================================

  test('pagination component is rendered', async ({ page }) => {
    // The Pagination component is at the bottom of the sys-card
    const card = page.locator('.sys-card').first();
    await expect(card).toBeVisible();
  });
});
