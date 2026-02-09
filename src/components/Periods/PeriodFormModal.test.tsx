import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { PeriodFormModal } from './PeriodFormModal';

const createBudgetPeriodMutateAsync = vi.hoisted(() => vi.fn());
const updateBudgetPeriodMutateAsync = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useBudget', () => ({
  useCreateBudgetPeriod: () => ({
    mutateAsync: createBudgetPeriodMutateAsync,
    isPending: false,
  }),
  useUpdateBudgetPeriod: () => ({
    mutateAsync: updateBudgetPeriodMutateAsync,
    isPending: false,
  }),
}));

describe('PeriodFormModal', () => {
  beforeEach(() => {
    createBudgetPeriodMutateAsync.mockReset();
    updateBudgetPeriodMutateAsync.mockReset();
    createBudgetPeriodMutateAsync.mockResolvedValue('period-created');
    updateBudgetPeriodMutateAsync.mockResolvedValue({
      id: 'period-editing',
      name: 'Updated',
      startDate: '2026-03-01',
      endDate: '2026-03-25',
    });
  });

  const renderModal = (props?: Partial<ComponentProps<typeof PeriodFormModal>>) => {
    render(
      <MantineProvider>
        <PeriodFormModal
          opened
          onClose={() => {}}
          periods={props?.periods ?? []}
          period={props?.period ?? null}
        />
      </MantineProvider>
    );
  };

  it('blocks submission when period range overlaps another period', async () => {
    const user = userEvent.setup();

    renderModal({
      periods: [
        {
          id: 'period-existing',
          name: 'February 2026',
          startDate: '2026-02-01',
          endDate: '2026-02-28',
        },
      ],
    });

    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2026-02-10' } });
    await user.click(screen.getByRole('radio', { name: 'Set Manually' }));
    fireEvent.change(screen.getByLabelText(/Manual End Date/i), {
      target: { value: '2026-02-20' },
    });
    await user.click(screen.getByRole('button', { name: 'Create Period' }));

    expect(await screen.findByText('This period overlaps an existing period.')).toBeInTheDocument();
    expect(createBudgetPeriodMutateAsync).not.toHaveBeenCalled();
  });

  it('creates a period with calculated end date', async () => {
    const user = userEvent.setup();
    renderModal();

    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2026-03-01' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^Duration$/i }), {
      target: { value: '2' },
    });
    await user.click(screen.getByRole('button', { name: 'Create Period' }));

    await waitFor(() => {
      expect(createBudgetPeriodMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2026-03-01',
          endDate: '2026-05-01',
        })
      );
    });
  });

  it('shows warning and updates existing period', async () => {
    const user = userEvent.setup();
    renderModal({
      period: {
        id: 'period-editing',
        name: 'March 2026',
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      },
    });

    expect(
      screen.getByText('Changing period dates changes period membership for transactions.')
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Manual End Date/i), {
      target: { value: '2026-03-25' },
    });
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(updateBudgetPeriodMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'period-editing',
          payload: expect.objectContaining({ endDate: '2026-03-25' }),
        })
      );
    });
  });

  it('always includes copyBudgetsFromPrevious: true in the payload', async () => {
    const user = userEvent.setup();
    renderModal();

    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2026-03-01' } });
    await user.click(screen.getByRole('button', { name: 'Create Period' }));

    await waitFor(() => {
      expect(createBudgetPeriodMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          copyBudgetsFromPrevious: true,
        })
      );
    });
  });
});
