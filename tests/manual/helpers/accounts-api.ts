import { expect, type APIRequestContext, type Page } from 'playwright/test';
import { createTestUserCredentials, type TestUserCredentials } from '../../helpers/test-data';
import { e2eEnv } from '../../setup/env';

export interface RegisterAndLoginResult {
  credentials: TestUserCredentials;
  email: string;
}

/**
 * Registers a new user via the API and then logs in via the browser UI to
 * establish a session cookie in the page's request context.
 *
 * Returns the credentials and email so callers can reuse them.
 */
export async function registerAndLogin(
  request: APIRequestContext,
  page: Page
): Promise<RegisterAndLoginResult> {
  const credentials = createTestUserCredentials(`acct-api-${Date.now()}`);

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise<void>((r) => setTimeout(r, 2000 * attempt));
    }

    const res = await request.post(`${e2eEnv.apiUrl}/v2/auth/register`, {
      data: {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      },
    });

    if (res.ok() || res.status() === 409) {
      break;
    }

    const body = await res.text();
    // eslint-disable-next-line no-console
    console.error(`registerAndLogin attempt ${attempt + 1} failed: ${res.status()} ${body}`);

    if (attempt === 2) {
      throw new Error(`Failed to register user after 3 attempts: ${credentials.email}`);
    }
  }

  // Log in via browser UI to set the session cookie
  await page.goto('/auth/login');
  await page
    .getByRole('region', { name: 'Cookie consent' })
    .getByRole('button', { name: 'Accept' })
    .click({ timeout: 2000 })
    .catch(() => {});

  await page.getByTestId('login-email').fill(credentials.email);
  await page.getByTestId('login-password').fill(credentials.password);
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 });

  // Skip onboarding if needed
  if (page.url().includes('/onboarding')) {
    for (let i = 0; i < 15; i++) {
      if (!page.url().includes('/onboarding')) break;

      for (const testId of ['onboarding-go-to-dashboard', 'onboarding-skip', 'onboarding-next']) {
        const btn = page.getByTestId(testId);
        const visible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
        if (visible) {
          await btn.click();
          await page.waitForTimeout(500);
          break;
        }
      }
    }
  }

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

  return { credentials, email: credentials.email };
}

/**
 * Returns the current budget period ID by querying the API via the Vite proxy
 * (which shares cookies with the page context).
 */
export async function getCurrentPeriodId(pageRequest: APIRequestContext): Promise<string> {
  const res = await pageRequest.get(`${e2eEnv.baseUrl}/v2/periods?status=current`);
  expect(res.ok(), `GET /v2/periods failed: ${await res.text()}`).toBeTruthy();

  const body = await res.json();

  // Handle both paginated { data: [...] } and plain array responses
  const items: Array<{ id: string }> = Array.isArray(body) ? body : (body.data ?? []);

  if (items.length === 0) {
    throw new Error('No current budget period found');
  }

  return items[0].id;
}

/**
 * Returns any expense category ID from the current user's categories.
 */
export async function getDefaultCategoryId(pageRequest: APIRequestContext): Promise<string> {
  const res = await pageRequest.get(`${e2eEnv.baseUrl}/v2/categories`);
  expect(res.ok(), `GET /v2/categories failed: ${await res.text()}`).toBeTruthy();

  const body = await res.json();
  const items: Array<{ id: string; type?: string }> = Array.isArray(body)
    ? body
    : (body.data ?? []);

  if (items.length === 0) {
    throw new Error('No categories found — cannot seed transactions without a category');
  }

  return items[0].id;
}

export interface SeedTransactionOpts {
  fromAccountId: string;
  categoryId: string;
  amount: number;
  description?: string;
  date?: string;
}

/**
 * Seeds a single transaction via the API proxy.
 * `amount` is in cents (e.g., 1000 = $10.00).
 */
export async function seedTransaction(
  pageRequest: APIRequestContext,
  opts: SeedTransactionOpts
): Promise<void> {
  const res = await pageRequest.post(`${e2eEnv.baseUrl}/v2/transactions`, {
    data: {
      transactionType: 'regular',
      date: opts.date ?? new Date().toISOString().slice(0, 10),
      description: opts.description ?? 'seed',
      amount: opts.amount,
      fromAccountId: opts.fromAccountId,
      categoryId: opts.categoryId,
    },
  });

  if (!res.ok()) {
    throw new Error(`seedTransaction failed: ${res.status()} ${await res.text()}`);
  }
}
