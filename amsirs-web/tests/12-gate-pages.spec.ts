import { test, expect } from '@playwright/test';

/**
 * Gate Pages (UI Only) Tests
 * Uses Super Admin storageState (which has guard access).
 * 
 * NOTE: Camera/face recognition functionality cannot be tested in headless mode.
 * These tests validate page rendering, UI elements, and static content only.
 */
test.describe('Access Gate Page (UI)', () => {
  test.beforeEach(async ({ page }) => {
    // Grant fake camera permission to prevent blocking errors
    await page.context().grantPermissions([], { origin: 'http://localhost:3000' });
    await page.goto('/access-gate');
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays Facial Recognition Entry Scanner heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Facial Recognition Entry Scanner');
  });

  test('displays real-time biometric subtitle', async ({ page }) => {
    await expect(page.locator('text=Real-time biometric campus entry verification')).toBeVisible();
  });

  test('Live Security Feed header is visible', async ({ page }) => {
    await expect(page.locator('text=Live Security Feed')).toBeVisible();
  });

  test('Entry Gate Camera label is visible', async ({ page }) => {
    await expect(page.locator('text=Entry Gate Camera')).toBeVisible();
  });

  test('LIVE badge is displayed', async ({ page }) => {
    await expect(page.getByText('LIVE', { exact: true })).toBeVisible();
  });

  test('Recognition Result section shows Awaiting Scan', async ({ page }) => {
    await expect(page.locator('text=Recognition Result')).toBeVisible();
    await expect(page.locator('text=Awaiting Scan')).toBeVisible();
  });

  test('Identity Profile section is visible', async ({ page }) => {
    await expect(page.locator('h2:has-text("Identity Profile")')).toBeVisible();
  });

  test('AI Monitoring section shows ACTIVE status', async ({ page }) => {
    await expect(page.locator('text=AI Monitoring')).toBeVisible();
    await expect(page.locator('text=Scanner Status')).toBeVisible();
    await expect(page.locator('.text-green-600:has-text("ACTIVE")')).toBeVisible();
  });

  test('AMSIRS Security branding card is present', async ({ page }) => {
    await expect(page.locator('text=AMSIRS SECURITY')).toBeVisible();
    await expect(page.locator('text=Facial Recognition Active')).toBeVisible();
  });

  test('Data Privacy Act compliance notice is present', async ({ page }) => {
    await expect(page.locator('text=Data Privacy Act of 2012')).toBeVisible();
  });

  test('video element exists in the DOM', async ({ page }) => {
    const video = page.locator('video');
    await expect(video).toBeAttached();
  });
});

test.describe('Exit Gate Page (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().grantPermissions([], { origin: 'http://localhost:3000' });
    await page.goto('/exit-gate');
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays Facial Recognition Exit Scanner heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Facial Recognition Exit Scanner');
  });

  test('displays real-time biometric exit subtitle', async ({ page }) => {
    await expect(page.locator('text=Real-time biometric campus exit verification')).toBeVisible();
  });

  test('Exit Gate Camera label is visible', async ({ page }) => {
    await expect(page.locator('text=Exit Gate Camera')).toBeVisible();
  });

  test('EXIT ACTIVE badge is displayed', async ({ page }) => {
    await expect(page.locator('text=EXIT ACTIVE')).toBeVisible();
  });

  test('Awaiting Scan placeholder is visible', async ({ page }) => {
    await expect(page.locator('text=Awaiting Scan')).toBeVisible();
  });

  test('Exit Scanner status shows ACTIVE', async ({ page }) => {
    await expect(page.locator('h2:has-text("Exit Scanner")')).toBeVisible();
    await expect(page.locator('.text-green-600:has-text("ACTIVE")')).toBeVisible();
  });

  test('AMSIRS Security card for exit is present', async ({ page }) => {
    await expect(page.locator('text=Exit Recognition Active')).toBeVisible();
  });

  test('Data Privacy Act notice is present on exit page', async ({ page }) => {
    await expect(page.locator('text=Data Privacy Act of 2012')).toBeVisible();
  });

  test('video element exists for exit camera', async ({ page }) => {
    const video = page.locator('video');
    await expect(video).toBeAttached();
  });
});
