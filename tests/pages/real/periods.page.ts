import { expect, type Page } from 'playwright/test';

export class RealPeriodsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/periods');
    await expect(this.page).toHaveURL(/\/periods/);
  }

  async createPeriod(name: string, startDate: string, endDate: string): Promise<void> {
    await this.page.getByRole('button', { name: /add|create|new/i }).click();
    await expect(this.page.getByTestId('period-form-drawer')).toBeVisible();

    await this.page.getByTestId('period-name-input').fill(name);
    await this.page.getByTestId('period-start-date').fill(startDate);
    await this.page.getByTestId('period-end-date').fill(endDate);
    await this.page.getByTestId('period-form-submit').click();

    await expect(this.page.getByTestId('period-form-drawer')).not.toBeVisible();
  }
}
