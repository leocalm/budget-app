import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { Button } from '@mantine/core';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { TwoFactorSetup } from './TwoFactorSetup';

const meta: Meta<typeof TwoFactorSetup> = {
  title: 'Components/Settings/TwoFactorSetup',
  component: TwoFactorSetup,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof TwoFactorSetup>;

const setupHandlers = [
  http.post('/api/v1/two-factor/setup', () =>
    HttpResponse.json({
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      backupCodes: ['AAAA-BBBB', 'CCCC-DDDD', 'EEEE-FFFF', 'GGGG-HHHH', 'IIII-JJJJ'],
    })
  ),
  http.post('/api/v1/two-factor/verify', () => HttpResponse.json(null, { status: 204 })),
];

export const Default: Story = {
  parameters: { msw: { handlers: setupHandlers } },
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Enable 2FA</Button>
        <TwoFactorSetup
          opened={opened}
          onClose={() => setOpened(false)}
          onSuccess={() => setOpened(false)}
        />
      </>
    );
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/two-factor/setup')] },
  },
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Enable 2FA</Button>
        <TwoFactorSetup
          opened={opened}
          onClose={() => setOpened(false)}
          onSuccess={() => setOpened(false)}
        />
      </>
    );
  },
};
