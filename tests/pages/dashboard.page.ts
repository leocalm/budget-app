import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  async gotoPage(): Promise<void> {
    await this.goto('/dashboard');
  }
}
