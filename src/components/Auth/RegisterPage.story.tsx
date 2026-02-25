import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { RegisterPage } from './RegisterPage';

const meta: Meta<typeof RegisterPage> = {
  title: 'Pages/Auth/Register',
  component: RegisterPage,
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
type Story = StoryObj<typeof RegisterPage>;

export const Default: Story = {};

export const SubmitLoading: Story = {
  parameters: {
    msw: {
      handlers: [mswHandlers.loadingPost('/api/users/')],
    },
  },
};

export const SubmitError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/users/', () =>
          HttpResponse.json({ message: 'Email already in use' }, { status: 409 })
        ),
      ],
    },
  },
};
