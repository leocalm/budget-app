import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { createStoryDecorator } from '@/stories/storyUtils';
import { BottomNavigation } from './BottomNavigation';

const meta: Meta<typeof BottomNavigation> = {
  title: 'Components/Layout/BottomNavigation',
  component: BottomNavigation,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false, padding: false })],
};

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

/** Default — no active route (root path) */
export const Default: Story = {};

/** Active route: Dashboard */
export const ActiveDashboard: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/dashboard']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

/** Active route: Transactions */
export const ActiveTransactions: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/transactions']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

/** Active route: Periods */
export const ActivePeriods: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/periods']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

/** Active route: Accounts (inside the More popover) */
export const ActiveAccounts: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/accounts']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};
