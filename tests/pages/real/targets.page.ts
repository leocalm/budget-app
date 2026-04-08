import { expect, type Page } from 'playwright/test';

export class RealTargetsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/budget');
    await expect(this.page).toHaveURL(/\/budget/);
  }

  async setTarget(categoryName: string, amount: string): Promise<void> {
    // Find the target row for this category and click the set/edit button
    const row = this.page.getByText(categoryName).locator('..');
    await row.getByRole('button').first().click();

    // Fill in the budget amount
    await this.page.getByTestId('category-budget-input').fill(amount);
    await this.page.getByTestId('category-form-submit').click();
  }

  async getTotalBudget(): Promise<string> {
    const el = this.page.getByTestId('targets-total-budget');
    return (await el.textContent()) ?? '';
  }
}
