import { expect, type Page } from 'playwright/test';

export class ForgotPasswordPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/auth/forgot-password');
    await expect(this.page.getByTestId('forgot-password-email')).toBeVisible({ timeout: 10000 });
  }

  async dismissCookieBanner(): Promise<void> {
    await this.page
      .getByRole('region', { name: 'Cookie consent' })
      .getByRole('button', { name: 'Accept' })
      .click({ timeout: 2000 })
      .catch(() => {});
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByTestId('forgot-password-email').fill(email);
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('forgot-password-submit').click();
  }

  async requestReset(email: string): Promise<void> {
    await this.goto();
    await this.dismissCookieBanner();
    await this.fillEmail(email);
    await this.submit();
  }

  async expectSentStateVisible(): Promise<void> {
    await expect(this.page.getByTestId('forgot-password-sent-title')).toBeVisible({
      timeout: 10000,
    });
  }

  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.page.getByTestId('forgot-password-submit')).toBeDisabled();
  }
}
