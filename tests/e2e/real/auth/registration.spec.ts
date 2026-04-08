import { expect, test } from '../../../fixtures/real.fixture';
import { createTestUserCredentials } from '../../../helpers/test-data';
import { RealAuthPage } from '../../../pages/real/auth.page';

test.describe('Registration', () => {
  test('register with valid credentials redirects to onboarding', async ({ page }) => {
    const credentials = createTestUserCredentials('registration-happy-path');
    const authPage = new RealAuthPage(page);

    await authPage.register(credentials.name, credentials.email, credentials.password);

    // Dismiss cookie banner if visible
    const cookieBanner = page.getByTestId('cookie-banner-accept');
    if (await cookieBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieBanner.click();
    }

    await expect(page).toHaveURL(/\/(onboarding|dashboard)/);
  });
});
