import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { LoginPage } from './LoginPage';

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/Auth/Login',
  component: LoginPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    createStoryDecorator({
      withBudgetProvider: false,
      withAuthProvider: 'unauthenticated',
      padding: false,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};

export const LoginError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/users/login', () =>
          HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 })
        ),
      ],
    },
  },
};

export const LoginLoading: Story = {
  parameters: {
    msw: {
      handlers: [mswHandlers.loadingPost('/api/users/login')],
    },
  },
};

export const AccountLocked: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/users/login', () =>
          HttpResponse.json({ message: 'Account locked' }, { status: 423 })
        ),
      ],
    },
  },
};

export const TwoFactorRequired: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/users/login', () =>
          HttpResponse.json({ twoFactorRequired: true }, { status: 428 })
        ),
      ],
    },
  },
};
