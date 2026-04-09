import { expect, type Page } from 'playwright/test';

export class RealDashboardPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async getSpent(): Promise<string> {
    const el = this.page.getByTestId('current-period-spent-value');
    return (await el.textContent()) ?? '';
  }

  async getNetPosition(): Promise<string> {
    const el = this.page.getByTestId('net-position-total-value');
    return (await el.textContent()) ?? '';
  }

  async getIncome(): Promise<string> {
    const el = this.page.getByTestId('cash-flow-income-value');
    return (await el.textContent()) ?? '';
  }
}
