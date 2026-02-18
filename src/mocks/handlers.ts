import { delay, http, HttpResponse } from 'msw';
import {
  mockAccounts as initialAccounts,
  mockCategories as initialCategories,
  initialTransactions,
  initialVendors,
} from './budgetData';

// --- IN-MEMORY DATABASE STATE ---
// This state persists as long as the browser tab is open.
const db = {
  accounts: [...initialAccounts],
  transactions: [...initialTransactions],
  categories: [...initialCategories],
  vendors: [...initialVendors],
  periods: [
    {
      id: 'per-1',
      name: 'January 2026',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    },
  ],
  overlays: [] as any[],
  schedule: null as any,
  settings: {
    id: 'settings-1',
    theme: 'auto' as const,
    language: 'en' as const,
    defaultCurrencyId: 'cur-1',
    budgetStabilityToleranceBasisPoints: 1000,
    updatedAt: new Date().toISOString(),
  },
};

const getScenario = (request: Request) => {
  try {
    const url = new URL(request.url);
    return {
      isError: url.searchParams.get('scenario') === 'error',
      isEmpty: url.searchParams.get('scenario') === 'empty',
      isLoading: url.searchParams.get('scenario') === 'loading',
    };
  } catch {
    return { isError: false, isEmpty: false, isLoading: false };
  }
};

export const handlers = [
  // --- AUTH ---
  http.get('/api/v1/users/me', async ({ request }) => {
    const { isError, isLoading } = getScenario(request);
    if (isLoading) {
      await delay('infinite');
    }
    if (isError) {
      return new HttpResponse(null, { status: 500 });
    }
    return HttpResponse.json({ id: '1', email: 'designer@example.com', name: 'Design Team' });
  }),

  // --- ACCOUNTS ---
  http.get('/api/v1/accounts', async ({ request }) => {
    const { isError, isEmpty, isLoading } = getScenario(request);
    if (isLoading) {
      await delay('infinite');
    }
    if (isError) {
      return new HttpResponse(null, { status: 500 });
    }
    if (isEmpty) {
      return HttpResponse.json([]);
    }
    return HttpResponse.json(db.accounts);
  }),

  http.post('/api/v1/accounts', async ({ request }) => {
    const data = (await request.json()) as any;
    const item = {
      ...data,
      id: `acc-${Math.random().toString(36).substr(2, 9)}`,
      balance: data.initialBalance || 0,
      balancePerDay: [],
      balanceChangeThisPeriod: 0,
      transactionCount: 0,
      currency: { id: 'cur-1', name: 'Euro', symbol: '€', currency: 'EUR', decimalPlaces: 2 },
    };
    db.accounts.push(item);
    return HttpResponse.json(item);
  }),

  http.put('/api/v1/accounts/:id', async ({ params, request }) => {
    const { id } = params;
    const data = (await request.json()) as any;
    const index = db.accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      db.accounts[index] = { ...db.accounts[index], ...data };
      return HttpResponse.json(db.accounts[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/v1/accounts/:id', async ({ params }) => {
    const { id } = params;
    db.accounts = db.accounts.filter((a) => a.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // --- TRANSACTIONS ---
  http.get('/api/v1/transactions', async ({ request }) => {
    const { isError, isEmpty, isLoading } = getScenario(request);
    if (isLoading) {
      await delay('infinite');
    }
    if (isError) {
      return new HttpResponse(null, { status: 500 });
    }
    if (isEmpty) {
      return HttpResponse.json([]);
    }
    return HttpResponse.json(db.transactions);
  }),

  http.post('/api/v1/transactions', async ({ request }) => {
    const data = (await request.json()) as any;
    const fromAcc = db.accounts.find((a) => a.id === data.from_account_id) || db.accounts[0];
    const cat = db.categories.find((c) => c.id === data.category_id) || db.categories[0];

    const item = {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      description: data.description,
      amount: data.amount,
      occurredAt: data.occurred_at,
      category: cat,
      fromAccount: fromAcc,
      toAccount: data.to_account_id
        ? (db.accounts.find((a) => a.id === data.to_account_id) ?? null)
        : null,
      vendor: data.vendor_id ? (db.vendors.find((v) => v.id === data.vendor_id) ?? null) : null,
    };
    db.transactions.unshift(item);
    return HttpResponse.json(item);
  }),

  http.put('/api/v1/transactions/:id', async ({ params, request }) => {
    const { id } = params;
    const data = (await request.json()) as any;
    const index = db.transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      db.transactions[index] = { ...db.transactions[index], ...data };
      return HttpResponse.json(db.transactions[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/v1/transactions/:id', async ({ params }) => {
    const { id } = params;
    db.transactions = db.transactions.filter((t) => t.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // --- CATEGORIES ---
  http.get('/api/v1/categories', async () => {
    return HttpResponse.json(
      db.categories.map((cat) => ({
        ...cat,
        usedInPeriod: 5000,
        differenceVsAveragePercentage: 5,
        transactionCount: 12,
      }))
    );
  }),

  http.post('/api/v1/categories', async ({ request }) => {
    const data = (await request.json()) as any;
    const item = {
      ...data,
      id: `cat-${Math.random().toString(36).substr(2, 9)}`,
    };
    db.categories.push(item);
    return HttpResponse.json(item);
  }),

  http.put('/api/v1/categories/:id', async ({ params, request }) => {
    const { id } = params;
    const data = (await request.json()) as any;
    const index = db.categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      db.categories[index] = { ...db.categories[index], ...data };
      return HttpResponse.json(db.categories[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/v1/categories/:id', async ({ params }) => {
    const { id } = params;
    db.categories = db.categories.filter((c) => c.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // --- VENDORS ---
  http.get('/api/v1/vendors', async () => {
    return HttpResponse.json(
      db.vendors.map((v) => ({
        ...v,
        transactionCount: 5,
        totalSpent: 15000,
      }))
    );
  }),

  http.post('/api/v1/vendors', async ({ request }) => {
    const data = (await request.json()) as any;
    const item = {
      ...data,
      id: `ven-${Math.random().toString(36).substr(2, 9)}`,
    };
    db.vendors.push(item);
    return HttpResponse.json(item);
  }),

  // --- OVERLAYS ---
  http.get('/api/v1/overlays', () => HttpResponse.json(db.overlays)),

  http.post('/api/v1/overlays', async ({ request }) => {
    const data = (await request.json()) as any;
    const item = { ...data, id: `ovl-${Math.random().toString(36).substr(2, 9)}` };
    db.overlays.push(item);
    return HttpResponse.json(item);
  }),

  http.delete('/api/v1/overlays/:id', async ({ params }) => {
    const { id } = params;
    db.overlays = db.overlays.filter((o) => o.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // --- BUDGET PERIODS ---
  http.get('/api/v1/budget_period/current', () => HttpResponse.json(db.periods[0])),
  http.get('/api/v1/budget_period', () => HttpResponse.json(db.periods)),

  http.post('/api/v1/budget_period', async ({ request }) => {
    const data = (await request.json()) as any;
    const id = `per-${Math.random().toString(36).substr(2, 9)}`;
    db.periods.push({ ...data, id });
    return HttpResponse.json(id);
  }),

  http.delete('/api/v1/budget_period/:id', async ({ params }) => {
    const { id } = params;
    db.periods = db.periods.filter((p) => p.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // --- SETTINGS ---
  http.get('/api/v1/settings', () => HttpResponse.json(db.settings)),
  http.put('/api/v1/settings', async ({ request }) => {
    const data = (await request.json()) as any;
    db.settings = { ...db.settings, ...data, updatedAt: new Date().toISOString() };
    return HttpResponse.json(db.settings);
  }),

  // --- DASHBOARD ---
  http.get('/api/v1/dashboard/recent-transactions', () =>
    HttpResponse.json(db.transactions.slice(0, 5))
  ),
  http.get('/api/v1/dashboard/total-assets', () => {
    const total = db.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    return HttpResponse.json({ totalAssets: total });
  }),
  http.get('/api/v1/dashboard/net-position', () => {
    const liquidBalance = db.accounts
      .filter((account) =>
        ['Checking', 'Wallet', 'Allowance'].includes(
          (account as { accountType: string }).accountType
        )
      )
      .reduce((sum, account) => sum + ((account as { balance?: number }).balance || 0), 0);

    const protectedBalance = db.accounts
      .filter((account) => (account as { accountType: string }).accountType === 'Savings')
      .reduce((sum, account) => sum + ((account as { balance?: number }).balance || 0), 0);

    const debtBalance = db.accounts
      .filter((account) => (account as { accountType: string }).accountType === 'CreditCard')
      .reduce((sum, account) => sum + ((account as { balance?: number }).balance || 0), 0);

    return HttpResponse.json({
      totalNetPosition: liquidBalance + protectedBalance + debtBalance,
      changeThisPeriod: 0,
      liquidBalance,
      protectedBalance,
      debtBalance,
      accountCount: db.accounts.length,
    });
  }),

  http.get('/api/v1/dashboard/spent-per-category', () =>
    HttpResponse.json([
      { categoryName: 'Food', budgetedValue: 500, amountSpent: 250, percentageSpent: 50 },
    ])
  ),
  http.get('/api/v1/dashboard/monthly-burn-in', () =>
    HttpResponse.json({ totalBudget: 2000, spentBudget: 850, currentDay: 15, daysInPeriod: 30 })
  ),
  http.get('/api/v1/dashboard/month-progress', () =>
    HttpResponse.json({
      currentDate: '2026-01-15',
      daysInPeriod: 31,
      remainingDays: 16,
      daysPassedPercentage: 48,
    })
  ),
  http.get('/api/v1/dashboard/budget-per-day', () =>
    HttpResponse.json([{ accountName: 'Checking', date: '2026-01-01', balance: 5000 }])
  ),
  http.get('/api/v1/dashboard/budget-stability', () =>
    HttpResponse.json({
      withinTolerancePercentage: 78,
      periodsWithinTolerance: 18,
      totalClosedPeriods: 23,
      recentClosedPeriods: [
        { periodId: 'period-1', isOutsideTolerance: false },
        { periodId: 'period-2', isOutsideTolerance: true },
        { periodId: 'period-3', isOutsideTolerance: false },
        { periodId: 'period-4', isOutsideTolerance: true },
        { periodId: 'period-5', isOutsideTolerance: false },
        { periodId: 'period-6', isOutsideTolerance: false },
      ],
    })
  ),

  // --- TWO-FACTOR AUTHENTICATION ---
  http.get('/api/v1/two-factor/status', () => {
    return HttpResponse.json({
      enabled: db.schedule === '2fa-enabled',
      hasBackupCodes: db.schedule === '2fa-enabled',
      backupCodesRemaining: 10,
    });
  }),

  http.post('/api/v1/two-factor/setup', async () => {
    return HttpResponse.json({
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAYAAAB97S9mAAAACXBIWXMAAAsTAAALEwEAmpwYAAABy0lEQVR4nO2YwY7CMAxD7f//Z++Iu0pI2mSAtp6REAnatE6beAnZ7/f7fX7id8BvA8YIxhhjDGOMMcb8N8Y8X9lsAnvGMEYwxhhjGGOMMeYTMfP5fDInZoxgjDGMMcYYY8wnYsaYOTFjBGOMMcYYxhhjzCdi5sSMEawRjDHGGMMYY8wnYubEjBGMEawRjDHGGMMY84mYOTFjBGsEY4wxxhjGGGM+ETOnyAnWCMYYYwwRxvSIsfbeExgjGGOMMcYYxhhjPhEzp8gJ1gjGGMMMEcb0iLH23hMYIxhjjDHGGMMM84mYOTFjBGsEY4wxxhjGGGM+ETOnyAnWCMYYYwwRxvSIsfbeExgjGGOMMcYYxhhjPhEzp8gJ1gjGGMMMEcb0iLH23hMYIxhjjDHGGMMM84mYOTFjBGsEY4wxxhjGGGM+ETOnyAnWCMYYYwwRxvSIsfbeExgjGGOMMcYYxhhjPhEzp8gJ1gjGGMMMEcb0iLH23hMYIxhjjDHGGMMM84mYOTFjBGsEY4wxxhjGGGM+ETOnyAnWCMYYYwwRxvSIsfbeExgjGGOMMcYYxhhjPhEzp8gJ1gjGGMMMEcb0iLH23hMYIxhjjDHGGMMM84mYOTFjBGsEY4wxxhjGGGM+ETOnyAnWCMYYYwwRxvSIsfbeExgjGGOMMcYYxhhjPhEzp8gJ1gjGGMMMEcb0iLH23hMYIxhjjDHGGMMM84mYOTFjBGsEY4wxxhjGGGM+ETOnyAnWCMYYYwwRxvSIsfbeExgjGGOMMcYYxhhjPhEzp8gJ1gjGGMMMEcb0iLH23hMYIxhjjDHGGMMM84mYOTFjBGsEY4wxxhjGGGM+EX8At9m9InKPhmMAAAAASUVORK5CYII=',
      backupCodes: ['1234-5678', '8765-4321', '1111-2222', '3333-4444', '5555-6666'],
    });
  }),

  http.post('/api/v1/two-factor/verify', async ({ request }) => {
    const { code } = (await request.json()) as any;
    if (code === '123456') {
      db.schedule = '2fa-enabled';
      return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ message: 'Invalid verification code. Use 123456' }, { status: 400 });
  }),

  http.delete('/api/v1/two-factor/disable', async () => {
    db.schedule = null;
    return new HttpResponse(null, { status: 204 });
  }),

  // Misc
  http.get('/api/v1/currency', () =>
    HttpResponse.json([
      { id: 'cur-1', name: 'Euro', symbol: '€', currency: 'EUR', decimalPlaces: 2 },
    ])
  ),
  http.get('/api/v1/budget_period/schedule', () => HttpResponse.json(db.schedule)),
  http.get('/api/v1/budget_period/gaps', () =>
    HttpResponse.json({ unassignedCount: 0, transactions: [] })
  ),

  // Catch-all
  http.all(/\/api\/.*/, ({ request }) => {
    void request;
    return undefined;
  }),
];
