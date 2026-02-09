import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { OverlaysPage } from './OverlaysPage';

const useOverlaysMock = vi.hoisted(() => vi.fn());
const deleteOverlayMutateAsync = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useOverlays', () => ({
  useOverlays: () => useOverlaysMock(),
  useDeleteOverlay: () => ({
    mutateAsync: deleteOverlayMutateAsync,
    isPending: false,
  }),
  useCreateOverlay: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateOverlay: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/context/BudgetContext', () => ({
  useBudgetPeriodSelection: () => ({
    selectedPeriodId: 'period-1',
    setSelectedPeriodId: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ data: [] }),
}));

vi.mock('@/hooks/useVendors', () => ({
  useVendors: () => ({ data: [] }),
}));

vi.mock('@/hooks/useAccounts', () => ({
  useAccounts: () => ({ data: [] }),
}));

describe('OverlaysPage', () => {
  beforeEach(() => {
    useOverlaysMock.mockReset();
    deleteOverlayMutateAsync.mockReset();
    deleteOverlayMutateAsync.mockResolvedValue(undefined);
  });

  const renderPage = () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <OverlaysPage />
        </MantineProvider>
      </MemoryRouter>
    );
  };

  it('shows empty state when overlays are unavailable', () => {
    useOverlaysMock.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderPage();

    expect(screen.getByText('No overlays yet')).toBeInTheDocument();
  });

  it('opens delete confirmation and deletes overlay', async () => {
    const user = userEvent.setup();

    useOverlaysMock.mockReturnValue({
      data: [
        {
          id: 'overlay-1',
          name: 'Italy Trip',
          startDate: '2026-08-10',
          endDate: '2026-08-20',
          inclusionMode: 'manual',
          totalCapAmount: 80000,
          spentAmount: 25000,
        },
      ],
      isLoading: false,
    });

    renderPage();

    await user.click(screen.getByLabelText('Delete overlay'));
    const deleteDialog = await screen.findByRole('dialog', { name: 'Delete overlay' });
    await user.click(within(deleteDialog).getByRole('button', { name: 'Delete overlay' }));

    await waitFor(() => {
      expect(deleteOverlayMutateAsync).toHaveBeenCalledWith('overlay-1');
    });
  });
});
