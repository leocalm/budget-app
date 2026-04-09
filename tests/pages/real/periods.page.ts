import { expect, type Page } from 'playwright/test';

export class RealPeriodsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/periods');
    await expect(this.page).toHaveURL(/\/periods/);
  }

  async createPeriod(name: string, startDate: string, endDate: string): Promise<void> {
    await this.page.getByTestId('periods-add-button').click();

    // Wait for drawer content
    await expect(this.page.getByTestId('period-name-input')).toBeVisible();

    await this.page.getByTestId('period-name-input').fill(name);
    await this.page.getByTestId('period-start-date').fill(startDate);

    // Switch to manual end date: click the period type Select, then pick the option
    await this.page.getByLabel('Period type', { exact: false }).first().click();
    await this.page.getByRole('option', { name: /manual/i }).click();

    await this.page.getByTestId('period-end-date').fill(endDate);
    await this.page.getByTestId('period-form-submit').click();

    // Wait for drawer to close
    await expect(this.page.getByTestId('period-name-input')).not.toBeVisible();
  }
}
