import { expect, type Page } from 'playwright/test';

export class RegistrationPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/auth/register');
    await expect(this.page.getByTestId('register-name')).toBeVisible({ timeout: 10000 });
  }

  async dismissCookieBanner(): Promise<void> {
    await this.page
      .getByRole('region', { name: 'Cookie consent' })
      .getByRole('button', { name: 'Accept' })
      .click({ timeout: 2000 })
      .catch(() => {});
  }

  async fillName(name: string): Promise<void> {
    await this.page.getByTestId('register-name').fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByTestId('register-email').fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByTestId('register-password').fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.page.getByTestId('register-confirm-password').fill(password);
  }

  async acceptTerms(): Promise<void> {
    await this.page.getByRole('checkbox').check();
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('register-submit').click();
  }

  async register(name: string, email: string, password: string): Promise<void> {
    await this.goto();
    await this.dismissCookieBanner();
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
    await this.acceptTerms();
    await this.submit();
  }

  async expectRedirectToOnboardingOrDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
  }

  async expectStillOnRegistration(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/register/);
  }

  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.page.getByTestId('register-submit')).toBeDisabled();
  }

  async isSubmitButtonEnabled(): Promise<boolean> {
    return this.page.getByTestId('register-submit').isEnabled();
  }
}
