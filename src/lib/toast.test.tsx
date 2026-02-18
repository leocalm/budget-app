import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { UI } from '@/constants';
import { toast } from '@/lib/toast';

const mockShow = vi.hoisted(() => vi.fn());

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: mockShow,
  },
}));

describe('toast helper', () => {
  it('uses success duration for success toasts', () => {
    toast.success({
      message: 'Saved.',
    });

    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        autoClose: UI.TOAST_SUCCESS_DURATION_MS,
        color: 'blue',
      })
    );
  });

  it('uses info duration for info toasts', () => {
    toast.info({
      message: 'Updated.',
    });

    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        autoClose: UI.TOAST_INFO_DURATION_MS,
        color: 'indigo',
      })
    );
  });

  it('keeps critical errors sticky', () => {
    toast.error({
      message: 'Could not save. Please try again.',
    });

    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        autoClose: false,
        color: 'orange',
      })
    );
  });

  it('auto-dismisses non-critical errors', () => {
    toast.error({
      message: 'Could not save. Please try again.',
      nonCritical: true,
    });

    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        autoClose: UI.TOAST_ERROR_NON_CRITICAL_DURATION_MS,
      })
    );
  });

  it('renders optional action button in toast message', () => {
    const action = vi.fn();

    toast.info({
      message: 'Could not save.',
      action: {
        label: 'Retry',
        onClick: action,
      },
    });

    const payload = mockShow.mock.calls.at(-1)?.[0];
    render(<MantineProvider>{payload.message}</MantineProvider>);

    const button = screen.getByRole('button', { name: 'Retry' });
    button.click();

    expect(action).toHaveBeenCalledTimes(1);
  });
});
