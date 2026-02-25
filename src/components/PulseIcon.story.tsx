import type { Meta, StoryObj } from '@storybook/react';
import coinIcon from '@/assets/icons/png/gradient/piggy-pulse-coin.png';
import piggyIcon from '@/assets/icons/png/gradient/piggy-pulse.png';
import { createStoryDecorator } from '@/stories/storyUtils';
import { PulseIcon } from './PulseIcon';

const meta: Meta<typeof PulseIcon> = {
  title: 'Components/PulseIcon',
  component: PulseIcon,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof PulseIcon>;

export const Default: Story = {
  args: { src: piggyIcon, trigger: 0 },
};

export const CoinIcon: Story = {
  args: { src: coinIcon, trigger: 0 },
};

export const Large: Story = {
  args: { src: piggyIcon, size: 64, trigger: 0 },
};

export const Small: Story = {
  args: { src: piggyIcon, size: 16, trigger: 0 },
};
