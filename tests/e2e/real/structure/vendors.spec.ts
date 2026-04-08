import { expect, test } from '../../../fixtures/real.fixture';
import { RealVendorsPage } from '../../../pages/real/vendors.page';

test.describe('Vendors', () => {
  test('create vendor appears in the vendors list', async ({ loggedInPage }) => {
    const vendorsPage = new RealVendorsPage(loggedInPage);

    await vendorsPage.goto();
    await vendorsPage.createVendor('Albert Heijn');

    await expect(loggedInPage.getByText('Albert Heijn')).toBeVisible();
  });
});
