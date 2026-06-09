/**
 * AMSIRS Test Accounts & Authentication Helpers
 * Used by global-setup.ts and individual test files.
 */

import { Page } from '@playwright/test';

export const TEST_ACCOUNTS = {
  superAdmin: {
    email: 'super.admin@cnhs.com',
    password: 'MabuhayCNHS1902',
    redirectTo: '/admin-dashboard',
    storageState: '.auth/super-admin.json',
  },
  itAdmin: {
    email: 'it.admin@cnhs.com',
    password: 'MabuhayCNHS1902',
    redirectTo: '/admin-dashboard',
    storageState: '.auth/it-admin.json',
  },
  schoolAdmin: {
    email: 'school.admin@cnhs.com',
    password: 'MabuhayCNHS1902',
    redirectTo: '/incident-dashboard',
    storageState: '.auth/school-admin.json',
  },
  student: {
    email: 'zack64415@gmail.com',
    password: 'Zackcloud123',
    redirectTo: '/student-portal',
    storageState: '.auth/student.json',
  },
  studentSupport: {
    email: 'guard@amsirs.edu',
    password: 'test123',
    redirectTo: '/student-support',
    storageState: '.auth/student-support.json',
  },
} as const;

export type RoleName = keyof typeof TEST_ACCOUNTS;

/**
 * Login through the UI form at /
 * Use this when you need to authenticate within a test
 * (most tests should use storageState instead for speed).
 */
export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  // Wait for navigation away from login page
  await page.waitForURL(
    (url) => url.pathname !== '/' && url.pathname !== '/login',
    { timeout: 20_000 }
  );
}
