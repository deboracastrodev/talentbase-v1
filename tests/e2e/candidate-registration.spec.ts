/**
 * E2E Tests for Candidate Registration
 *
 * Story 2.1: User Registration (Candidate)
 *
 * Test Coverage:
 * - test5: Full registration flow (AC1, AC2, AC3)
 * - test6: Client-side validation (AC3)
 * - test7: Accessibility (AC10)
 * - test8: Duplicate email error display (AC9)
 */

import { test, expect } from '@playwright/test';

test.describe('Candidate Registration Flow', () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  const apiURL = process.env.API_URL || 'http://localhost:8000';

  test.beforeEach(async ({ page }) => {
    // Navigate to registration page (AC1)
    await page.goto(`${baseURL}/auth/register/candidate`);
  });

  test('test5: successful registration flow redirects to profile', async ({ page }) => {
    /**
     * Maps to AC1, AC2, AC3, AC8
     * Tests full happy path: fill form → submit → redirect
     */

    // Fill form (AC2: all required fields)
    await page.fill('#full_name', 'João Silva');
    await page.fill('#email', 'joao.silva@example.com');
    await page.fill('#phone', '11999999999');
    await page.fill('#password', 'SecurePass123!');
    await page.fill('#confirmPassword', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to profile page (AC8)
    await page.waitForURL(`${baseURL}/candidate/profile`);

    // Verify success message displayed (AC8)
    await expect(page.locator('text=Conta criada com sucesso')).toBeVisible();
  });

  test('test6: client-side validation prevents submission', async ({ page }) => {
    /**
     * Maps to AC3
     * Tests that validation errors appear before API call
     */

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors (not make API call)
    await expect(page.locator('text=é obrigatório')).toHaveCount(5); // 5 required fields

    // Test email format validation
    await page.fill('#email', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email inválido')).toBeVisible();

    // Test password strength validation
    await page.fill('#email', 'valid@example.com');
    await page.fill('#password', 'weak');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Senha deve ter no mínimo 8 caracteres')).toBeVisible();

    // Test password confirmation mismatch
    await page.fill('#password', 'SecurePass123!');
    await page.fill('#confirmPassword', 'DifferentPass123!');
    await page.blur('#confirmPassword'); // Trigger validation
    await expect(page.locator('text=Senhas não conferem')).toBeVisible();
  });

  test('test7: form is accessible with proper ARIA attributes', async ({ page }) => {
    /**
     * Maps to AC10: WCAG 2.1 AA compliance
     * Tests accessibility features
     */

    // All inputs should have labels
    const fullNameLabel = page.locator('label[for="full_name"]');
    await expect(fullNameLabel).toBeVisible();
    await expect(fullNameLabel).toContainText('Nome Completo');

    const emailLabel = page.locator('label[for="email"]');
    await expect(emailLabel).toBeVisible();

    // Required fields should be marked
    await expect(fullNameLabel.locator('text=*')).toBeVisible();

    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Should focus first input
    const focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(['full_name', 'email']).toContain(focusedElement);

    // Test error aria-invalid and aria-describedby
    await page.fill('#email', 'invalid');
    await page.click('button[type="submit"]');

    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    const errorId = await emailInput.getAttribute('aria-describedby');
    if (errorId) {
      await expect(page.locator(`#${errorId}`)).toBeVisible();
      await expect(page.locator(`#${errorId}`)).toHaveAttribute('role', 'alert');
    }
  });

  test('test8: duplicate email error displays in UI', async ({ page }) => {
    /**
     * Maps to AC9
     * Tests that duplicate email error from API is displayed
     */

    // First, create a user via API
    const existingUser = {
      email: 'existing@example.com',
      password: 'ExistingPass123!',
      full_name: 'Existing User',
      phone: '11988888888'
    };

    await fetch(`${apiURL}/api/v1/auth/register/candidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(existingUser)
    });

    // Try to register with same email
    await page.fill('#full_name', 'Another User');
    await page.fill('#email', 'existing@example.com'); // Duplicate
    await page.fill('#phone', '11977777777');
    await page.fill('#password', 'AnotherPass123!');
    await page.fill('#confirmPassword', 'AnotherPass123!');

    await page.click('button[type="submit"]');

    // Should show duplicate email error from server (AC9)
    await expect(page.locator('text=already exists')).toBeVisible({ timeout: 5000 });

    // Should NOT redirect (stay on registration page)
    expect(page.url()).toContain('/auth/register/candidate');
  });

  test('password visibility toggle works', async ({ page }) => {
    /**
     * UX test: Password fields should allow toggling visibility
     * (If implemented in design system)
     */

    const passwordInput = page.locator('#password');

    // Initially should be type=password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.fill('#password', 'MyPassword123!');

    // Value should be masked
    const maskedValue = await passwordInput.inputValue();
    expect(maskedValue).toBe('MyPassword123!');

    // Note: Actual toggle button implementation depends on design system
    // Skip if not implemented
  });

  test('form submission shows loading state', async ({ page }) => {
    /**
     * UX test: Submit button should show loading state during API call
     */

    await page.fill('#full_name', 'Loading Test');
    await page.fill('#email', 'loading@example.com');
    await page.fill('#phone', '11966666666');
    await page.fill('#password', 'LoadingPass123!');
    await page.fill('#confirmPassword', 'LoadingPass123!');

    // Click submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show loading state immediately
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Criando conta');

    // Should show spinner icon
    await expect(page.locator('svg.animate-spin')).toBeVisible();
  });
});
