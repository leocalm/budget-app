import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { OverlayFormModal } from './OverlayFormModal';

const createOverlayMutateAsync = vi.hoisted(() => vi.fn());
const updateOverlayMutateAsync = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useOverlays', () => ({
  useCreateOverlay: () => ({
    mutateAsync: createOverlayMutateAsync,
    isPending: false,
  }),
  useUpdateOverlay: () => ({
    mutateAsync: updateOverlayMutateAsync,
    isPending: false,
  }),
}));

describe('OverlayFormModal', () => {
  beforeEach(() => {
    createOverlayMutateAsync.mockReset();
    updateOverlayMutateAsync.mockReset();
    createOverlayMutateAsync.mockResolvedValue({ id: 'overlay-1' });
    updateOverlayMutateAsync.mockResolvedValue({ id: 'overlay-1' });
  });

  const renderModal = (props?: Partial<ComponentProps<typeof OverlayFormModal>>) => {
    render(
      <MantineProvider>
        <OverlayFormModal
          opened
          onClose={() => {}}
          overlay={props?.overlay ?? null}
          categories={props?.categories ?? []}
          vendors={props?.vendors ?? []}
          accounts={props?.accounts ?? []}
        />
      </MantineProvider>
    );
  };

  it('creates an overlay in manual mode', async () => {
    const user = userEvent.setup();
    renderModal();

    fireEvent.change(screen.getByLabelText(/Overlay name/i), { target: { value: 'Italy Trip' } });
    fireEvent.change(screen.getByLabelText(/Start date/i), { target: { value: '2026-08-10' } });
    fireEvent.change(screen.getByLabelText(/End date/i), { target: { value: '2026-08-20' } });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Create overlay' }));

    await waitFor(() => {
      expect(createOverlayMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Italy Trip',
          startDate: '2026-08-10',
          endDate: '2026-08-20',
          inclusionMode: 'manual',
        })
      );
    });
  });

  it('requires at least one rule in rules-based mode', async () => {
    const user = userEvent.setup();

    renderModal({
      categories: [
        {
          id: 'category-1',
          name: 'Travel',
          icon: '✈️',
          color: '#0cf',
          parentId: null,
          categoryType: 'Outgoing',
          usedInPeriod: 0,
          differenceVsAveragePercentage: 0,
          transactionCount: 0,
        },
      ],
    });

    fireEvent.change(screen.getByLabelText(/Overlay name/i), { target: { value: 'Trip Rules' } });
    fireEvent.change(screen.getByLabelText(/Start date/i), { target: { value: '2026-08-10' } });
    fireEvent.change(screen.getByLabelText(/End date/i), { target: { value: '2026-08-20' } });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: /Rules-based/i }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      screen.getByText('Add at least one category, vendor, or account rule.')
    ).toBeInTheDocument();
    expect(createOverlayMutateAsync).not.toHaveBeenCalled();
  });
});
