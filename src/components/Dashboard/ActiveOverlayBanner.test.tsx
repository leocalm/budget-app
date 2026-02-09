import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { ActiveOverlayBanner } from './ActiveOverlayBanner';

const useActiveOverlaysMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useOverlays', () => ({
  useActiveOverlays: () => useActiveOverlaysMock(),
}));

describe('ActiveOverlayBanner', () => {
  beforeEach(() => {
    useActiveOverlaysMock.mockReset();
  });

  it('renders active overlay and can dismiss it', async () => {
    const user = userEvent.setup();
    useActiveOverlaysMock.mockReturnValue({
      data: [
        {
          id: 'overlay-1',
          name: 'Italy Trip',
          icon: '🏖️',
          startDate: '2026-08-10',
          endDate: '2026-08-20',
          inclusionMode: 'manual',
          totalCapAmount: 80000,
          spentAmount: 68000,
        },
      ],
    });

    render(
      <MemoryRouter>
        <MantineProvider>
          <ActiveOverlayBanner />
        </MantineProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Italy Trip/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText('Dismiss overlay banner'));
    expect(screen.queryByText(/Italy Trip/i)).not.toBeInTheDocument();
  });
});
