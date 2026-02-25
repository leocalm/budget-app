import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { mockVendorsWithStats } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { VendorsContainer } from './VendorsContainer';

const meta: Meta<typeof VendorsContainer> = {
  title: 'Pages/Vendors/Vendors',
  component: VendorsContainer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ padding: false })],
};

export default meta;
type Story = StoryObj<typeof VendorsContainer>;

const defaultHandlers = [
  http.get('/api/v1/vendors', () =>
    HttpResponse.json({
      items: mockVendorsWithStats.filter((v) => !v.archived),
      hasNextPage: false,
      nextCursor: null,
    })
  ),
  http.get('/api/v1/vendors/archived', () =>
    HttpResponse.json(mockVendorsWithStats.filter((v) => v.archived))
  ),
];

export const Default: Story = {
  parameters: { msw: { handlers: defaultHandlers } },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/vendors')] },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/vendors', () =>
          HttpResponse.json({ items: [], hasNextPage: false, nextCursor: null })
        ),
        http.get('/api/v1/vendors/archived', () => HttpResponse.json([])),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.error('/api/v1/vendors')] },
  },
};
