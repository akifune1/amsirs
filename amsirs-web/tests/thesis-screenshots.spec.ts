import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const NON_STUDENT_ACCOUNT = {
  email: 'super.admin@cnhs.com',
  password: 'MabuhayCNHS1902'
};

const STUDENT_ACCOUNT = {
  email: 'rimurutempest65536@gmail.com',
  password: 'Zackcloud123'
};

// You can add or remove URLs here if you need more pages!
const PUBLIC_PAGES = [
  { name: 'Login Page', url: '/' },
  { name: 'Register Page', url: '/register' },
];

const NON_STUDENT_PAGES = [
  { name: 'Admin Dashboard', url: '/admin-dashboard' },
  { name: 'Access Logs', url: '/access-logs' },
  { name: 'Active Sessions', url: '/active-sessions' },
  { name: 'Attendance Monitoring', url: '/attendance-monitoring' },
  { name: 'Campus Status', url: '/campus-status' },
  { name: 'Incident Dashboard', url: '/incident-dashboard' },
  { name: 'Incident Reporting', url: '/incident-reporting' },
  { name: 'Student Support', url: '/student-support' },
  { name: 'Access Gate', url: '/access-gate' },
  { name: 'Exit Gate', url: '/exit-gate' },
];

const STUDENT_PAGES = [
  { name: 'Student Portal', url: '/student-portal' },
  { name: 'Student Incident Reporting', url: '/incident-reporting' },
];

const SCREENSHOT_DIR = path.join(__dirname, '..', 'thesis-screenshots');

test.describe('Thesis Screenshots Generator', () => {

  test.beforeAll(() => {
    // Create the thesis-screenshots folder if it doesn't exist
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  });

  // Helper function to handle the screenshot looping
  const takeScreenshots = async (page: any, pagesList: any[], prefix: string, mode: 'light' | 'dark') => {
    console.log(`\n📸 Starting ${mode.toUpperCase()} mode screenshots for ${prefix}...`);
    
    // Emulate color scheme preference
    await page.emulateMedia({ colorScheme: mode });
    
    for (const p of pagesList) {
      await page.goto(p.url);
      
      // Force Tailwind/Next-Themes class just to be absolutely sure
      if (mode === 'dark') {
        await page.evaluate(() => document.documentElement.classList.add('dark'));
      } else {
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }

      // Wait for page to fully load and animations to settle
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500); 
      
      const fileName = `${prefix}_${p.name.replace(/\s+/g, '-').toLowerCase()}_${mode}.png`;
      const filePath = path.join(SCREENSHOT_DIR, fileName);
      
      await page.screenshot({
        path: filePath,
        fullPage: true,
      });
      console.log(`✅ Saved: ${fileName}`);
    }
  };

  test('Public Pages Screenshots', async ({ page }) => {
    await takeScreenshots(page, PUBLIC_PAGES, 'public', 'light');
  });

  test('Non-Student Pages Screenshots', async ({ page }) => {
    test.setTimeout(120000); // Give it extra time for all the pages
    
    // 1. Login as Super Admin
    await page.goto('/');
    await page.fill('input[name="email"]', NON_STUDENT_ACCOUNT.email);
    await page.fill('input[name="password"]', NON_STUDENT_ACCOUNT.password);
    await page.click('button[type="submit"]');
    
    // Wait until login completes and we land on the dashboard
    await page.waitForURL('**/admin-dashboard');

    // 2. Take Screenshots
    await takeScreenshots(page, NON_STUDENT_PAGES, 'admin', 'light');
  });

  test('Student Pages Screenshots', async ({ page }) => {
    test.setTimeout(60000); // Give it extra time
    
    // 1. Login as Student
    await page.goto('/');
    await page.fill('input[name="email"]', STUDENT_ACCOUNT.email);
    await page.fill('input[name="password"]', STUDENT_ACCOUNT.password);
    await page.click('button[type="submit"]');
    
    // Wait until login completes and we land on the student portal
    await page.waitForURL('**/student-portal');

    // 2. Take Screenshots
    await takeScreenshots(page, STUDENT_PAGES, 'student', 'light');
  });

});
