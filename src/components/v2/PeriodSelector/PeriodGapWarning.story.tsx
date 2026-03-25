import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { PeriodGapWarning } from './PeriodGapWarning';

const meta: Meta<typeof PeriodGapWarning> = {
  title: 'v2/PeriodSelector/PeriodGapWarning',
  component: PeriodGapWarning,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <div style={{ width: 260, backgroundColor: 'var(--v2-card)', padding: 12 }}>
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator({ padding: false }),
  ],
};

export default meta;
type Story = StoryObj<typeof PeriodGapWarning>;

export const Default: Story = {};
