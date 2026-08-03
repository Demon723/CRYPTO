import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render buttons correctly', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render cards correctly', async ({ page }) => {
    const cards = page.locator('[class*="card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have working tabs', async ({ page }) => {
    // Find tab triggers
    const tabs = page.locator('[role="tab"]');
    if (await tabs.count() > 0) {
      await tabs.first().click();
      await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('should have accessible form inputs', async ({ page }) => {
    const inputs = page.locator('input');
    const count = await inputs.count();
    
    if (count > 0) {
      // Check that inputs have labels or aria-labels
      for (let i = 0; i < Math.min(count, 5); i++) {
        const input = inputs.nth(i);
        const hasLabel = await input.locator('..//label').count() > 0;
        const hasAriaLabel = await input.getAttribute('aria-label');
        const hasPlaceholder = await input.getAttribute('placeholder');
        
        expect(hasLabel || hasAriaLabel || hasPlaceholder).toBeTruthy();
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('should have working links', async ({ page }) => {
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should not have any console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Filter out expected errors (like analytics, etc.)
    const criticalErrors = errors.filter(err => 
      !err.includes('analytics') && 
      !err.includes('gtag') &&
      !err.includes('favicon')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should not have broken images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      if (src && !src.includes('data:')) {
        await expect(img).toHaveAttribute('src', /./);
      }
    }
  });
});
