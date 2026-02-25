import type { Meta, StoryObj } from '@storybook/react';
import { euroCurrency, gbpCurrency, usdCurrency } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CurrencyValue } from './CurrencyValue';

const meta: Meta<typeof CurrencyValue> = {
  title: 'Components/Utils/CurrencyValue',
  component: CurrencyValue,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof CurrencyValue>;

export const Euro: Story = {
  args: { currency: euroCurrency, cents: 150000 },
};

export const Dollar: Story = {
  args: { currency: usdCurrency, cents: 250050 },
};

export const BritishPound: Story = {
  args: { currency: gbpCurrency, cents: 199900 },
};

export const NegativeBalance: Story = {
  args: { currency: euroCurrency, cents: -75000 },
};

export const Zero: Story = {
  args: { currency: euroCurrency, cents: 0 },
};

export const LargeAmount: Story = {
  args: { currency: euroCurrency, cents: 1250099 },
};

export const NoCurrency: Story = {
  args: { currency: undefined, cents: 9999 },
};

export const WithoutSymbol: Story = {
  args: { currency: euroCurrency, cents: 50000, showSymbol: false },
};

export const Compact: Story = {
  args: { currency: euroCurrency, cents: 1500000, compact: true },
};
