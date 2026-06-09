import { test, expect } from '@playwright/test';

/**
 * Student Portal Tests
 * Uses Student storageState (zack64415@gmail.com).
 */
test.describe('Student Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/student-portal');
    await page.waitForLoadState('networkidle');
  });

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  test('displays STUDENT PORTAL heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('STUDENT PORTAL');
  });

  test('displays subtitle about Personal Information', async ({ page }) => {
    await expect(page.locator('text=Personal Information')).toBeVisible();
    await expect(page.locator('text=Involvement Records')).toBeVisible();
  });

  // ==========================================
  // IDENTITY MATRIX CARD
  // ==========================================

  test('Identity Matrix card is rendered', async ({ page }) => {
    await expect(page.locator('text=Identity Matrix')).toBeVisible();
  });

  test('Internal ID is displayed', async ({ page }) => {
    await expect(page.locator('text=Internal ID')).toBeVisible();
  });

  test('student name fields are populated', async ({ page }) => {
    // First Name and Last Name labels exist
    await expect(page.locator('label:has-text("First Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Last Name")')).toBeVisible();

    // The name values should not be empty
    const firstNameValue = page.locator('.input-field-alt').first();
    await expect(firstNameValue).toBeVisible();
    const text = await firstNameValue.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('LRN is displayed', async ({ page }) => {
    // LRN field shows either a number or "Not provided"
    await expect(page.locator('text=LRN')).toBeVisible();
  });

  // ==========================================
  // DEMOGRAPHICS
  // ==========================================

  test('gender field is displayed', async ({ page }) => {
    await expect(page.locator('label:has-text("Gender")')).toBeVisible();
  });

  test('date of birth field is displayed', async ({ page }) => {
    await expect(page.locator('label:has-text("Date of Birth")')).toBeVisible();
  });

  test('address field is displayed', async ({ page }) => {
    await expect(page.locator('label:has-text("Complete Address")')).toBeVisible();
  });

  // ==========================================
  // ACADEMICS
  // ==========================================

  test('grade level is displayed', async ({ page }) => {
    await expect(page.locator('label:has-text("Level")')).toBeVisible();
  });

  test('section is displayed', async ({ page }) => {
    await expect(page.locator('label:has-text("Section")')).toBeVisible();
  });

  // ==========================================
  // PROFILE PHOTO
  // ==========================================

  test('profile photo area is rendered', async ({ page }) => {
    // Either an img tag or "No Scan" text
    const photoSection = page.locator('.rounded-full.bg-cavite-gray, .rounded-full img');
    await expect(photoSection.first()).toBeVisible();
  });

  // ==========================================
  // INVOLVEMENT LOGS
  // ==========================================

  test('Involvement Logs card is rendered', async ({ page }) => {
    await expect(page.locator('text=Involvement Logs')).toBeVisible();
  });

  test('Encrypted badge is shown on involvement logs', async ({ page }) => {
    await expect(page.locator('.badge-outline:has-text("Encrypted")')).toBeVisible();
  });

  // ==========================================
  // MOBILE REPORT LINK
  // ==========================================

  test('File a New Report link exists for mobile', async ({ page }) => {
    // This link is only visible on small screens (sm:hidden)
    // We verify it exists in the DOM
    const reportLink = page.locator('a[href="/incident-reporting"]:has-text("File a New Report")');
    await expect(reportLink).toBeAttached();
  });
});
