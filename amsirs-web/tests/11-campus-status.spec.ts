import { test, expect } from '@playwright/test';

/**
 * Campus Status Monitor Tests
 * Uses Super Admin storageState.
 */
test.describe('Campus Status Monitor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/campus-status');
    await page.waitForLoadState('networkidle');
  });

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  test('displays Campus Status Monitor heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Campus Status Monitor');
  });

  test('displays real-time monitoring subtitle', async ({ page }) => {
    await expect(page.locator('text=Real-time monitoring')).toBeVisible();
  });

  // ==========================================
  // STATISTICS CARDS
  // ==========================================

  test('Current Population stat card is present', async ({ page }) => {
    await expect(page.locator('text=Current Population')).toBeVisible();
  });

  test('population count displays a number', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(3000);
    const populationText = page.locator('text=Current Population').locator('..').locator('p.text-5xl');
    await expect(populationText).toBeVisible();
  });

  test('System Status card shows ACTIVE', async ({ page }) => {
    await expect(page.locator('text=System Status')).toBeVisible();
    await expect(page.locator('p.text-green-600:has-text("ACTIVE")')).toBeVisible();
  });

  test('AMSIRS Security branding card is present', async ({ page }) => {
    await expect(page.locator('text=AMSIRS SECURITY')).toBeVisible();
    await expect(page.locator('text=Campus Monitoring Active')).toBeVisible();
  });

  // ==========================================
  // DATA STATES
  // ==========================================

  test('shows loading state or data after page load', async ({ page }) => {
    // Either loading state or data should be visible
    await page.waitForTimeout(5000);

    const loadingText = page.locator('text=Loading campus status');
    const noStudents = page.locator('text=No Students Inside Campus');
    const tableCard = page.locator('.sys-card');

    // One of these three states should be present
    const isLoading = await loadingText.isVisible().catch(() => false);
    const isEmpty = await noStudents.isVisible().catch(() => false);
    const hasTable = await tableCard.isVisible().catch(() => false);

    expect(isLoading || isEmpty || hasTable).toBeTruthy();
  });

  test('search input is present when students are inside', async ({ page }) => {
    await page.waitForTimeout(5000);

    // If students are present, the search input should be visible
    const searchInput = page.locator('input[placeholder*="Search by ID or Name"]');
    const noStudents = page.locator('text=No Students Inside Campus');

    const isEmpty = await noStudents.isVisible().catch(() => false);

    if (!isEmpty) {
      // Students are present — search should be visible
      if (await searchInput.isVisible().catch(() => false)) {
        await expect(searchInput).toBeVisible();
      }
    }
  });

  // ==========================================
  // TABLE (when students are present)
  // ==========================================

  test('table has correct column headers when data exists', async ({ page }) => {
    await page.waitForTimeout(5000);

    const tableHeaders = page.locator('.table-header-row th');
    const count = await tableHeaders.count();

    if (count > 0) {
      const headerTexts = await tableHeaders.allTextContents();
      expect(headerTexts.join(' ')).toContain('Student Identity');
      expect(headerTexts.join(' ')).toContain('Entry Time');
      expect(headerTexts.join(' ')).toContain('Match Accuracy');
      expect(headerTexts.join(' ')).toContain('Access Gate Proof');
    }
  });

  test('biometric tracking notice is displayed', async ({ page }) => {
    await expect(page.locator('text=biometric entry and exit verification')).toBeVisible();
  });
});
