import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '@/test-utils';
import { CurrentPeriodCard } from './CurrentPeriodCard';

vi.mock('@/hooks/useDisplayCurrency', () => ({
  useDisplayCurrency: () => ({
    id: 'eur-id',
    name: 'Euro',
    symbol: '€',
    currency: 'EUR',
    decimalPlaces: 2,
  }),
}));

describe('CurrentPeriodCard', () => {
  it('renders loading skeleton state', () => {
    const { container } = render(
      <CurrentPeriodCard selectedPeriodId="period-1" isLoading isError={false} onRetry={vi.fn()} />
    );

    expect(container.querySelectorAll('.mantine-Skeleton-root').length).toBeGreaterThan(0);
  });

  it('renders empty state when no period is selected', () => {
    render(
      <CurrentPeriodCard
        selectedPeriodId={null}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('No period selected.')).toBeInTheDocument();
  });

  it('renders error state and retries', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <CurrentPeriodCard selectedPeriodId="period-1" isLoading={false} isError onRetry={onRetry} />
    );

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders active arithmetic values and muted projection', () => {
    render(
      <CurrentPeriodCard
        selectedPeriodId="period-1"
        monthlyBurnIn={{
          totalBudget: 100000,
          spentBudget: 68000,
          currentDay: 20,
          daysInPeriod: 30,
        }}
        monthProgress={{
          currentDate: '2026-02-18',
          daysInPeriod: 30,
          remainingDays: 10,
          daysPassedPercentage: 67,
        }}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('€320.00 remaining')).toBeInTheDocument();
    expect(screen.getByText('68% used • 10 days remaining')).toBeInTheDocument();
    expect(screen.getByText('Total budget')).toBeInTheDocument();
    expect(screen.getByText('Total actual spend')).toBeInTheDocument();
    expect(screen.getByText('Projected spend at current pace: €1,020.00')).toBeInTheDocument();
  });
});
