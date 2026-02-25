import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { ForgotPasswordPage } from './ForgotPasswordPage';

const meta: Meta<typeof ForgotPasswordPage> = {
  title: 'Pages/Auth/ForgotPassword',
  component: ForgotPasswordPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ withBudgetProvider: false, padding: false })],
};

export default meta;
type Story = StoryObj<typeof ForgotPasswordPage>;

export const Default: Story = {};

export const SubmitLoading: Story = {
  parameters: {
    msw: {
      handlers: [mswHandlers.loadingPost('/api/password-reset/request')],
    },
  },
};

export const SubmitError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/password-reset/request', () =>
          HttpResponse.json({ message: 'Too many requests' }, { status: 429 })
        ),
      ],
    },
  },
};
