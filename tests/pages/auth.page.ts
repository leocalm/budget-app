import { expect } from 'playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  async gotoLogin(): Promise<void> {
    await this.goto('/auth/login');
    await expect(this.page.getByRole('heading', { name: 'Welcome back!' })).toBeVisible();
  }

  async gotoRegister(): Promise<void> {
    await this.goto('/auth/register');
    await expect(this.page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async logout(): Promise<void> {
    await this.page.getByTestId('user-menu-trigger').click();
    await this.page.getByTestId('user-menu-logout').click();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.page.getByText(/invalid email or password/i)).toBeVisible();
  }
}
