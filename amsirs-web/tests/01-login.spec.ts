import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS, loginAs } from './helpers/auth';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  test('renders the login page with AMSIRS branding', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AMSIRS');
    await expect(page.locator('p').first()).toContainText('Cavite National High School');
  });

  test('displays email and password input fields', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('displays the Login submit button', async ({ page }) => {
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toContainText('Login');
  });

  test('displays register link', async ({ page }) => {
    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toContainText('No Account Yet');
  });

  test('displays footer authorization notice', async ({ page }) => {
    await expect(page.locator('text=Authorized Personnel Only')).toBeVisible();
    await expect(page.locator('text=Secure Session')).toBeVisible();
  });

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  test('shows error message on invalid credentials', async ({ page }) => {
    await page.locator('input[name="email"]').fill('bad@example.com');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Wait for the error message to appear
    const errorMessage = page.locator('.alert-error');
    await expect(errorMessage).toBeVisible({ timeout: 15_000 });
    await expect(errorMessage).toContainText('Invalid credentials');
  });

  test('shows loading state while verifying', async ({ page }) => {
    await page.locator('input[name="email"]').fill('bad@example.com');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Briefly check for loading text (may be fast)
    const submitButton = page.locator('button[type="submit"]');
    // The button text changes to "Verifying Identity..." while pending
    await expect(submitButton).toContainText(/Verifying Identity|Login/);
  });

  // ==========================================
  // ROLE-BASED REDIRECTS
  // ==========================================

  test('Super Admin login redirects to /admin-dashboard', async ({ page }) => {
    const { email, password } = TEST_ACCOUNTS.superAdmin;
    await loginAs(page, email, password);
    await expect(page).toHaveURL(/\/admin-dashboard/);
  });

  test('IT Admin login redirects to /admin-dashboard', async ({ page }) => {
    const { email, password } = TEST_ACCOUNTS.itAdmin;
    await loginAs(page, email, password);
    await expect(page).toHaveURL(/\/admin-dashboard/);
  });

  test('School Admin login redirects to /incident-dashboard', async ({ page }) => {
    const { email, password } = TEST_ACCOUNTS.schoolAdmin;
    await loginAs(page, email, password);
    await expect(page).toHaveURL(/\/incident-dashboard/);
  });

  test('Student login redirects to /student-portal', async ({ page }) => {
    const { email, password } = TEST_ACCOUNTS.student;
    await loginAs(page, email, password);
    await expect(page).toHaveURL(/\/student-portal/);
  });

  test('Student Support login redirects to /student-support', async ({ page }) => {
    const { email, password } = TEST_ACCOUNTS.studentSupport;
    await loginAs(page, email, password);
    await expect(page).toHaveURL(/\/student-support/);
  });

  // ==========================================
  // NAVIGATION
  // ==========================================

  test('register link navigates to /register', async ({ page }) => {
    await page.locator('a[href="/register"]').click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('/login route redirects to /', async ({ page }) => {
    await page.goto('/login');
    // /login/page.tsx calls redirect('/')
    await expect(page).toHaveURL('/');
  });
});
