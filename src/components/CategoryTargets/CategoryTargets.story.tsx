import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { mockCategoryTargets } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { CategoryTargetsContainer } from './CategoryTargetsContainer';

const meta: Meta<typeof CategoryTargetsContainer> = {
  title: 'Pages/CategoryTargets/CategoryTargets',
  component: CategoryTargetsContainer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ padding: false })],
};

export default meta;
type Story = StoryObj<typeof CategoryTargetsContainer>;

const defaultHandlers = [
  http.get('/api/v1/category-targets', () => HttpResponse.json(mockCategoryTargets)),
];

export const Default: Story = {
  parameters: { msw: { handlers: defaultHandlers } },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/category-targets')] },
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.error('/api/v1/category-targets')] },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/category-targets', () =>
          HttpResponse.json({
            ...mockCategoryTargets,
            outgoingTargets: [],
            incomingTargets: [],
            excludedCategories: [],
          })
        ),
      ],
    },
  },
};
