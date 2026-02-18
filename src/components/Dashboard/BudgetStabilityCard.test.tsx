import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@/test-utils';
import { BudgetStability } from '@/types/dashboard';
import { BudgetStabilityCard } from './BudgetStabilityCard';

describe('BudgetStabilityCard', () => {
  it('renders loading state', () => {
    render(<BudgetStabilityCard isLoading isError={false} onRetry={vi.fn()} />);

    expect(screen.getByText('Budget Stability')).toBeInTheDocument();
    expect(screen.queryByText('No closed periods yet')).not.toBeInTheDocument();
  });

  it('renders empty state for no closed periods', () => {
    const data: BudgetStability = {
      withinTolerancePercentage: 0,
      periodsWithinTolerance: 0,
      totalClosedPeriods: 0,
      recentClosedPeriods: [],
    };

    render(<BudgetStabilityCard data={data} isLoading={false} isError={false} onRetry={vi.fn()} />);

    expect(screen.getByText('No closed periods yet')).toBeInTheDocument();
  });

  it('renders active state with six dots', () => {
    const data: BudgetStability = {
      withinTolerancePercentage: 67,
      periodsWithinTolerance: 4,
      totalClosedPeriods: 6,
      recentClosedPeriods: [
        { periodId: '1', isOutsideTolerance: false },
        { periodId: '2', isOutsideTolerance: true },
        { periodId: '3', isOutsideTolerance: false },
        { periodId: '4', isOutsideTolerance: false },
        { periodId: '5', isOutsideTolerance: true },
        { periodId: '6', isOutsideTolerance: false },
      ],
    };

    render(<BudgetStabilityCard data={data} isLoading={false} isError={false} onRetry={vi.fn()} />);

    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('4 of 6 periods within range')).toBeInTheDocument();
    expect(screen.getByText('Last 6 closed periods')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Outside tolerance')).toHaveLength(2);
    expect(screen.getAllByLabelText('Within tolerance')).toHaveLength(4);
  });

  it('renders error state with retry action', () => {
    const onRetry = vi.fn();

    render(<BudgetStabilityCard isLoading={false} isError onRetry={onRetry} />);

    expect(screen.getByText('Could not load budget stability.')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Retry' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
