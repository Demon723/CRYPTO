import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should load login page', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Welcome back');
      await expect(page.locator('text=Sign in to your account')).toBeVisible();
    });

    test('should have login form with correct fields', async ({ page }) => {
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.click('button:has-text("Sign In")');
      const email = page.locator('input[type="email"]');
      const password = page.locator('input[type="password"]');
      await expect(email).toHaveAttribute('required');
      await expect(password).toHaveAttribute('required');
    });

    test('should have link to register page', async ({ page }) => {
      await expect(page.locator('text=Don\'t have an account?')).toBeVisible();
      await expect(page.locator('text=Sign up')).toBeVisible();
    });

    test('should have link to forgot password', async ({ page }) => {
      await expect(page.locator('text=Forgot password?')).toBeVisible();
    });

    test('should navigate to register page', async ({ page }) => {
      await page.click('text=Sign up');
      await expect(page).toHaveURL(/.*register/);
    });

    test('should show loading state on submit', async ({ page }) => {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button:has-text("Sign In")');
      await expect(page.locator('button:has-text("Signing in...")')).toBeVisible();
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('should load register page', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Create an account');
      await expect(page.locator('text=Get started with Synex')).toBeVisible();
    });

    test('should have registration form with correct fields', async ({ page }) => {
      await expect(page.locator('input[type="text"]').first()).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').last()).toBeVisible();
      await expect(page.locator('button:has-text("Sign Up")')).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await expect(page.locator('text=Already have an account?')).toBeVisible();
      await expect(page.locator('text=Sign in')).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.fill('input[type="text"]', 'Test User');
      await page.fill('input[type="email"]', 'test@example.com');
      const passwordInputs = page.locator('input[type="password"]');
      await passwordInputs.first().fill('Password123!');
      await passwordInputs.last().fill('DifferentPassword');
      await page.click('button:has-text("Sign Up")');
      await expect(page.locator('text=Create an account')).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.click('text=Sign in');
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate from home to login', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Get Started');
      await expect(page).toHaveURL(/.*login/);
    });

    test('should navigate from login to register', async ({ page }) => {
      await page.goto('/login');
      await page.click('text=Sign up');
      await expect(page).toHaveURL(/.*register/);
    });

    test('should navigate from register to login', async ({ page }) => {
      await page.goto('/register');
      await page.click('text=Sign in');
      await expect(page).toHaveURL(/.*login/);
    });
  });
});
