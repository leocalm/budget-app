import { expect, test } from '../../../fixtures/real.fixture';
import { RealPeriodsPage } from '../../../pages/real/periods.page';

test.describe('Periods', () => {
  test('create period appears in the periods list', async ({ loggedInPage }) => {
    const periodsPage = new RealPeriodsPage(loggedInPage);

    await periodsPage.goto();
    await periodsPage.createPeriod('April 2026', '2026-04-01', '2026-04-30');

    await expect(loggedInPage.getByText('April 2026')).toBeVisible();
  });
});
