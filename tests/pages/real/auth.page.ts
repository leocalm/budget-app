import { expect, type Page } from 'playwright/test';

export class RealAuthPage {
  constructor(private readonly page: Page) {}

  /** Dismiss cookie banner if visible — needed on mobile where it covers buttons. */
  private async dismissCookieBanner(): Promise<void> {
    await this.page
      .getByRole('region', { name: 'Cookie consent' })
      .getByRole('button', { name: 'Accept' })
      .click({ timeout: 2000 })
      .catch(() => {});
  }

  async register(name: string, email: string, password: string): Promise<void> {
    await this.page.goto('/auth/register');
    await expect(this.page.getByText('Create your account')).toBeVisible();
    await this.dismissCookieBanner();
    await this.page.getByTestId('register-name').fill(name);
    await this.page.getByTestId('register-email').fill(email);
    await this.page.getByTestId('register-password').fill(password);
    await this.page.getByTestId('register-confirm-password').fill(password);
    await this.page.getByRole('checkbox').check();
    await this.page.getByTestId('register-submit').click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.goto('/auth/login');
    await this.dismissCookieBanner();
    await this.page.getByTestId('login-email').fill(email);
    await this.page.getByTestId('login-password').fill(password);
    await this.page.getByTestId('login-submit').click();
  }

  async logout(): Promise<void> {
    // Desktop: user section in sidebar
    const userSection = this.page.getByTestId('user-section');
    if (await userSection.isVisible({ timeout: 1000 }).catch(() => false)) {
      await userSection.click();
      await this.page.getByTestId('user-logout-button').click();
      return;
    }
    // Mobile: "More" in bottom nav → logout in drawer
    await this.page.getByTestId('bottom-nav-more').click();
    await this.page.getByTestId('user-logout-button').click();
  }

  async expectOnDashboardOrOnboarding(): Promise<void> {
    await expect(this.page).toHaveURL(/\/(dashboard|onboarding)/);
  }

  async expectOnLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }
}
