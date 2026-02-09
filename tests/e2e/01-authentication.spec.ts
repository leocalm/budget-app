import { expect, test } from '../fixtures/auth.fixture';
import { AuthPage } from '../pages/auth.page';

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();

    await authPage.login('invalid@example.test', 'wrong-password');
    await authPage.expectLoginError();
  });

  test('allows login with isolated fixture user and supports logout', async ({
    page,
    registeredUser,
  }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();

    await authPage.login(registeredUser.email, registeredUser.password);
    await expect(page).toHaveURL(/\/dashboard$/);

    await authPage.logout();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('keeps session after page reload', async ({ authenticatedPage }) => {
    await authenticatedPage.reload();
    await expect(authenticatedPage).toHaveURL(/\/dashboard$/);
  });
});
