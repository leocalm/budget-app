import type { Meta, StoryObj } from '@storybook/react';
import { mockSpentPerCategory } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { TopCategoriesChart } from './TopCategoriesChart';

const meta: Meta<typeof TopCategoriesChart> = {
  title: 'Components/Dashboard/TopCategoriesChart',
  component: TopCategoriesChart,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof TopCategoriesChart>;

export const Default: Story = {
  args: {
    title: 'Top Categories',
    data: mockSpentPerCategory,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    title: 'Top Categories',
    data: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    title: 'Top Categories',
    data: [],
    isError: true,
    onRetry: () => {},
  },
};

export const Locked: Story = {
  args: {
    title: 'Top Categories',
    data: [],
    isLocked: true,
  },
};

export const Empty: Story = {
  args: {
    title: 'Top Categories',
    data: [],
  },
};
