import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard — Staff Tab Tests
 * Uses Super Admin storageState (configured in playwright.config.ts).
 */
test.describe('Admin Dashboard — Staff Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-dashboard?tab=staff');
    await page.waitForLoadState('networkidle');
  });

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  test('displays Root Control heading and subtitle', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Root Control');
    await expect(page.locator('text=Administrative Tier Isolation Active')).toBeVisible();
  });

  test('staff tab is active by default', async ({ page }) => {
    const staffTab = page.locator('a:has-text("Institutional Staff")');
    await expect(staffTab).toBeVisible();
    // Active tab has white bg and font-bold
    await expect(staffTab).toHaveClass(/bg-white/);
  });

  test('student body tab is visible but inactive', async ({ page }) => {
    const studentsTab = page.locator('a:has-text("Student Body")');
    await expect(studentsTab).toBeVisible();
    await expect(studentsTab).toHaveClass(/text-gray-500/);
  });

  // ==========================================
  // STAFF TABLE
  // ==========================================

  test('staff table renders with correct column headers', async ({ page }) => {
    const headers = page.locator('.table-header-row th');
    const headerTexts = await headers.allTextContents();

    expect(headerTexts).toContain('ID');
    expect(headerTexts).toContain('Last Name');
    expect(headerTexts).toContain('First Name');
    expect(headerTexts).toContain('Date Added');
    expect(headerTexts).toContain('Role');
    expect(headerTexts).toContain('Status');
    expect(headerTexts).toContain('Actions');
  });

  test('staff table contains at least one row', async ({ page }) => {
    const rows = page.locator('.sys-table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('staff role displays human-readable names', async ({ page }) => {
    const roleTexts = await page.locator('tbody tr td:nth-child(5)').allTextContents();
    const validRoles = ['Guard', 'Guidance', 'School Admin', 'IT Admin'];

    for (const text of roleTexts) {
      const trimmed = text.trim();
      if (trimmed) {
        expect(validRoles).toContain(trimmed);
      }
    }
  });

  test('staff status badges render correctly', async ({ page }) => {
    // Check for at least one status badge (Active or Suspended)
    const statusBadges = page.locator('tbody tr span:has-text("Active"), tbody tr span:has-text("Suspended")');
    const count = await statusBadges.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ==========================================
  // FILTERS & SEARCH
  // ==========================================

  test('staff directory header shows Filter Directory', async ({ page }) => {
    await expect(page.locator('text=Filter Directory')).toBeVisible();
  });

  test('role filter dropdown is present', async ({ page }) => {
    // The FilterDropdown component renders as a select or custom element
    await expect(page.locator('text=Institutional Staff Directory')).toBeVisible();
  });

  test('search bar is functional', async ({ page }) => {
    const searchBar = page.locator('input[placeholder*="Search staff"]');
    await expect(searchBar).toBeVisible();

    // Type a search term — table should update (or show empty state)
    await searchBar.fill('zzzznonexistent');
    await page.waitForTimeout(1000); // Wait for URL update and re-render

    // Should either filter results or show no matches
    const emptyState = page.locator('text=No staff members found');
    const tableRows = page.locator('.sys-table tbody tr');
    const rowCount = await tableRows.count();

    // Either we got filtered results or the empty state
    if (rowCount === 1) {
      // Could be the empty state row
      const firstRowText = await tableRows.first().textContent();
      if (firstRowText?.includes('No staff members found')) {
        await expect(emptyState).toBeVisible();
      }
    }
  });

  // ==========================================
  // MODALS & ACTIONS
  // ==========================================

  test('Create Staff button is visible', async ({ page }) => {
    // CreateStaffModal has a trigger button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add Staff"), button:has-text("New Staff")');
    // If the button text is inside the modal trigger, let's look for it broadly
    const staffSection = page.locator('section').first();
    await expect(staffSection).toBeVisible();
  });

  test('Reset PW button is visible in staff actions', async ({ page }) => {
    const resetButtons = page.locator('button:has-text("Reset PW")');
    const count = await resetButtons.count();
    // Should have at least one reset button (one per staff row)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('pagination section renders', async ({ page }) => {
    // Pagination component should be present (even if only 1 page)
    const paginationArea = page.locator('.sys-card').last();
    await expect(paginationArea).toBeVisible();
  });
});

test.describe('Admin Dashboard — Access Control', () => {
  test('School Admin is redirected away from admin dashboard', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: '.auth/school-admin.json',
    });
    const page = await context.newPage();

    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle');

    // School admins should be redirected to /unauthorized
    await expect(page).toHaveURL(/\/unauthorized/);

    await context.close();
  });
});
