import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@/test-utils';
import type { Overlay } from '@/types/overlay';
import { OverlayCard } from './OverlayCard';

vi.mock('@/hooks/useDisplayCurrency', () => ({
  useDisplayCurrency: () => ({
    id: 'eur-id',
    name: 'Euro',
    symbol: '€',
    currency: 'EUR',
    decimalPlaces: 2,
  }),
}));

const baseOverlay: Overlay = {
  id: 'overlay-1',
  name: 'Italy Trip',
  startDate: '2026-08-10',
  endDate: '2026-08-20',
  inclusionMode: 'manual',
  totalCapAmount: null,
  spentAmount: 0,
  transactionCount: 0,
};

const renderCard = (overlay: Overlay) => {
  render(
    <MemoryRouter>
      <MantineProvider>
        <OverlayCard overlay={overlay} status="active" />
      </MantineProvider>
    </MemoryRouter>
  );
};

describe('OverlayCard', () => {
  it('renders the progress zone when totalCapAmount is set', () => {
    renderCard({
      ...baseOverlay,
      totalCapAmount: 80000,
      spentAmount: 25000,
    });

    // The "of" text is rendered via the overlays.card.of translation key ("of {{cap}}")
    expect(screen.getByText(/^of /i)).toBeInTheDocument();
  });

  it('does not render the progress zone when totalCapAmount is absent', () => {
    renderCard({
      ...baseOverlay,
      totalCapAmount: null,
      spentAmount: 0,
    });

    // No progress zone means the "of {{cap}}" translation is not rendered
    expect(screen.queryByText(/^of /i)).not.toBeInTheDocument();
  });
});
