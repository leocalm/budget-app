import type { Meta, StoryObj } from '@storybook/react';
import { euroCurrency, mockNetPosition } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { NetPositionCard } from './NetPositionCard';

const meta: Meta<typeof NetPositionCard> = {
  title: 'Components/Dashboard/NetPositionCard',
  component: NetPositionCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof NetPositionCard>;

export const Default: Story = {
  args: {
    data: mockNetPosition,
    isLoading: false,
    isError: false,
    onRetry: () => {},
    currency: euroCurrency,
    locale: 'en-GB',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    isError: false,
    onRetry: () => {},
    currency: euroCurrency,
    locale: 'en-GB',
  },
};

export const Error: Story = {
  args: {
    isLoading: false,
    isError: true,
    onRetry: () => {},
    currency: euroCurrency,
    locale: 'en-GB',
  },
};

export const NegativeNetPosition: Story = {
  args: {
    data: {
      ...mockNetPosition,
      totalNetPosition: -25000,
      changeThisPeriod: -8000,
      debtBalance: -200000,
      liquidBalance: 175000,
    },
    isLoading: false,
    isError: false,
    onRetry: () => {},
    currency: euroCurrency,
    locale: 'en-GB',
  },
};

export const NoAccounts: Story = {
  args: {
    data: {
      ...mockNetPosition,
      accountCount: 0,
      totalNetPosition: 0,
      liquidBalance: 0,
      protectedBalance: 0,
      debtBalance: 0,
    },
    isLoading: false,
    isError: false,
    onRetry: () => {},
    currency: euroCurrency,
    locale: 'en-GB',
  },
};
