import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { BudgetPeriod } from '@/types/budget';
import { BudgetPeriodSelector } from './BudgetPeriodSelector';

const mockUseMediaQuery = vi.hoisted(() => vi.fn());

vi.mock('@mantine/hooks', async () => {
  const actual = await vi.importActual<typeof import('@mantine/hooks')>('@mantine/hooks');

  return {
    ...actual,
    useMediaQuery: mockUseMediaQuery,
  };
});

const periods: BudgetPeriod[] = [
  {
    id: 'period-current',
    name: 'February 2026',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
  },
  {
    id: 'period-next',
    name: 'March 2026',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
  },
];

const renderSelector = (props?: Partial<ComponentProps<typeof BudgetPeriodSelector>>) => {
  const onPeriodChange = vi.fn();

  render(
    <MemoryRouter>
      <MantineProvider>
        <BudgetPeriodSelector
          periods={props?.periods ?? periods}
          selectedPeriodId={props?.selectedPeriodId ?? 'period-current'}
          onPeriodChange={props?.onPeriodChange ?? onPeriodChange}
        />
      </MantineProvider>
    </MemoryRouter>
  );

  return { onPeriodChange };
};

describe('BudgetPeriodSelector', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false);
  });

  it('changes period from desktop picker', async () => {
    const user = userEvent.setup();
    const { onPeriodChange } = renderSelector();

    await user.click(screen.getByTestId('budget-period-trigger'));
    await user.click(screen.getByRole('button', { name: /March 2026/i }));

    expect(onPeriodChange).toHaveBeenCalledWith('period-next');
  });

  it('shows gap warning and manage link when there are no periods', async () => {
    const user = userEvent.setup();

    renderSelector({
      periods: [],
      selectedPeriodId: null,
    });

    await user.click(screen.getByTestId('budget-period-trigger'));

    expect(screen.getByText('You are in a period gap')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage Periods' })).toHaveAttribute(
      'href',
      '/periods'
    );
  });

  it('opens bottom sheet on mobile and selects period', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const user = userEvent.setup();
    const { onPeriodChange } = renderSelector();

    await user.click(screen.getByTestId('budget-period-trigger'));

    expect(screen.getByText('Choose budget period')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /March 2026/i }));

    expect(onPeriodChange).toHaveBeenCalledWith('period-next');
  });
});
