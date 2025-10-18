import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Sign In')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In')
    await expect(page.locator('a[href="/auth/register"]')).toContainText('Create an account')
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message for invalid credentials
    await expect(page.locator('.notification-error')).toBeVisible()
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.click('a[href="/auth/register"]')

    await expect(page).toHaveURL('/auth/register')
    await expect(page.locator('h1')).toContainText('Create Account')
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.click('a[href="/auth/forgot-password"]')

    await expect(page).toHaveURL('/auth/forgot-password')
    await expect(page.locator('h1')).toContainText('Reset Password')
  })
})

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register')
  })

  test('should display registration form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Create Account')
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="lastName"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')

    await expect(page.locator('text=First name is required')).toBeVisible()
    await expect(page.locator('text=Last name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show error when passwords do not match', async ({ page }) => {
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[type="email"]', 'john.doe@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'differentpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('should show error for password too short', async ({ page }) => {
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[type="email"]', 'john.doe@example.com')
    await page.fill('input[type="password"]', '123')
    await page.fill('input[name="confirmPassword"]', '123')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.click('a[href="/auth/login"]')

    await expect(page).toHaveURL('/auth/login')
    await expect(page.locator('h1')).toContainText('Sign In')
  })
})

test.describe('Password Reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/forgot-password')
  })

  test('should display forgot password form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Reset Password')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Send Reset Link')
  })

  test('should show validation error for empty email', async ({ page }) => {
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Email is required')).toBeVisible()
  })

  test('should show success message after submitting valid email', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')

    await expect(page.locator('.notification-success')).toBeVisible()
    await expect(page.locator('text=Password reset link has been sent')).toBeVisible()
  })

  test('should navigate back to login', async ({ page }) => {
    await page.click('a[href="/auth/login"]')

    await expect(page).toHaveURL('/auth/login')
  })
})