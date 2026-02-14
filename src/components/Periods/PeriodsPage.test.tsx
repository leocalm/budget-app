import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as useBudget from '@/hooks/useBudget';
import { fireEvent, render, screen } from '@/test-utils';
import { PeriodsPage } from './PeriodsPage';

vi.mock('@/hooks/useBudget', async () => {
  const actual = await vi.importActual('@/hooks/useBudget');
  return {
    ...actual,
    useBudgetPeriods: vi.fn(),
    useBudgetPeriodSchedule: vi.fn(),
    useBudgetPeriodGaps: vi.fn(),
    useDeleteBudgetPeriod: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useDeleteBudgetPeriodSchedule: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
    useUpdateBudgetPeriod: vi.fn(() => ({ mutateAsync: vi.fn() })),
  };
});

describe('PeriodsPage', () => {
  beforeEach(() => {
    vi.mocked(useBudget.useBudgetPeriods).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(useBudget.useBudgetPeriodGaps).mockReturnValue({
      data: { unassignedCount: 0, transactions: [] },
      isLoading: false,
    } as any);
  });

  it('shows detailed warnings when disabling schedule', async () => {
    vi.mocked(useBudget.useBudgetPeriodSchedule).mockReturnValue({
      data: {
        id: 'schedule-1',
        startDay: 1,
        durationValue: 1,
        durationUnit: 'months',
        generateAhead: 6,
      },
      isLoading: false,
    } as any);

    render(<PeriodsPage />);

    // Click Disable Schedule button
    const disableBtn = screen.getByRole('button', { name: /Disable Schedule/i });
    fireEvent.click(disableBtn);

    // Check for detailed warnings in the modal
    expect(await screen.findByText(/Disable Auto-Creation\?/i)).toBeInTheDocument();
    expect(await screen.findByText(/Stop automatic period creation/i)).toBeInTheDocument();
    expect(await screen.findByText(/Delete unused future periods/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Convert periods with transactions to manual periods/i)
    ).toBeInTheDocument();
  });
});
