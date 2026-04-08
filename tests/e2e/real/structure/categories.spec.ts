import { expect, test } from '../../../fixtures/real.fixture';
import { RealCategoriesPage } from '../../../pages/real/categories.page';

test.describe('Categories', () => {
  test('create expense category appears in the categories list', async ({ loggedInPage }) => {
    const categoriesPage = new RealCategoriesPage(loggedInPage);

    await categoriesPage.goto();
    await categoriesPage.createCategory('Groceries', 'expense');

    await expect(loggedInPage.getByText('Groceries')).toBeVisible();
  });

  test('create income category appears in the categories list', async ({ loggedInPage }) => {
    const categoriesPage = new RealCategoriesPage(loggedInPage);

    await categoriesPage.goto();
    await categoriesPage.createCategory('Freelance', 'income');

    await expect(loggedInPage.getByText('Freelance')).toBeVisible();
  });
});
