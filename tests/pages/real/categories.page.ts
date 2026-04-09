import { expect, type Page } from 'playwright/test';

const TYPE_LABELS: Record<string, string> = {
  income: 'Incoming',
  expense: 'Outgoing',
  transfer: 'Transfer',
};

export class RealCategoriesPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/categories');
    await expect(this.page).toHaveURL(/\/categories/);
  }

  async createCategory(name: string, type: 'income' | 'expense' | 'transfer'): Promise<void> {
    await this.page.getByTestId('categories-add-button').click();

    // Wait for drawer content to appear
    await expect(this.page.getByTestId('category-name-input')).toBeVisible();

    await this.page.getByTestId('category-name-input').fill(name);

    // Select type via the custom button selector (Incoming/Outgoing labels)
    const label = TYPE_LABELS[type] ?? type;
    await this.page.getByTestId('category-type-select').getByText(label).click();

    await this.page.getByTestId('category-form-submit').click();

    // Wait for drawer to close
    await expect(this.page.getByTestId('category-name-input')).not.toBeVisible();
  }
}
