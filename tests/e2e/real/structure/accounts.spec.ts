import { expect, test } from '../../../fixtures/real.fixture';
import { RealAccountsPage } from '../../../pages/real/accounts.page';

test.describe('Accounts', () => {
  test('create account appears in the accounts list', async ({ loggedInPage }) => {
    const accountsPage = new RealAccountsPage(loggedInPage);

    await accountsPage.goto();
    await accountsPage.createAccount('My Checking', 'Checking', '1500');

    await expect(loggedInPage.getByText('My Checking')).toBeVisible();
  });
});
