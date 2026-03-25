import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import type { components } from '@/api/v2';
import { V2ThemeProvider } from '@/theme/v2';
import { CurrentPeriodCard } from './CurrentPeriodCard';

type CurrentPeriod = components['schemas']['CurrentPeriod'];

// Mock the hooks
vi.mock('@/hooks/v2/useDashboard', () => ({
  useDashboardCurrentPeriod: vi.fn(),
  useDashboardCurrentPeriodHistory: vi.fn(() => ({ data: undefined, isLoading: false })),
  useDashboardNetPosition: vi.fn(() => ({ data: undefined, isLoading: false })),
  useDashboardNetPositionHistory: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

vi.mock('@/hooks/v2/useBudgetPeriods', () => ({
  useBudgetPeriods: vi.fn(),
}));

vi.mock('@/context/BudgetContext', () => ({
  useBudgetPeriodSelection: vi.fn(() => ({
    selectedPeriodId: 'test-period-id',
    setSelectedPeriodId: vi.fn(),
    isResolvingPeriod: false,
  })),
}));

vi.mock('@/hooks/useDisplayCurrency', () => ({
  useDisplayCurrency: vi.fn(() => ({
    currency: { id: '1', name: 'Euro', symbol: '€', currency: 'EUR', decimalPlaces: 2 },
  })),
}));

const { useDashboardCurrentPeriod } = await import('@/hooks/v2/useDashboard');
const { useBudgetPeriods } = await import('@/hooks/v2/useBudgetPeriods');

const mockPeriod = {
  id: 'test-period-id',
  name: 'March 2026',
  startDate: '2026-03-01',
  periodType: 'duration' as const,
  length: 31,
  remainingDays: 12,
  numberOfTransactions: 47,
  status: 'active' as const,
  duration: { durationUnits: 31, durationUnit: 'days' as const },
};

const mockPeriodsData = { data: [mockPeriod], total: 1, page: 1, pageSize: 20 };

/** Build a minimal mock return value for useDashboardCurrentPeriod */
function mockCurrentPeriodHook(data: CurrentPeriod | undefined, overrides = {}) {
  vi.mocked(useDashboardCurrentPeriod).mockReturnValue(
    // UseQueryResult is a complex discriminated union; casting through unknown is the
    // idiomatic pattern for vitest mocks of React Query hooks.
    {
      data,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      ...overrides,
    } as unknown as ReturnType<typeof useDashboardCurrentPeriod>
  );
}

function mockPeriodsHook(
  data: typeof mockPeriodsData | { data: never[]; total: number; page: number; pageSize: number }
) {
  vi.mocked(useBudgetPeriods).mockReturnValue({ data } as unknown as ReturnType<
    typeof useBudgetPeriods
  >);
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    <MemoryRouter>
      <V2ThemeProvider colorMode="dark">{children}</V2ThemeProvider>
    </MemoryRouter>
  </MantineProvider>
);

describe('CurrentPeriodCard', () => {
  it('renders loading skeleton', () => {
    mockCurrentPeriodHook(undefined, { isLoading: true });
    mockPeriodsHook(mockPeriodsData);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByTestId('current-period-card-loading')).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    mockCurrentPeriodHook(undefined, { isError: true });
    mockPeriodsHook(mockPeriodsData);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders empty state when no period found', () => {
    mockCurrentPeriodHook({
      spent: 0,
      target: 0,
      daysRemaining: 0,
      daysInPeriod: 0,
      projectedSpend: 0,
    });
    mockPeriodsHook({ data: [], total: 0, page: 1, pageSize: 20 });

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByText(/no budget period configured/i)).toBeInTheDocument();
  });

  it('renders with budget - shows remaining, per day, projected', () => {
    mockCurrentPeriodHook({
      spent: 284750,
      target: 450000,
      daysRemaining: 12,
      daysInPeriod: 31,
      projectedSpend: 438000,
    });
    mockPeriodsHook(mockPeriodsData);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByTestId('current-period-card')).toBeInTheDocument();
    expect(screen.getByText(/remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/per day left/i)).toBeInTheDocument();
    expect(screen.getByText(/projected/i)).toBeInTheDocument();
    expect(screen.getByText(/12 days left/i)).toBeInTheDocument();
  });

  it('renders without budget - shows only total spent', () => {
    mockCurrentPeriodHook({
      spent: 284750,
      target: 0,
      daysRemaining: 12,
      daysInPeriod: 31,
      projectedSpend: 0,
    });
    mockPeriodsHook(mockPeriodsData);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByText(/no budget set/i)).toBeInTheDocument();
    expect(screen.getByText(/total spent this period/i)).toBeInTheDocument();
    expect(screen.queryByText(/remaining/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/projected/i)).not.toBeInTheDocument();
  });

  it('shows budget progress bar only when budget is set', () => {
    mockCurrentPeriodHook({
      spent: 284750,
      target: 0,
      daysRemaining: 12,
      daysInPeriod: 31,
      projectedSpend: 0,
    });
    mockPeriodsHook(mockPeriodsData);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByTestId('progress-row-time')).toBeInTheDocument();
    expect(screen.queryByTestId('progress-row-budget')).not.toBeInTheDocument();
  });

  it('handles zero daysInPeriod without NaN in progress display', () => {
    mockCurrentPeriodHook({
      spent: 0,
      target: 100000,
      daysRemaining: 0,
      daysInPeriod: 0,
      projectedSpend: 0,
    });
    mockPeriodsHook(mockPeriodsData);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    // Should render the card (not crash), time progress row should show 0% (not NaN%)
    expect(screen.getByTestId('current-period-card')).toBeInTheDocument();
    expect(screen.getByTestId('progress-row-time')).toHaveTextContent('0%');
  });

  it('caps budget progress label at 100% when over budget', () => {
    mockCurrentPeriodHook({
      spent: 500000,
      target: 450000,
      daysRemaining: 5,
      daysInPeriod: 31,
      projectedSpend: 600000,
    });
    mockPeriodsHook(mockPeriodsData);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    // Budget label should show 100%, not 111%
    expect(screen.getByTestId('progress-row-budget')).toHaveTextContent('100%');
  });
});
