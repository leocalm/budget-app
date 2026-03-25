import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import type { components } from '@/api/v2';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { NetPositionCard } from './NetPositionCard';

type NetPosition = components['schemas']['NetPosition'];

const PERIOD_ID = 'mock-period-1';
const ENDPOINT = '*/v2/dashboard/net-position*';

const mockPositive: NetPosition = {
  total: 1284000,
  differenceThisPeriod: 34000,
  numberOfAccounts: 3,
  liquidAmount: 578000,
  protectedAmount: 826000,
  debtAmount: 120000,
};

const mockNegativeChange: NetPosition = {
  total: 842000,
  differenceThisPeriod: -158000,
  numberOfAccounts: 4,
  liquidAmount: 252000,
  protectedAmount: 890000,
  debtAmount: 300000,
};

const mockNoDebt: NetPosition = {
  total: 1404000,
  differenceThisPeriod: 92000,
  numberOfAccounts: 2,
  liquidAmount: 578000,
  protectedAmount: 826000,
  debtAmount: 0,
};

const mockEmpty: NetPosition = {
  total: 0,
  differenceThisPeriod: 0,
  numberOfAccounts: 0,
  liquidAmount: 0,
  protectedAmount: 0,
  debtAmount: 0,
};

const successHandler = (data: NetPosition) => [http.get(ENDPOINT, () => HttpResponse.json(data))];

const meta: Meta<typeof NetPositionCard> = {
  title: 'v2/Dashboard/NetPositionCard',
  component: NetPositionCard,
  tags: ['autodocs'],
  args: { periodId: PERIOD_ID },
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <div style={{ maxWidth: 600, padding: 16 }}>
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator(),
  ],
};

export default meta;
type Story = StoryObj<typeof NetPositionCard>;

export const PositiveNetPosition: Story = {
  parameters: { msw: { handlers: successHandler(mockPositive) } },
};

export const NegativeChange: Story = {
  parameters: { msw: { handlers: successHandler(mockNegativeChange) } },
};

export const NoDebt: Story = {
  parameters: { msw: { handlers: successHandler(mockNoDebt) } },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(ENDPOINT, async () => {
          await new Promise(() => {});
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [http.get(ENDPOINT, () => new HttpResponse(null, { status: 500 }))],
    },
  },
};

export const Empty: Story = {
  parameters: { msw: { handlers: successHandler(mockEmpty) } },
};

export const Mobile: Story = {
  parameters: {
    msw: { handlers: successHandler(mockPositive) },
    viewport: { defaultViewport: 'mobile1' },
  },
};
