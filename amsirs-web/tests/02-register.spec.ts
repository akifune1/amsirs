import { test, expect } from '@playwright/test';

test.describe('Student Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  test('renders with STUDENT ENROLLMENT heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('STUDENT ENROLLMENT');
  });

  test('displays registration instructions subtitle', async ({ page }) => {
    await expect(
      page.locator('text=Please fill out your details below')
    ).toBeVisible();
  });

  // ==========================================
  // ACCOUNT CREDENTIALS SECTION
  // ==========================================

  test('has Account Credentials section with email and password', async ({ page }) => {
    await expect(page.locator('text=Account Credentials')).toBeVisible();

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required', '');

    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  // ==========================================
  // PERSONAL INFORMATION SECTION
  // ==========================================

  test('has LRN, First Name, and Last Name fields', async ({ page }) => {
    const lrn = page.locator('input[name="lrn"]');
    const firstName = page.locator('input[name="firstName"]');
    const lastName = page.locator('input[name="lastName"]');

    await expect(lrn).toBeVisible();
    await expect(lrn).toHaveAttribute('required', '');

    await expect(firstName).toBeVisible();
    await expect(firstName).toHaveAttribute('required', '');

    await expect(lastName).toBeVisible();
    await expect(lastName).toHaveAttribute('required', '');
  });

  // ==========================================
  // DEMOGRAPHICS & CONTACT SECTION
  // ==========================================

  test('has Date of Birth field', async ({ page }) => {
    const birthday = page.locator('input[name="birthday"]');
    await expect(birthday).toBeVisible();
    await expect(birthday).toHaveAttribute('type', 'date');
    await expect(birthday).toHaveAttribute('required', '');
  });

  test('has Gender dropdown with correct options', async ({ page }) => {
    const genderSelect = page.locator('select[name="gender"]');
    await expect(genderSelect).toBeVisible();

    const options = genderSelect.locator('option');
    await expect(options).toHaveCount(4); // disabled placeholder + 3 options

    await expect(options.nth(1)).toHaveText('Male');
    await expect(options.nth(2)).toHaveText('Female');
    await expect(options.nth(3)).toHaveText('Other');
  });

  test('has Complete Address textarea', async ({ page }) => {
    const address = page.locator('textarea[name="address"]');
    await expect(address).toBeVisible();
    await expect(address).toHaveAttribute('required', '');
  });

  // ==========================================
  // ACADEMIC PLACEMENT SECTION
  // ==========================================

  test('has Grade Level dropdown with Grade 11 and Grade 12', async ({ page }) => {
    const gradeLevel = page.locator('select[name="gradeLevel"]');
    await expect(gradeLevel).toBeVisible();

    const options = gradeLevel.locator('option');
    await expect(options.nth(0)).toHaveText('Grade 11');
    await expect(options.nth(1)).toHaveText('Grade 12');
  });

  test('has Section input field', async ({ page }) => {
    const section = page.locator('input[name="section"]');
    await expect(section).toBeVisible();
    await expect(section).toHaveAttribute('required', '');
  });

  // ==========================================
  // BIOMETRIC & CONSENT SECTION
  // ==========================================

  test('has ID Photo section with Required badge', async ({ page }) => {
    await expect(page.locator('text=ID Photo')).toBeVisible();
    await expect(page.locator('text=Required')).toBeVisible();
  });

  test('has Data Privacy checkbox', async ({ page }) => {
    const checkbox = page.locator('#dpa-register');
    await expect(checkbox).toBeVisible();
  });

  test('has Submit Registration button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText('Submit Registration');
  });

  test('displays photo capture guidelines', async ({ page }) => {
    await expect(page.locator('text=well-lit area')).toBeVisible();
    await expect(page.locator('text=Look directly at the camera')).toBeVisible();
  });
});
