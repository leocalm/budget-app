import type { Meta, StoryObj } from '@storybook/react';
import { mockAccounts } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { AccountsTable } from './AccountsTable';

const meta: Meta<typeof AccountsTable> = {
  title: 'Components/Accounts/AccountsTable',
  component: AccountsTable,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof AccountsTable>;

export const Default: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.success('/api/v1/accounts', mockAccounts)] },
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/accounts')] },
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.error('/api/v1/accounts')] },
  },
};

export const Empty: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.empty('/api/v1/accounts')] },
  },
};
