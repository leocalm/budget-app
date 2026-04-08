import { expect, type Page } from 'playwright/test';

export class RealAuthPage {
  constructor(private readonly page: Page) {}

  async register(name: string, email: string, password: string): Promise<void> {
    await this.page.goto('/auth/register');
    await expect(this.page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    await this.page.getByTestId('register-name').fill(name);
    await this.page.getByTestId('register-email').fill(email);
    await this.page.getByTestId('register-password').fill(password);
    await this.page.getByTestId('register-confirm-password').fill(password);
    await this.page.getByTestId('register-submit').click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.goto('/auth/login');
    await this.page.getByTestId('login-email').fill(email);
    await this.page.getByTestId('login-password').fill(password);
    await this.page.getByTestId('login-submit').click();
  }

  async logout(): Promise<void> {
    await this.page.getByTestId('user-menu-trigger').click();
    await this.page.getByTestId('user-menu-logout').click();
  }

  async expectOnDashboardOrOnboarding(): Promise<void> {
    await expect(this.page).toHaveURL(/\/(dashboard|onboarding)/);
  }

  async expectOnLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }
}
