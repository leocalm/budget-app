import { createTestUserCredentials } from '../helpers/test-data';
import { e2eEnv } from '../setup/env';
import { expect, test } from './fixtures/manual.fixture';
import { RegistrationPage } from './pages/registration.page';

test.describe('Registration', () => {
  test('create a new user successfully', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-happy');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.register(credentials.name, credentials.email, credentials.password);
    await registrationPage.expectRedirectToOnboardingOrDashboard();
  });

  test('rejects registration with an empty name', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-invalid-name');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();
    await registrationPage.dismissCookieBanner();
    await registrationPage.fillName('');
    await registrationPage.fillEmail(credentials.email);
    await registrationPage.fillPassword(credentials.password);
    await registrationPage.fillConfirmPassword(credentials.password);
    await registrationPage.acceptTerms();

    await registrationPage.expectSubmitButtonDisabled();
  });

  test('rejects registration with an invalid email', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-invalid-email');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();
    await registrationPage.dismissCookieBanner();
    await registrationPage.fillName(credentials.name);
    await registrationPage.fillEmail('not-an-email');
    await registrationPage.fillPassword(credentials.password);
    await registrationPage.fillConfirmPassword(credentials.password);
    await registrationPage.acceptTerms();

    await registrationPage.expectSubmitButtonDisabled();
  });

  test('rejects registration with a weak password', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-weak-password');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();
    await registrationPage.dismissCookieBanner();
    await registrationPage.fillName(credentials.name);
    await registrationPage.fillEmail(credentials.email);
    await registrationPage.fillPassword('123');
    await registrationPage.fillConfirmPassword('123');
    await registrationPage.acceptTerms();

    await registrationPage.expectSubmitButtonDisabled();
  });

  test('rejects registration with an already registered email', async ({ page, request }) => {
    const credentials = createTestUserCredentials('manual-reg-duplicate-email');

    const firstResponse = await request.post(`${e2eEnv.apiUrl}/v2/auth/register`, {
      data: {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      },
    });
    expect(firstResponse.ok() || firstResponse.status() === 409).toBeTruthy();

    const registrationPage = new RegistrationPage(page);
    await registrationPage.register(credentials.name, credentials.email, credentials.password);

    await registrationPage.expectStillOnRegistration();
  });

  test('registration sends a welcome email (requires email sink)', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-email-check');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.register(credentials.name, credentials.email, credentials.password);
    await registrationPage.expectRedirectToOnboardingOrDashboard();

    // TODO: Add email sink assertion when email sink service is available.
    // Expected: welcome email received at credentials.email.
    // The E2E stack should include a mail sink service (e.g. Mailpit)
    // and tests should query its API to verify delivery.
  });
});
