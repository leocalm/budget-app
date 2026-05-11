import { expect, type Page } from 'playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/auth/login');
    await expect(this.page.getByTestId('login-email')).toBeVisible({ timeout: 10000 });
  }

  async dismissCookieBanner(): Promise<void> {
    await this.page
      .getByRole('region', { name: 'Cookie consent' })
      .getByRole('button', { name: 'Accept' })
      .click({ timeout: 2000 })
      .catch(() => {});
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByTestId('login-email').fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByTestId('login-password').fill(password);
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('login-submit').click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.dismissCookieBanner();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async expectRedirectToDashboardOrOnboarding(): Promise<void> {
    await expect(this.page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  }

  async expectStillOnLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }

  async expectErrorAlertVisible(): Promise<void> {
    const errorLocator = this.page
      .getByRole('alert')
      .or(this.page.getByText(/invalid|incorrect|wrong|failed/i));
    await expect(errorLocator.first()).toBeVisible();
  }

  async expectNoUserSpecificMessage(): Promise<void> {
    const text = await this.page
      .getByRole('alert')
      .first()
      .textContent({ timeout: 5000 })
      .catch(() => '');
    const lower = text.toLowerCase();
    // "invalid email or password" is acceptable — it doesn't reveal which field is wrong
    // But it must NOT reveal user existence
    expect(lower).not.toContain('not found');
    expect(lower).not.toContain("doesn't exist");
    expect(lower).not.toContain('does not exist');
    expect(lower).not.toContain('no account');
    expect(lower).not.toContain('unregistered');
  }

  async expectRateLimitAlertVisible(): Promise<void> {
    await expect(this.page.getByText(/wait|too many|seconds/i).first()).toBeVisible({
      timeout: 5000,
    });
  }

  async expectAccountLockedAlertVisible(): Promise<void> {
    await expect(this.page.getByText(/locked|unlock/i).first()).toBeVisible({ timeout: 5000 });
  }

  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.page.getByTestId('login-submit')).toBeDisabled();
  }

  async expectSessionExpiredBannerVisible(): Promise<void> {
    await expect(this.page.getByText(/session expired/i)).toBeVisible({ timeout: 5000 });
  }

  // 2FA screen helpers
  async fill2FACode(code: string): Promise<void> {
    await this.page.locator('input[maxlength="6"]').fill(code);
  }

  async click2FAVerify(): Promise<void> {
    await this.page.getByRole('button', { name: /verify|confirm/i }).click();
  }

  async clickUseRecoveryCode(): Promise<void> {
    await this.page.getByText(/use.*recovery|recovery.*code/i).click();
  }

  async fillRecoveryCode(code: string): Promise<void> {
    await this.page.locator('input[maxlength="20"]').fill(code);
  }

  async expect2FAPromptVisible(): Promise<void> {
    await expect(this.page.getByText(/authenticator|two.factor|2fa/i).first()).toBeVisible({
      timeout: 10000,
    });
  }
}
