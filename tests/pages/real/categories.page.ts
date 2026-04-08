import { expect, type Page } from 'playwright/test';

export class RealCategoriesPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/categories');
    await expect(this.page).toHaveURL(/\/categories/);
  }

  async createCategory(name: string, type: 'income' | 'expense' | 'transfer'): Promise<void> {
    await this.page.getByRole('button', { name: /add|create|new/i }).click();
    await expect(this.page.getByTestId('category-form-drawer')).toBeVisible();

    await this.page.getByTestId('category-name-input').fill(name);

    // Select the type via the segmented control / radio
    const typeControl = this.page.getByTestId('category-type-select');
    await typeControl.getByText(type, { exact: false }).click();

    await this.page.getByTestId('category-form-submit').click();
    await expect(this.page.getByTestId('category-form-drawer')).not.toBeVisible();
  }
}
