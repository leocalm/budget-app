import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { V2ThemeProvider } from '@/theme/v2';
import { CurrentPeriodCard } from './CurrentPeriodCard';

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    <MemoryRouter>
      <V2ThemeProvider colorMode="dark">{children}</V2ThemeProvider>
    </MemoryRouter>
  </MantineProvider>
);

describe('CurrentPeriodCard', () => {
  it('renders loading skeleton', () => {
    vi.mocked(useDashboardCurrentPeriod).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(useBudgetPeriods).mockReturnValue({
      data: mockPeriodsData,
    } as any);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByTestId('current-period-card-loading')).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    vi.mocked(useDashboardCurrentPeriod).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);
    vi.mocked(useBudgetPeriods).mockReturnValue({
      data: mockPeriodsData,
    } as any);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders empty state when no period found', () => {
    vi.mocked(useDashboardCurrentPeriod).mockReturnValue({
      data: { spent: 0, target: 0, daysRemaining: 0, daysInPeriod: 0, projectedSpend: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(useBudgetPeriods).mockReturnValue({
      data: { data: [], total: 0, page: 1, pageSize: 20 },
    } as any);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByText(/no budget period configured/i)).toBeInTheDocument();
  });

  it('renders with budget - shows remaining, per day, projected', () => {
    vi.mocked(useDashboardCurrentPeriod).mockReturnValue({
      data: {
        spent: 284750,
        target: 450000,
        daysRemaining: 12,
        daysInPeriod: 31,
        projectedSpend: 438000,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(useBudgetPeriods).mockReturnValue({
      data: mockPeriodsData,
    } as any);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByTestId('current-period-card')).toBeInTheDocument();
    expect(screen.getByText(/remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/per day left/i)).toBeInTheDocument();
    expect(screen.getByText(/projected/i)).toBeInTheDocument();
    expect(screen.getByText(/12 days left/i)).toBeInTheDocument();
  });

  it('renders without budget - shows only total spent', () => {
    vi.mocked(useDashboardCurrentPeriod).mockReturnValue({
      data: {
        spent: 284750,
        target: 0,
        daysRemaining: 12,
        daysInPeriod: 31,
        projectedSpend: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(useBudgetPeriods).mockReturnValue({
      data: mockPeriodsData,
    } as any);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByText(/no budget set/i)).toBeInTheDocument();
    expect(screen.getByText(/total spent this period/i)).toBeInTheDocument();
    expect(screen.queryByText(/remaining/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/projected/i)).not.toBeInTheDocument();
  });

  it('shows budget progress bar only when budget is set', () => {
    vi.mocked(useDashboardCurrentPeriod).mockReturnValue({
      data: {
        spent: 284750,
        target: 0,
        daysRemaining: 12,
        daysInPeriod: 31,
        projectedSpend: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(useBudgetPeriods).mockReturnValue({
      data: mockPeriodsData,
    } as any);

    render(<CurrentPeriodCard periodId="test-period-id" />, { wrapper });
    expect(screen.getByText(/time/i)).toBeInTheDocument();
    expect(screen.queryByText(/budget/i, { selector: '.progressLabel' })).not.toBeInTheDocument();
  });
});
