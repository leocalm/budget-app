import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { OverlayDetailPage } from './OverlayDetailPage';

const useOverlayMock = vi.hoisted(() => vi.fn());
const useOverlayTransactionsMock = vi.hoisted(() => vi.fn());
const includeOverlayTransactionMutateAsync = vi.hoisted(() => vi.fn());
const excludeOverlayTransactionMutateAsync = vi.hoisted(() => vi.fn());
const deleteOverlayMutateAsync = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useOverlays', () => ({
  useOverlay: () => useOverlayMock(),
  useOverlayTransactions: () => useOverlayTransactionsMock(),
  useIncludeOverlayTransaction: () => ({
    mutateAsync: includeOverlayTransactionMutateAsync,
    isPending: false,
  }),
  useExcludeOverlayTransaction: () => ({
    mutateAsync: excludeOverlayTransactionMutateAsync,
    isPending: false,
  }),
  useDeleteOverlay: () => ({
    mutateAsync: deleteOverlayMutateAsync,
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

describe('OverlayDetailPage', () => {
  beforeEach(() => {
    useOverlayMock.mockReset();
    useOverlayTransactionsMock.mockReset();
    includeOverlayTransactionMutateAsync.mockReset();
    excludeOverlayTransactionMutateAsync.mockReset();
    deleteOverlayMutateAsync.mockReset();

    includeOverlayTransactionMutateAsync.mockResolvedValue(undefined);
    excludeOverlayTransactionMutateAsync.mockResolvedValue(undefined);
    deleteOverlayMutateAsync.mockResolvedValue(undefined);
  });

  const renderPage = () => {
    render(
      <MemoryRouter initialEntries={['/overlays/overlay-1']}>
        <MantineProvider>
          <Routes>
            <Route path="/overlays/:id" element={<OverlayDetailPage />} />
          </Routes>
        </MantineProvider>
      </MemoryRouter>
    );
  };

  it('includes transaction from overlay detail', async () => {
    const user = userEvent.setup();

    useOverlayMock.mockReturnValue({
      data: {
        id: 'overlay-1',
        name: 'Italy Trip',
        startDate: '2026-08-10',
        endDate: '2026-08-20',
        inclusionMode: 'manual',
        spentAmount: 1000,
        totalCapAmount: 2000,
      },
      isLoading: false,
    });

    useOverlayTransactionsMock.mockReturnValue({
      data: [
        {
          id: 'tx-1',
          description: 'Taxi',
          amount: 2000,
          occurredAt: '2026-08-11',
          category: {
            id: 'cat-1',
            name: 'Travel',
            color: '#00d4ff',
            icon: '✈️',
            categoryType: 'Outgoing',
          },
          fromAccount: { id: 'acc-1', name: 'Main', color: '#00d4ff', icon: '💳' },
          toAccount: null,
          vendor: null,
          membership: {
            isIncluded: false,
            inclusionSource: null,
          },
        },
      ],
      isLoading: false,
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Include' }));

    await waitFor(() => {
      expect(includeOverlayTransactionMutateAsync).toHaveBeenCalledWith({
        overlayId: 'overlay-1',
        transactionId: 'tx-1',
      });
    });
  });

  it('excludes transaction from overlay detail', async () => {
    const user = userEvent.setup();

    useOverlayMock.mockReturnValue({
      data: {
        id: 'overlay-1',
        name: 'Italy Trip',
        startDate: '2026-08-10',
        endDate: '2026-08-20',
        inclusionMode: 'rules',
        spentAmount: 1000,
        totalCapAmount: 2000,
      },
      isLoading: false,
    });

    useOverlayTransactionsMock.mockReturnValue({
      data: [
        {
          id: 'tx-2',
          description: 'Hotel',
          amount: 3000,
          occurredAt: '2026-08-12',
          category: {
            id: 'cat-2',
            name: 'Hotels',
            color: '#00d4ff',
            icon: '🏨',
            categoryType: 'Outgoing',
          },
          fromAccount: { id: 'acc-1', name: 'Main', color: '#00d4ff', icon: '💳' },
          toAccount: null,
          vendor: null,
          membership: {
            isIncluded: true,
            inclusionSource: 'rules',
          },
        },
      ],
      isLoading: false,
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Exclude' }));

    await waitFor(() => {
      expect(excludeOverlayTransactionMutateAsync).toHaveBeenCalledWith({
        overlayId: 'overlay-1',
        transactionId: 'tx-2',
      });
    });
  });
});
