import type { Meta, StoryObj } from '@storybook/react';
import { euroCurrency, mockAccountDetail } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { PeriodFlow } from './PeriodFlow';

const meta: Meta<typeof PeriodFlow> = {
  title: 'Components/Accounts/PeriodFlow',
  component: PeriodFlow,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof PeriodFlow>;

export const Default: Story = {
  args: {
    detail: mockAccountDetail,
    currency: euroCurrency,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    detail: undefined,
    currency: euroCurrency,
    isLoading: true,
  },
};

export const NetPositive: Story = {
  args: {
    detail: { ...mockAccountDetail, inflows: 300000, outflows: 200000, net: 100000 },
    currency: euroCurrency,
    isLoading: false,
  },
};

export const NetNegative: Story = {
  args: {
    detail: { ...mockAccountDetail, inflows: 100000, outflows: 250000, net: -150000 },
    currency: euroCurrency,
    isLoading: false,
  },
};
