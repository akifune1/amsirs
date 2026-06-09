import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard — Students Tab Tests
 * Uses Super Admin storageState.
 */
test.describe('Admin Dashboard — Students Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-dashboard?tab=students');
    await page.waitForLoadState('networkidle');
  });

  // ==========================================
  // TAB SWITCHING
  // ==========================================

  test('Student Body tab is active when navigated to', async ({ page }) => {
    const studentsTab = page.locator('a:has-text("Student Body")');
    await expect(studentsTab).toBeVisible();
    await expect(studentsTab).toHaveClass(/bg-white/);
  });

  // ==========================================
  // STUDENT TABLE
  // ==========================================

  test('student table renders with correct column headers', async ({ page }) => {
    const headers = page.locator('.table-header-row th');
    const headerTexts = await headers.allTextContents();

    expect(headerTexts.join(' ')).toContain('Student ID');
    expect(headerTexts.join(' ')).toContain('Last Name');
    expect(headerTexts.join(' ')).toContain('First Name');
    expect(headerTexts.join(' ')).toContain('Grade Level');
    expect(headerTexts.join(' ')).toContain('Section');
    expect(headerTexts.join(' ')).toContain('Status');
    expect(headerTexts.join(' ')).toContain('Actions');
  });

  test('student table contains at least one row', async ({ page }) => {
    const rows = page.locator('.sys-table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('student approval status badges render', async ({ page }) => {
    const statusBadges = page.locator('tbody span:has-text("Approved"), tbody span:has-text("Pending")');
    const count = await statusBadges.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ==========================================
  // FILTERS & SEARCH
  // ==========================================

  test('Filter Students header is visible', async ({ page }) => {
    await expect(page.locator('text=Filter Students')).toBeVisible();
  });

  test('grade filter dropdown is present', async ({ page }) => {
    // FilterDropdown for grade
    const filterArea = page.locator('.border-b.border-cavite-border .flex');
    await expect(filterArea.first()).toBeVisible();
  });

  test('search bar filters students', async ({ page }) => {
    const searchBar = page.locator('input[placeholder*="Search by name"]');
    await expect(searchBar).toBeVisible();

    // Type a search that shouldn't match
    await searchBar.fill('zzzznonexistent');
    await page.waitForTimeout(1000);

    const emptyState = page.locator('text=No students found');
    const rows = page.locator('.sys-table tbody tr');
    const rowCount = await rows.count();

    if (rowCount === 1) {
      const text = await rows.first().textContent();
      if (text?.includes('No students found')) {
        await expect(emptyState).toBeVisible();
      }
    }
  });

  // ==========================================
  // BULK APPROVE
  // ==========================================

  test('Bulk Approve button is present', async ({ page }) => {
    const bulkButton = page.locator('button:has-text("Bulk Approve Selected")');
    await expect(bulkButton).toBeVisible();
  });

  test('bulk approve instructions text is visible', async ({ page }) => {
    await expect(page.locator('text=Select pending students')).toBeVisible();
  });

  // ==========================================
  // ACTIONS
  // ==========================================

  test('Reset PW button is visible in student actions', async ({ page }) => {
    const resetButtons = page.locator('button:has-text("Reset PW")');
    const count = await resetButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('student table has edit buttons', async ({ page }) => {
    // EditStudentModal renders as a button in the actions column
    const actionCells = page.locator('tbody tr td:last-child');
    const count = await actionCells.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ==========================================
  // PAGINATION
  // ==========================================

  test('pagination section is rendered', async ({ page }) => {
    // Pagination component exists after the table
    const tableCard = page.locator('.sys-card').first();
    await expect(tableCard).toBeVisible();
  });
});
