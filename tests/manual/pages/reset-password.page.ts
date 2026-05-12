import { expect, type Page } from 'playwright/test';

export class ResetPasswordPage {
  constructor(private readonly page: Page) {}

  async gotoWithToken(token: string): Promise<void> {
    await this.page.goto(`/auth/reset-password?token=${token}`);
    await expect(this.page.getByTestId('reset-password-new-password')).toBeVisible({
      timeout: 10000,
    });
  }

  async fillNewPassword(password: string): Promise<void> {
    await this.page.getByTestId('reset-password-new-password').fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.page.getByTestId('reset-password-confirm-password').fill(password);
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('reset-password-submit').click();
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await this.gotoWithToken(token);
    await this.fillNewPassword(password);
    await this.fillConfirmPassword(password);
    await this.submit();
  }

  async expectSuccessStateVisible(): Promise<void> {
    await expect(this.page.getByTestId('reset-password-success-title')).toBeVisible({
      timeout: 10000,
    });
  }

  async expectInvalidLinkStateVisible(): Promise<void> {
    await expect(this.page.getByTestId('reset-password-invalid-title')).toBeVisible({
      timeout: 10000,
    });
  }
}
