/**
 * Global Setup — Pre-authenticates all test accounts
 * Saves browser storage state per role so tests skip the login flow.
 */

import { chromium, FullConfig } from '@playwright/test';
import { TEST_ACCOUNTS } from './helpers/auth';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  // Ensure .auth directory exists
  const authDir = path.join(process.cwd(), '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const baseURL =
    config.projects[0]?.use?.baseURL || 'http://localhost:3000';

  const browser = await chromium.launch();

  for (const [roleName, account] of Object.entries(TEST_ACCOUNTS)) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      console.log(`🔐 Authenticating ${roleName} (${account.email})...`);

      await page.goto(baseURL);
      await page.waitForLoadState('networkidle');

      // Fill login form
      await page.locator('input[name="email"]').fill(account.email);
      await page.locator('input[name="password"]').fill(account.password);
      await page.locator('button[type="submit"]').click();

      // Wait for redirect — successful login navigates away from /
      await page.waitForURL(
        (url) => url.pathname !== '/' && url.pathname !== '/login',
        { timeout: 30_000 }
      );

      // Save storage state (cookies + localStorage)
      const statePath = path.join(process.cwd(), account.storageState);
      await context.storageState({ path: statePath });
      console.log(`  ✅ Saved → ${account.storageState}`);
    } catch (error) {
      console.error(`  ❌ Failed for ${roleName} (${account.email}):`, error);
    }

    await context.close();
  }

  await browser.close();
}

export default globalSetup;
