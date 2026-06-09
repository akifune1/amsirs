import { test, expect } from '@playwright/test';

/**
 * Incident Reporting Form Tests
 * Uses Super Admin storageState (which has guard-level access).
 */
test.describe('Incident Reporting Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/incident-reporting');
    await page.waitForLoadState('networkidle');
  });

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  test('displays INCIDENT REPORTING heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('INCIDENT REPORTING');
  });

  test('displays Authorized Personnel subtitle', async ({ page }) => {
    await expect(page.locator('text=Authorized Personnel Entry Terminal')).toBeVisible();
  });

  test('displays Secure Form header with System Online badge', async ({ page }) => {
    await expect(page.locator('text=Secure Form v2.0')).toBeVisible();
    await expect(page.locator('text=System Online')).toBeVisible();
  });

  // ==========================================
  // STUDENT FIELDS
  // ==========================================

  test('has student name fields (Last Name and First Name)', async ({ page }) => {
    const lastNameInput = page.locator('input[name="lastName"]').first();
    const firstNameInput = page.locator('input[name="firstName"]').first();

    await expect(lastNameInput).toBeVisible();
    await expect(lastNameInput).toHaveAttribute('required', '');

    await expect(firstNameInput).toBeVisible();
    await expect(firstNameInput).toHaveAttribute('required', '');
  });

  test('Involved Students section header is visible', async ({ page }) => {
    await expect(page.locator('text=Involved Students')).toBeVisible();
  });

  test('Add Another Student button works', async ({ page }) => {
    // Initially 1 student block
    const studentBlocks = page.locator('input[name="lastName"]');
    const initialCount = await studentBlocks.count();

    // Click add
    await page.locator('button:has-text("Add Another Student")').click();

    // Now should have 1 more
    const newCount = await page.locator('input[name="lastName"]').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('remove student button appears when multiple students', async ({ page }) => {
    // Add a second student
    await page.locator('button:has-text("Add Another Student")').click();

    // Remove button (✕) should now be visible
    const removeButtons = page.locator('button:has-text("✕")');
    const count = await removeButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Click remove — should go back to 1
    await removeButtons.first().click();
    const remainingStudents = await page.locator('input[name="lastName"]').count();
    expect(remainingStudents).toBe(1);
  });

  // ==========================================
  // INCIDENT PARAMETERS
  // ==========================================

  test('Incident Parameters section header is visible', async ({ page }) => {
    await expect(page.locator('text=Incident Parameters')).toBeVisible();
  });

  test('location field is present', async ({ page }) => {
    const locationInput = page.locator('input[name="location"]').first();
    await expect(locationInput).toBeVisible();
    await expect(locationInput).toHaveAttribute('required', '');
  });

  test('Add Another Location button works', async ({ page }) => {
    const initialCount = await page.locator('input[name="location"]').count();

    await page.locator('button:has-text("Add Another Location")').click();

    const newCount = await page.locator('input[name="location"]').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('severity dropdown has correct options', async ({ page }) => {
    const severitySelect = page.locator('select[name="severity"]');
    await expect(severitySelect).toBeVisible();

    const options = severitySelect.locator('option');
    await expect(options.nth(0)).toContainText('Low');
    await expect(options.nth(1)).toContainText('Medium');
    await expect(options.nth(2)).toContainText('High');
  });

  // ==========================================
  // DESCRIPTION & EVIDENCE
  // ==========================================

  test('description textarea is present with encryption badge', async ({ page }) => {
    const description = page.locator('textarea[name="description"]');
    await expect(description).toBeVisible();
    await expect(description).toHaveAttribute('required', '');

    await expect(page.locator('text=AES-256 Encrypted')).toBeVisible();
  });

  test('photographic evidence file input is present', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][name="attachment"]');
    await expect(fileInput).toBeVisible();
    await expect(fileInput).toHaveAttribute('accept', 'image/jpeg, image/png');
  });

  test('Photographic Evidence label shows Optional', async ({ page }) => {
    await expect(page.locator('text=Photographic Evidence')).toBeVisible();
    await expect(page.locator('.sys-label:has-text("Optional")')).toBeVisible();
  });

  // ==========================================
  // CONSENT & SUBMISSION
  // ==========================================

  test('Data Privacy checkbox is present', async ({ page }) => {
    const checkbox = page.locator('#dpa-incident');
    await expect(checkbox).toBeVisible();
  });

  test('submit button shows correct text', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]:has-text("Submit Secured Report")');
    await expect(submitButton).toBeVisible();
  });
});
