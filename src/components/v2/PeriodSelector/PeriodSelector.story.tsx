import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { PeriodSelector } from './PeriodSelector';

const mockPeriods = {
  data: [
    {
      id: '1',
      name: 'March 2026',
      startDate: '2026-03-01',
      periodType: 'duration' as const,
      length: 31,
      remainingDays: 14,
      numberOfTransactions: 47,
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'April 2026',
      startDate: '2026-04-01',
      periodType: 'duration' as const,
      length: 30,
      remainingDays: null,
      numberOfTransactions: 0,
      status: 'upcoming' as const,
    },
    {
      id: '3',
      name: 'May 2026',
      startDate: '2026-05-01',
      periodType: 'duration' as const,
      length: 31,
      remainingDays: null,
      numberOfTransactions: 0,
      status: 'upcoming' as const,
    },
    {
      id: '4',
      name: 'February 2026',
      startDate: '2026-02-01',
      periodType: 'duration' as const,
      length: 28,
      remainingDays: null,
      numberOfTransactions: 32,
      status: 'past' as const,
    },
    {
      id: '5',
      name: 'January 2026',
      startDate: '2026-01-01',
      periodType: 'duration' as const,
      length: 31,
      remainingDays: null,
      numberOfTransactions: 45,
      status: 'past' as const,
    },
  ],
  total: 5,
  page: 1,
  pageSize: 20,
};

const periodHandlers = [
  http.get('*/v2/periods*', () => {
    return HttpResponse.json(mockPeriods);
  }),
];

const gapHandlers = [
  http.get('*/v2/periods*', () => {
    return HttpResponse.json({
      ...mockPeriods,
      data: mockPeriods.data.filter((p) => p.status !== 'active'),
    });
  }),
];

const meta: Meta<typeof PeriodSelector> = {
  title: 'v2/PeriodSelector/PeriodSelector',
  component: PeriodSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <Story />
      </V2ThemeProvider>
    ),
    createStoryDecorator(),
  ],
};

export default meta;
type Story = StoryObj<typeof PeriodSelector>;

export const SidebarVariant: Story = {
  args: { variant: 'sidebar' },
  parameters: { msw: { handlers: periodHandlers } },
  decorators: [
    (Story) => (
      <div style={{ width: 200, backgroundColor: 'var(--v2-card)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const PillVariant: Story = {
  args: { variant: 'pill' },
  parameters: { msw: { handlers: periodHandlers } },
  decorators: [
    (Story) => (
      <div style={{ width: 360, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const GapState: Story = {
  args: { variant: 'sidebar' },
  parameters: { msw: { handlers: gapHandlers } },
  decorators: [
    (Story) => (
      <div style={{ width: 200, backgroundColor: 'var(--v2-card)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const Empty: Story = {
  args: { variant: 'sidebar' },
  parameters: {
    msw: {
      handlers: [
        http.get('*/v2/periods*', () => {
          return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20 });
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200, backgroundColor: 'var(--v2-card)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const Error: Story = {
  args: { variant: 'sidebar' },
  parameters: {
    msw: {
      handlers: [
        http.get('*/v2/periods*', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200, backgroundColor: 'var(--v2-card)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const Loading: Story = {
  args: { variant: 'sidebar' },
  parameters: {
    msw: {
      handlers: [
        http.get('*/v2/periods*', async () => {
          await new Promise(() => {}); // infinite delay
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200, backgroundColor: 'var(--v2-card)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const MobilePill: Story = {
  args: { variant: 'pill' },
  parameters: {
    msw: { handlers: periodHandlers },
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
