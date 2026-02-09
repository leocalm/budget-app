import { expect, type Page } from 'playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async expectPath(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(path)}$`));
  }

  async expectAuthenticatedAppVisible(): Promise<void> {
    await expect(this.page.getByTestId('app-shell-main')).toBeVisible();
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
