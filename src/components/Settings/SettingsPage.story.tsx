import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { SettingsPage } from './SettingsPage';

const meta: Meta<typeof SettingsPage> = {
  title: 'Pages/Settings/SettingsPage',
  component: SettingsPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ padding: false })],
};

export default meta;
type Story = StoryObj<typeof SettingsPage>;

const settingsHandlers = [
  http.get('/api/v1/settings', () =>
    HttpResponse.json({
      id: 's1',
      language: 'en',
      defaultCurrencyId: 'cur-1',
      budgetStabilityToleranceBasisPoints: 1000,
      updatedAt: '2026-01-01T00:00:00Z',
    })
  ),
  http.get('/api/v1/settings/profile', () =>
    HttpResponse.json({
      name: 'Alice Demo',
      email: 'alice@example.com',
      timezone: 'Europe/London',
      defaultCurrencyId: 'cur-1',
      updatedAt: '2026-01-01T00:00:00Z',
    })
  ),
  http.get('/api/v1/settings/preferences', () =>
    HttpResponse.json({
      theme: 'auto',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1,234.56',
      compactMode: false,
      updatedAt: '2026-01-01T00:00:00Z',
    })
  ),
  http.get('/api/v1/settings/security/sessions', () =>
    HttpResponse.json([
      {
        id: 'sess-1',
        userAgent: 'Mozilla/5.0 Chrome',
        ipAddress: '127.0.0.1',
        createdAt: '2026-01-20T10:00:00Z',
        lastUsedAt: '2026-01-25T08:30:00Z',
        isCurrent: true,
      },
    ])
  ),
  http.get('/api/v1/settings/period-model', () =>
    HttpResponse.json({ periodMode: 'manual', periodSchedule: null })
  ),
  http.get('/api/v1/currency/', () =>
    HttpResponse.json([
      { id: 'cur-1', currency: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
      { id: 'cur-2', currency: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
      { id: 'cur-3', currency: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
    ])
  ),
  http.get('/api/v1/two-factor/status', () =>
    HttpResponse.json({ enabled: false, hasBackupCodes: false, backupCodesRemaining: 0 })
  ),
];

export const Default: Story = {
  parameters: { msw: { handlers: settingsHandlers } },
};

const [
  settingsHandler,
  profileHandler,
  preferencesHandler,
  sessionsHandler,
  periodModelHandler,
  currencyHandler,
] = settingsHandlers;

export const TwoFactorEnabled: Story = {
  parameters: {
    msw: {
      handlers: [
        settingsHandler,
        profileHandler,
        preferencesHandler,
        sessionsHandler,
        periodModelHandler,
        currencyHandler,
        http.get('/api/v1/two-factor/status', () =>
          HttpResponse.json({ enabled: true, hasBackupCodes: true, backupCodesRemaining: 4 })
        ),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.loading('/api/v1/settings'),
        mswHandlers.loading('/api/v1/settings/profile'),
        mswHandlers.loading('/api/v1/settings/preferences'),
      ],
    },
  },
};
