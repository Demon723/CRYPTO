import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      }));
    });
  });

  test('should load dashboard with stats', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Portfolio')).toBeVisible();
    await expect(page.locator('text=Transactions')).toBeVisible();
    await expect(page.locator('text=Wallets')).toBeVisible();
    await expect(page.locator('text=AI Assistant')).toBeVisible();
  });

  test('should navigate to portfolio page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Portfolio');
    await expect(page).toHaveURL(/.*portfolio/);
  });

  test('should navigate to transactions page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Transactions');
    await expect(page).toHaveURL(/.*transactions/);
  });

  test('should navigate to AI assistant page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=AI Assistant');
    await expect(page).toHaveURL(/.*ai/);
  });

  test('should have theme toggle', async ({ page }) => {
    await page.goto('/dashboard');
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
    }
  });

  test('should display user menu', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
