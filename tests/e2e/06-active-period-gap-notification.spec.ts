import { expect, test } from '../fixtures/database.fixture';
import { AuthPage } from '../pages/auth.page';

test.describe('Active Period Gap Notification', () => {
  test('shows warning when user is not in an active period', async ({
    apiMode,
    mockApi,
    page,
    registeredUser,
  }) => {
    test.skip(apiMode !== 'mock' || !mockApi, 'This scenario relies on mock API controls');

    mockApi.setPeriods([
      {
        id: 'period-past',
        name: 'January 2026',
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        transaction_count: 0,
        budget_used_percentage: 0,
      },
      {
        id: 'period-upcoming',
        name: 'March 2026',
        start_date: '2026-03-01',
        end_date: '2026-03-31',
        transaction_count: 0,
        budget_used_percentage: 0,
      },
    ]);
    mockApi.setCurrentPeriod(null);

    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login(registeredUser.email, registeredUser.password);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText('You are in a period gap').first()).toBeVisible();

    await page.getByTestId('budget-period-trigger').click();
    await expect(page.getByText('You are in a period gap').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /March 2026/i })).toBeVisible();
  });
});
