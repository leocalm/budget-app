import { expect, test } from '../../fixtures/auth.fixture';
import { AuthPage } from '../../pages/auth.page';

test.describe('Authentication - Mobile', () => {
  test('supports login on mobile viewport', async ({ page, registeredUser }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();

    await authPage.login(registeredUser.email, registeredUser.password);
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
