import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import { render, screen } from '@/test-utils';
import { Dashboard } from './Dashboard';

const useCurrentBudgetPeriodMock = vi.hoisted(() => vi.fn());
const useSpentPerCategoryMock = vi.hoisted(() => vi.fn());
const useMonthlyBurnInMock = vi.hoisted(() => vi.fn());
const useMonthProgressMock = vi.hoisted(() => vi.fn());
const useBudgetPerDayMock = vi.hoisted(() => vi.fn());
const useRecentTransactionsMock = vi.hoisted(() => vi.fn());
const useTotalAssetsMock = vi.hoisted(() => vi.fn());
const useAccountsMock = vi.hoisted(() => vi.fn());

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { status?: string }) => {
      const translations: Record<string, string> = {
        'dashboard.title': 'Financial Dashboard',
        'dashboard.stats.remainingBudget.label': 'Remaining Budget',
        'dashboard.stats.totalAssets.label': 'Total Assets',
        'dashboard.stats.avgDailySpend.label': 'Avg. Daily Spend',
        'dashboard.stats.monthProgress.label': 'Month Progress',
        'dashboard.charts.balanceOverTime.title': 'Balance Over Time',
        'dashboard.charts.topCategories.title': 'Top Categories',
        'dashboard.recentActivity.title': 'Recent Activity',
        'dashboard.locked.status.notConfigured': 'Not configured',
        'dashboard.locked.status.noActivePeriod': 'No active period',
        'dashboard.locked.requirement.notConfigured':
          'Set up a budget period to display dashboard data.',
        'dashboard.locked.requirement.noActivePeriod':
          'Create or adjust periods so one period is active today.',
        'dashboard.locked.configure': 'Configure',
      };

      if (key === 'dashboard.locked.statusLabel') {
        return `Status: ${options?.status ?? ''}`;
      }

      return translations[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
}));

vi.mock('@/hooks/useDisplayCurrency', () => ({
  useDisplayCurrency: () => ({ currency: 'EUR', decimalPlaces: 2 }),
}));

vi.mock('@/hooks/useBudget', () => ({
  useCurrentBudgetPeriod: () => useCurrentBudgetPeriodMock(),
}));

vi.mock('@/hooks/useDashboard', () => ({
  useSpentPerCategory: () => useSpentPerCategoryMock(),
  useMonthlyBurnIn: () => useMonthlyBurnInMock(),
  useMonthProgress: () => useMonthProgressMock(),
  useBudgetPerDay: () => useBudgetPerDayMock(),
  useRecentTransactions: () => useRecentTransactionsMock(),
  useTotalAssets: () => useTotalAssetsMock(),
}));

vi.mock('@/hooks/useAccounts', () => ({
  useAccounts: () => useAccountsMock(),
}));

vi.mock('@/components/BudgetPeriodSelector', () => ({
  PeriodHeaderControl: () => <div>PeriodHeaderControl</div>,
}));

vi.mock('@/components/Dashboard/ActiveOverlayBanner', () => ({
  ActiveOverlayBanner: () => <div>ActiveOverlayBanner</div>,
}));

vi.mock('@/components/Dashboard/BalanceLineChartCard', () => ({
  BalanceLineChartCard: () => <div>BalanceLineChartCard</div>,
}));

vi.mock('@/components/Dashboard/RecentTransactionsCard', () => ({
  RecentTransactionsCard: () => <div>RecentTransactionsCard</div>,
}));

vi.mock('@/components/Dashboard/StatCard', () => ({
  StatCard: () => <div>StatCard</div>,
}));

vi.mock('@/components/Dashboard/TopCategoriesChart', () => ({
  TopCategoriesChart: () => <div>TopCategoriesChart</div>,
}));

describe('Dashboard locked state', () => {
  it('renders all dashboard cards as locked when no period is configured', () => {
    useCurrentBudgetPeriodMock.mockReturnValue({ data: null, error: null, isFetched: false });
    useSpentPerCategoryMock.mockReturnValue({ data: [], isLoading: false });
    useMonthlyBurnInMock.mockReturnValue({ data: null, isLoading: false });
    useMonthProgressMock.mockReturnValue({ data: null, isLoading: false });
    useBudgetPerDayMock.mockReturnValue({ data: [], isLoading: false });
    useRecentTransactionsMock.mockReturnValue({ data: [] });
    useTotalAssetsMock.mockReturnValue({ data: { totalAssets: 0 }, isLoading: false });
    useAccountsMock.mockReturnValue({ data: [] });

    render(
      <MemoryRouter>
        <Dashboard selectedPeriodId={null} />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Status: Not configured')).toHaveLength(7);

    const configureLinks = screen.getAllByRole('link', { name: 'Configure' });
    expect(configureLinks).toHaveLength(7);
    configureLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/periods');
    });
  });

  it('renders locked cards with no active period status when current period is missing', () => {
    useCurrentBudgetPeriodMock.mockReturnValue({
      data: null,
      isFetched: true,
      error: new ApiError('Not found', 404, '/api/budget_period/current'),
    });
    useSpentPerCategoryMock.mockReturnValue({ data: [], isLoading: false });
    useMonthlyBurnInMock.mockReturnValue({ data: null, isLoading: false });
    useMonthProgressMock.mockReturnValue({ data: null, isLoading: false });
    useBudgetPerDayMock.mockReturnValue({ data: [], isLoading: false });
    useRecentTransactionsMock.mockReturnValue({ data: [] });
    useTotalAssetsMock.mockReturnValue({ data: { totalAssets: 0 }, isLoading: false });
    useAccountsMock.mockReturnValue({ data: [] });

    render(
      <MemoryRouter>
        <Dashboard selectedPeriodId="period-1" />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Status: No active period')).toHaveLength(7);
    expect(screen.getAllByRole('link', { name: 'Configure' })).toHaveLength(7);
  });

  it('prioritizes not configured status over no active period when both are true', () => {
    useCurrentBudgetPeriodMock.mockReturnValue({
      data: null,
      isFetched: true,
      error: new ApiError('Not found', 404, '/api/budget_period/current'),
    });
    useSpentPerCategoryMock.mockReturnValue({ data: [], isLoading: false });
    useMonthlyBurnInMock.mockReturnValue({ data: null, isLoading: false });
    useMonthProgressMock.mockReturnValue({ data: null, isLoading: false });
    useBudgetPerDayMock.mockReturnValue({ data: [], isLoading: false });
    useRecentTransactionsMock.mockReturnValue({ data: [] });
    useTotalAssetsMock.mockReturnValue({ data: { totalAssets: 0 }, isLoading: false });
    useAccountsMock.mockReturnValue({ data: [] });

    render(
      <MemoryRouter>
        <Dashboard selectedPeriodId={null} />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Status: Not configured')).toHaveLength(7);
    expect(screen.queryByText('Status: No active period')).not.toBeInTheDocument();
  });
});
