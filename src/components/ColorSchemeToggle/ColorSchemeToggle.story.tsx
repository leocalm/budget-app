import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeToggle } from './ColorSchemeToggle';

const meta: Meta<typeof ColorSchemeToggle> = {
  title: 'Components/ColorSchemeToggle',
  component: ColorSchemeToggle,
};

export default meta;
type Story = StoryObj<typeof ColorSchemeToggle>;

export const Default: Story = {};
