import { BasePage } from './base.page';

export class CategoriesPage extends BasePage {
  async gotoPage(): Promise<void> {
    await this.goto('/categories');
  }
}
