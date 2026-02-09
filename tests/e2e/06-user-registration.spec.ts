import { expect, test } from '../fixtures/auth.fixture';
import { AuthPage } from '../pages/auth.page';

test.describe('User Registration', () => {
  test('displays register form with all required fields', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();

    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  });

  test('shows validation errors for invalid inputs', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();

    // Submit empty form
    await page.getByRole('button', { name: 'Register' }).click();

    // Check for validation errors
    await expect(page.getByText(/name must have at least 2 letters/i)).toBeVisible();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();

    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByLabel('Email').fill('john@example.test');
    await page.getByLabel('Password', { exact: true }).first().fill('SecurePass123!@#');
    await page.getByLabel('Confirm Password').fill('DifferentPass123!@#');

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('disables form while registration is in progress', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();

    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByLabel('Email').fill('john@example.test');
    await page.getByLabel('Password', { exact: true }).first().fill('SecurePass123!@#');
    await page.getByLabel('Confirm Password').fill('SecurePass123!@#');

    const registerButton = page.getByRole('button', { name: 'Register' });

    // Start registration
    await registerButton.click();

    // Form fields should be disabled during submission
    await expect(page.getByLabel('Full Name')).toBeDisabled();
    await expect(page.getByLabel('Email')).toBeDisabled();

    // Wait for request to complete
    await page.waitForNavigation();
  });

  test('allows new user registration and redirects to dashboard', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();

    const uniqueEmail = `user-${Date.now()}@example.test`;
    await authPage.register('Jane Smith', uniqueEmail, 'SecurePassword123!@#');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('shows error when trying to register with existing email', async ({
    page,
    registeredUser,
  }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();

    // Try to register with email that already exists
    await authPage.register('Another User', registeredUser.email, 'SecurePassword123!@#');

    // Should show error about email already being registered
    await authPage.expectRegistrationError(/already registered|email.*use/i);
  });

  test('shows error for weak password', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();

    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.test');
    await page.getByLabel('Password', { exact: true }).first().fill('abc123');

    await page.getByRole('button', { name: 'Register' }).click();

    // Should show password strength validation error
    await expect(page.getByText(/password is not strong enough/i)).toBeVisible();
  });

  test('displays password strength feedback', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();

    const passwordInput = page.getByLabel('Password', { exact: true }).first();
    await passwordInput.fill('weak');

    // Should show weak password feedback
    await expect(page.getByText(/weak password|very weak/i)).toBeVisible();

    // Clear and enter a strong password
    await passwordInput.fill('');
    await passwordInput.fill('SuperSecurePassword123!@#$%');

    // Should show strong password feedback
    await expect(page.getByText(/good password|very strong|strong/i)).toBeVisible();
  });

  test('has link to login page', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoRegister();

    const loginLink = page.getByRole('link', { name: /login/i });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('redirects authenticated users away from register page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/auth/register');
    // Should redirect to dashboard since already authenticated
    await expect(authenticatedPage).toHaveURL(/\/dashboard$/);
  });
});
