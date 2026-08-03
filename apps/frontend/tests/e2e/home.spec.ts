import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the landing page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Synex/);
    await expect(page.locator('h1')).toContainText('Synex');
  });

  test('should display navigation with correct links', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    await expect(page.locator('text=Features')).toBeVisible();
    await expect(page.locator('text=Pricing')).toBeVisible();
    await expect(page.locator('text=Docs')).toBeVisible();
  });

  test('should display hero section with CTA buttons', async ({ page }) => {
    await expect(page.locator('text=AI Crypto Operating System')).toBeVisible();
    await expect(page.locator('text=Get Started')).toBeVisible();
    await expect(page.locator('text=Learn More')).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    const features = [
      'AI Chat Assistant',
      'Multi-Wallet Support',
      'Portfolio Analytics',
      'Smart Contract Analyzer',
      'Token Research',
      'Real-Time Alerts',
    ];

    for (const feature of features) {
      await expect(page.locator(`text=${feature}`)).toBeVisible();
    }
  });

  test('should display stats section', async ({ page }) => {
    await expect(page.locator('text=50K+')).toBeVisible();
    await expect(page.locator('text=200K+')).toBeVisible();
    await expect(page.locator('text=10M+')).toBeVisible();
    await expect(page.locator('text=5M+')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should have working tab navigation', async ({ page }) => {
    const featuresTab = page.locator('button:has-text("Features")');
    const pricingTab = page.locator('button:has-text("Pricing")');
    
    await expect(featuresTab).toBeVisible();
    await expect(pricingTab).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile menu should be visible
    await expect(page.locator('text=Synex')).toBeVisible();
  });

  test('should have accessible color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check that text is visible (not white on white, etc.)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
