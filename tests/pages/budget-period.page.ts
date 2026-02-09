import { BasePage } from './base.page';

export class BudgetPeriodPage extends BasePage {
  async gotoPage(): Promise<void> {
    await this.goto('/periods');
  }
}
