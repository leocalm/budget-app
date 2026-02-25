import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import {
  mockAccountContext,
  mockAccountDetail,
  mockBalanceHistory,
  mockCheckingAccount,
} from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { AccountDetailPage } from './AccountDetailPage';

const meta: Meta<typeof AccountDetailPage> = {
  title: 'Pages/Accounts/AccountDetailPage',
  component: AccountDetailPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    initialEntries: ['/accounts/acc-1'],
  },
  decorators: [
    // Routes decorator must be outermost to provide :id param to useParams()
    (Story) => (
      <Routes>
        <Route path="/accounts/:id" element={<Story />} />
      </Routes>
    ),
    createStoryDecorator({ padding: false }),
  ],
};

export default meta;
type Story = StoryObj<typeof AccountDetailPage>;

const defaultHandlers = [
  http.get('/api/v1/accounts/:id', () => HttpResponse.json(mockCheckingAccount)),
  http.get('/api/v1/accounts/:id/detail', () => HttpResponse.json(mockAccountDetail)),
  http.get('/api/v1/accounts/:id/balance-history', () => HttpResponse.json(mockBalanceHistory)),
  http.get('/api/v1/accounts/:id/context', () => HttpResponse.json(mockAccountContext)),
];

export const Default: Story = {
  parameters: {
    msw: { handlers: defaultHandlers },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.loading('/api/v1/accounts/:id'),
        mswHandlers.loading('/api/v1/accounts/:id/detail'),
      ],
    },
  },
};

export const AccountNotFound: Story = {
  parameters: {
    msw: {
      handlers: [http.get('/api/v1/accounts/:id', () => new HttpResponse(null, { status: 404 }))],
    },
  },
};
