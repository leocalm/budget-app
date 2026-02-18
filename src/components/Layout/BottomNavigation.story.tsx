import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';

const meta: Meta<typeof BottomNavigation> = {
  title: 'Components/Layout/BottomNavigation',
  component: BottomNavigation,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ paddingTop: '500px', minHeight: '600px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

const NavigationWrapper = ({ route }: { route: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(route);
  }, [navigate, route]);

  return <BottomNavigation />;
};

const MorePopoverWrapper = ({ route }: { route: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(route);
  }, [navigate, route]);

  useEffect(() => {
    // Auto-open the More popover by simulating a click on the More button
    const timeout = setTimeout(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('More')) {
          fireEvent.click(btn);
          break;
        }
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return <BottomNavigation />;
};

export const Default: Story = {
  render: () => <NavigationWrapper route="/dashboard" />,
};

export const OnTransactions: Story = {
  render: () => <NavigationWrapper route="/transactions" />,
};

export const OnPeriods: Story = {
  render: () => <NavigationWrapper route="/periods" />,
};

export const MorePopoverOpen: Story = {
  render: () => <MorePopoverWrapper route="/dashboard" />,
};
