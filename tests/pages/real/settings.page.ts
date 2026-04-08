import { expect, type Page } from 'playwright/test';

export class RealSettingsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/settings');
    await expect(this.page).toHaveURL(/\/settings/);
  }

  async exportCsv(): Promise<void> {
    await this.page.getByTestId('settings-export-csv-button').click();
  }

  async exportJson(): Promise<void> {
    await this.page.getByTestId('settings-export-json-button').click();
  }
}
