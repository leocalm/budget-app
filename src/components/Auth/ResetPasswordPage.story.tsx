import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { ResetPasswordPage } from './ResetPasswordPage';

const meta: Meta<typeof ResetPasswordPage> = {
  title: 'Pages/Auth/ResetPassword',
  component: ResetPasswordPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ withBudgetProvider: false, padding: false })],
};

export default meta;
type Story = StoryObj<typeof ResetPasswordPage>;

export const Default: Story = {};

export const InvalidToken: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/password-reset/validate', () =>
          HttpResponse.json({ message: 'Invalid or expired token' }, { status: 400 })
        ),
      ],
    },
  },
};

export const SubmitLoading: Story = {
  parameters: {
    msw: {
      handlers: [mswHandlers.loadingPost('/api/password-reset/confirm')],
    },
  },
};

export const SubmitError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/password-reset/confirm', () =>
          HttpResponse.json({ message: 'Token expired' }, { status: 400 })
        ),
      ],
    },
  },
};
