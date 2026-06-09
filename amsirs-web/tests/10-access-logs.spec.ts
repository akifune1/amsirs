import { test, expect } from '@playwright/test';

/**
 * Access Logs Tests
 * Uses Super Admin storageState.
 */
test.describe('Access Logs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/access-logs');
    await page.waitForLoadState('networkidle');
  });

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  test('displays Access Logs heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Access Logs');
  });

  test('displays subtitle about biometric records', async ({ page }) => {
    await expect(page.locator('text=Real-time campus biometric access records')).toBeVisible();
  });

  test('displays section heading for Security Records', async ({ page }) => {
    await expect(page.locator('h2:has-text("Security Records")')).toBeVisible();
  });

  // ==========================================
  // TABLE STRUCTURE
  // ==========================================

  test('table has correct column headers', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.sys-table', { timeout: 15_000 });

    const headers = page.locator('.table-header-row th');
    const headerTexts = await headers.allTextContents();

    expect(headerTexts.join(' ')).toContain('Snapshot');
    expect(headerTexts.join(' ')).toContain('Student');
    expect(headerTexts.join(' ')).toContain('Student ID');
    expect(headerTexts.join(' ')).toContain('Action');
    expect(headerTexts.join(' ')).toContain('Match');
    expect(headerTexts.join(' ')).toContain('Timestamp');
  });

  // ==========================================
  // FILTERS
  // ==========================================

  test('Filter Security Records header is visible', async ({ page }) => {
    await expect(page.locator('text=Filter Security Records')).toBeVisible();
  });

  test('date filter dropdown is functional', async ({ page }) => {
    const dateFilter = page.locator('select').filter({ hasText: 'All Time' });
    await expect(dateFilter).toBeVisible();

    // Verify options exist
    const options = dateFilter.locator('option');
    await expect(options).toHaveCount(4); // All Time, Today, Yesterday, Last 7 Days
  });

  test('action filter dropdown is functional', async ({ page }) => {
    const actionFilter = page.locator('select').filter({ hasText: 'All Actions' });
    await expect(actionFilter).toBeVisible();

    // Verify options
    const options = actionFilter.locator('option');
    await expect(options).toHaveCount(3); // All Actions, Entry, Exit
  });

  // ==========================================
  // PAGINATION
  // ==========================================

  test('pagination buttons are present', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    const prevButton = page.locator('button:has-text("Previous")');
    const nextButton = page.locator('button:has-text("Next")');

    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
  });

  test('log count display is visible', async ({ page }) => {
    await page.waitForTimeout(2000);
    // "Showing X logs (Total: Y)"
    await expect(page.locator('text=Showing')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
  });

  // ==========================================
  // DATA STATES
  // ==========================================

  test('table shows data or empty state', async ({ page }) => {
    // Wait for loading to finish
    await page.waitForTimeout(3000);

    const rows = page.locator('.sys-table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Check if it's data or empty state
    const firstRowText = await rows.first().textContent();
    const hasData = !firstRowText?.includes('No access logs found');
    // Either way, the page rendered correctly
    expect(firstRowText?.length).toBeGreaterThan(0);
  });
});
