import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { mockBudgetedDiagnosticRows, mockUnbudgetedDiagnosticRows } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { CategoriesOverview } from './CategoriesOverview';

const meta: Meta<typeof CategoriesOverview> = {
  title: 'Pages/Categories/CategoriesOverview',
  component: CategoriesOverview,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ padding: false })],
};

export default meta;
type Story = StoryObj<typeof CategoriesOverview>;

const defaultHandlers = [
  http.get('/api/v1/categories/diagnostics', () =>
    HttpResponse.json({
      budgetedRows: mockBudgetedDiagnosticRows,
      unbudgetedRows: mockUnbudgetedDiagnosticRows,
    })
  ),
];

export const Default: Story = {
  parameters: { msw: { handlers: defaultHandlers } },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/categories/diagnostics')] },
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.error('/api/v1/categories/diagnostics')] },
  },
};

export const NoDiagnostics: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/categories/diagnostics', () =>
          HttpResponse.json({ budgetedRows: [], unbudgetedRows: [] })
        ),
      ],
    },
  },
};
