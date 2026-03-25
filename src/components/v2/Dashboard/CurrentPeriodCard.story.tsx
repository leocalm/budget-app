import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import type { components } from '@/api/v2';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { CurrentPeriodCard } from './CurrentPeriodCard';

type CurrentPeriod = components['schemas']['CurrentPeriod'];

const PERIOD_ID = 'mock-period-1';
const CP_ENDPOINT = '*/api/v2/dashboard/current-period*';
const PERIODS_ENDPOINT = '*/api/v2/periods*';

const mockPeriod = {
  data: [
    {
      id: PERIOD_ID,
      name: 'March 2026',
      startDate: '2026-03-01',
      periodType: 'duration' as const,
      length: 31,
      remainingDays: 12,
      numberOfTransactions: 47,
      status: 'active' as const,
      duration: { durationUnits: 31, durationUnit: 'days' as const },
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};

const mockWithBudget: CurrentPeriod = {
  spent: 284750,
  target: 450000,
  daysRemaining: 12,
  daysInPeriod: 31,
  projectedSpend: 438000,
};

const mockAheadOfPace: CurrentPeriod = {
  spent: 321000,
  target: 450000,
  daysRemaining: 18,
  daysInPeriod: 31,
  projectedSpend: 764300,
};

const mockNoBudget: CurrentPeriod = {
  spent: 284750,
  target: 0,
  daysRemaining: 12,
  daysInPeriod: 31,
  projectedSpend: 0,
};

const successHandlers = (data: CurrentPeriod) => [
  http.get(CP_ENDPOINT, () => HttpResponse.json(data)),
  http.get(PERIODS_ENDPOINT, () => HttpResponse.json(mockPeriod)),
];

const meta: Meta<typeof CurrentPeriodCard> = {
  title: 'v2/Dashboard/CurrentPeriodCard',
  component: CurrentPeriodCard,
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
type Story = StoryObj<typeof CurrentPeriodCard>;

export const WithBudget: Story = {
  parameters: { msw: { handlers: successHandlers(mockWithBudget) } },
};

export const SpendingAhead: Story = {
  parameters: { msw: { handlers: successHandlers(mockAheadOfPace) } },
};

export const NoBudget: Story = {
  parameters: { msw: { handlers: successHandlers(mockNoBudget) } },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(CP_ENDPOINT, async () => {
          await new Promise(() => {});
        }),
        http.get(PERIODS_ENDPOINT, () => HttpResponse.json(mockPeriod)),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(CP_ENDPOINT, () => new HttpResponse(null, { status: 500 })),
        http.get(PERIODS_ENDPOINT, () => HttpResponse.json(mockPeriod)),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(CP_ENDPOINT, () => HttpResponse.json(mockNoBudget)),
        http.get(PERIODS_ENDPOINT, () =>
          HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20 })
        ),
      ],
    },
  },
};

export const Mobile: Story = {
  parameters: {
    msw: { handlers: successHandlers(mockWithBudget) },
    viewport: { defaultViewport: 'mobile1' },
  },
};
