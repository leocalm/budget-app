import { expect, type Page } from 'playwright/test';

export class RealAccountsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/accounts');
    await expect(this.page).toHaveURL(/\/accounts/);
  }

  async createAccount(name: string, type: string, balance: string): Promise<void> {
    await this.page.getByTestId('accounts-add-button').click();
    await expect(this.page.getByTestId('account-form-drawer')).toBeVisible();

    // Select account type by clicking the matching button/option
    await this.page.getByRole('button', { name: type }).click();

    await this.page.getByTestId('account-name-input').fill(name);
    await this.page.getByTestId('account-balance-input').fill(balance);
    await this.page.getByTestId('account-form-submit').click();

    // Wait for drawer to close
    await expect(this.page.getByTestId('account-form-drawer')).not.toBeVisible();
  }

  async getNetPosition(): Promise<string> {
    const el = this.page.getByTestId('account-net-position-value');
    return (await el.textContent()) ?? '';
  }
}
