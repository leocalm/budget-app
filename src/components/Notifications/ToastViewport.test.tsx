import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { UI } from '@/constants';
import { ToastViewport } from './ToastViewport';

const mockUseMediaQuery = vi.hoisted(() => vi.fn());
const mockNotificationsProps = vi.hoisted(() => vi.fn());

vi.mock('@mantine/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/hooks')>();

  return {
    ...actual,
    useMediaQuery: mockUseMediaQuery,
  };
});

vi.mock('@mantine/notifications', () => ({
  Notifications: (props: Record<string, unknown>) => {
    mockNotificationsProps(props);
    return null;
  },
}));

describe('ToastViewport', () => {
  it('renders desktop notification positioning', () => {
    mockUseMediaQuery.mockReturnValue(false);
    render(
      <MantineProvider>
        <ToastViewport />
      </MantineProvider>
    );

    expect(mockNotificationsProps).toHaveBeenCalledWith(
      expect.objectContaining({
        position: 'bottom-right',
        limit: UI.TOAST_STACK_LIMIT,
      })
    );
  });

  it('renders mobile notification positioning and width', () => {
    mockUseMediaQuery.mockReturnValue(true);
    render(
      <MantineProvider>
        <ToastViewport />
      </MantineProvider>
    );

    expect(mockNotificationsProps).toHaveBeenCalledWith(
      expect.objectContaining({
        position: 'bottom-center',
        containerWidth: `calc(100vw - ${UI.TOAST_MOBILE_SIDE_MARGIN_PX * 2}px)`,
      })
    );
  });
});
