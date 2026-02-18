import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { render } from '@/test-utils';
import { ConfirmDialog } from './ConfirmDialog';

const mockUseMediaQuery = vi.hoisted(() => vi.fn());

vi.mock('@mantine/hooks', async () => {
  const actual = await vi.importActual<typeof import('@mantine/hooks')>('@mantine/hooks');

  return {
    ...actual,
    useMediaQuery: mockUseMediaQuery,
  };
});

describe('ConfirmDialog', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false);
  });

  it('renders modal variant on desktop with translated aria label', () => {
    render(
      <MantineProvider>
        <ConfirmDialog
          opened
          title="Delete overlay"
          impact="This action cannot be undone."
          safeActionLabel="Cancel"
          actionLabel="Delete"
          onClose={vi.fn()}
          onAction={vi.fn()}
        />
      </MantineProvider>
    );

    expect(screen.getByText('Delete overlay')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmation dialog')).toBeInTheDocument();
  });

  it('renders drawer variant on mobile', () => {
    mockUseMediaQuery.mockReturnValue(true);

    render(
      <MantineProvider>
        <ConfirmDialog
          opened
          title="Delete overlay"
          impact="This action cannot be undone."
          safeActionLabel="Cancel"
          actionLabel="Delete"
          onClose={vi.fn()}
          onAction={vi.fn()}
        />
      </MantineProvider>
    );

    expect(screen.getByText('Delete overlay')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('calls action and close handlers from buttons', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onAction = vi.fn();

    render(
      <MantineProvider>
        <ConfirmDialog
          opened
          title="Delete overlay"
          impact="This action cannot be undone."
          safeActionLabel="Cancel"
          actionLabel="Delete"
          onClose={onClose}
          onAction={onAction}
        />
      </MantineProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('disables close button while action is loading', () => {
    render(
      <MantineProvider>
        <ConfirmDialog
          opened
          title="Delete overlay"
          impact="This action cannot be undone."
          safeActionLabel="Cancel"
          actionLabel="Delete"
          onClose={vi.fn()}
          onAction={vi.fn()}
          actionLoading
        />
      </MantineProvider>
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('shows a close button only when blockClose is false', () => {
    const { rerender } = render(
      <MantineProvider>
        <ConfirmDialog
          opened
          title="Delete overlay"
          impact="This action cannot be undone."
          safeActionLabel="Cancel"
          actionLabel="Delete"
          onClose={vi.fn()}
          onAction={vi.fn()}
          blockClose={false}
        />
      </MantineProvider>
    );

    expect(screen.getAllByRole('button')).toHaveLength(3);

    rerender(
      <MantineProvider>
        <ConfirmDialog
          opened
          title="Delete overlay"
          impact="This action cannot be undone."
          safeActionLabel="Cancel"
          actionLabel="Delete"
          onClose={vi.fn()}
          onAction={vi.fn()}
          blockClose
        />
      </MantineProvider>
    );

    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
