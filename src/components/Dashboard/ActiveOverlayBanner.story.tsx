import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { mockActiveOverlay } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { ActiveOverlayBanner } from './ActiveOverlayBanner';

const meta: Meta<typeof ActiveOverlayBanner> = {
  title: 'Components/Dashboard/ActiveOverlayBanner',
  component: ActiveOverlayBanner,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof ActiveOverlayBanner>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [http.get('/api/v1/overlays', () => HttpResponse.json([mockActiveOverlay]))],
    },
  },
};

export const NoCap: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/overlays', () =>
          HttpResponse.json([{ ...mockActiveOverlay, totalCapAmount: null }])
        ),
      ],
    },
  },
};

export const OverBudget: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/overlays', () =>
          HttpResponse.json([{ ...mockActiveOverlay, spentAmount: 180000 }])
        ),
      ],
    },
  },
};

export const MultipleOverlays: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/overlays', () =>
          HttpResponse.json([
            mockActiveOverlay,
            {
              ...mockActiveOverlay,
              id: 'ovl-2',
              name: 'Car Repair',
              icon: '🚗',
              totalCapAmount: 50000,
              spentAmount: 30000,
            },
          ])
        ),
      ],
    },
  },
};

export const NoActiveOverlays: Story = {
  parameters: {
    msw: {
      handlers: [mswHandlers.empty('/api/v1/overlays')],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [mswHandlers.loading('/api/v1/overlays')],
    },
  },
};
