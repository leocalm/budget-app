import { expect } from 'playwright/test';
import { BasePage } from '../base.page';

export class DashboardV2Page extends BasePage {
  async goto(): Promise<void> {
    await this.page.goto('/v2/dashboard');
  }

  // -------------------------------------------------------------------------
  // Net Position Card state helpers
  // -------------------------------------------------------------------------

  /** The card is visible and has fully loaded data. */
  async expectNetPositionCardVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="net-position-card"]')).toBeVisible();
  }

  /** The skeleton loading state is shown. */
  async expectNetPositionCardLoading(): Promise<void> {
    await expect(this.page.locator('[data-testid="net-position-card-loading"]')).toBeVisible();
  }

  /**
   * The error state is shown (the card renders a centred error message with a
   * "Retry" button — no dedicated data-testid is currently set on the error
   * container, so we fall back to the visible button and error text).
   */
  async expectNetPositionCardError(): Promise<void> {
    await expect(
      this.page.getByText('Something went wrong loading your position data.')
    ).toBeVisible();
    await expect(this.page.getByRole('button', { name: /retry/i })).toBeVisible();
  }

  /** The empty state is shown when there are no accounts. */
  async expectNetPositionCardEmpty(): Promise<void> {
    await expect(
      this.page.getByText('No accounts configured yet. Add an account to see your net position.')
    ).toBeVisible();
  }

  // -------------------------------------------------------------------------
  // Page-level helpers
  // -------------------------------------------------------------------------

  /** The "no period selected" placeholder message is shown. */
  async expectNoPeriodMessage(): Promise<void> {
    await expect(
      this.page.getByText(
        'No budget period selected. Please select a period to view your dashboard.'
      )
    ).toBeVisible();
  }
}
