import type { Meta, StoryObj } from '@storybook/react';
import { Route, Routes } from 'react-router-dom';
import { mockCategoryWithStats } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { CategoryDetailPage } from './CategoryDetailPage';

const meta: Meta<typeof CategoryDetailPage> = {
  title: 'Pages/Categories/CategoryDetailPage',
  component: CategoryDetailPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    initialEntries: ['/categories/cat-out-1'],
  },
  decorators: [
    // Routes decorator must be outermost to provide :id param to useParams()
    (Story) => (
      <Routes>
        <Route path="/categories/:id" element={<Story />} />
      </Routes>
    ),
    createStoryDecorator({ padding: false }),
  ],
};

export default meta;
type Story = StoryObj<typeof CategoryDetailPage>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.success('/api/v1/categories', mockCategoryWithStats),
        mswHandlers.success('/api/v1/transactions', []),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/categories')] },
  },
};

export const CategoryNotFound: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.success('/api/v1/categories', []),
        mswHandlers.success('/api/v1/transactions', []),
      ],
    },
  },
};
