import dayjs from 'dayjs';
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
    name: 'Current Period',
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  },
  {
    id: 'period-next',
    name: 'Next Period',
    startDate: dayjs().add(1, 'month').startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().add(1, 'month').endOf('month').format('YYYY-MM-DD'),
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
    await user.click(screen.getByRole('button', { name: /Next Period/i }));

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

  it('shows gap warning when there are periods but none is active today', async () => {
    const user = userEvent.setup();

    renderSelector({
      periods: [
        {
          id: 'period-past',
          name: 'Past Period',
          startDate: dayjs().subtract(2, 'month').startOf('month').format('YYYY-MM-DD'),
          endDate: dayjs().subtract(2, 'month').endOf('month').format('YYYY-MM-DD'),
        },
        {
          id: 'period-upcoming',
          name: 'Upcoming Period',
          startDate: dayjs().add(2, 'month').startOf('month').format('YYYY-MM-DD'),
          endDate: dayjs().add(2, 'month').endOf('month').format('YYYY-MM-DD'),
        },
      ],
      selectedPeriodId: 'period-past',
    });

    await user.click(screen.getByTestId('budget-period-trigger'));

    expect(screen.getByText('You are in a period gap')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upcoming Period/i })).toBeInTheDocument();
  });

  it('opens bottom sheet on mobile and selects period', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const user = userEvent.setup();
    const { onPeriodChange } = renderSelector();

    await user.click(screen.getByTestId('budget-period-trigger'));

    expect(screen.getByText('Choose budget period')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Next Period/i }));

    expect(onPeriodChange).toHaveBeenCalledWith('period-next');
  });
});
