import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Group, Image, Text } from '@mantine/core';
import classes from './AppShell.module.css';

interface MobileHeaderProps {
  /** User display name (for avatar initials) */
  userName: string;
  /** Period selector pill component */
  periodSelector?: ReactNode;
}

export function MobileHeader({ userName, periodSelector }: MobileHeaderProps) {
  const navigate = useNavigate();

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={classes.mobileHeader} data-testid="mobile-header">
      <Group justify="space-between" wrap="nowrap" mb="xs">
        <Group gap="xs" wrap="nowrap">
          <Image
            src="/piggy-pulse-icon.svg"
            alt="PiggyPulse"
            w={28}
            h={28}
            fallbackSrc="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'><text y='22' font-size='22'>🐷</text></svg>"
          />
          <Text fw={700} fz="md" ff="var(--mantine-font-family-headings)">
            PiggyPulse
          </Text>
        </Group>
        <Avatar
          component="button"
          size="sm"
          radius="xl"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/v2/settings')}
          data-testid="mobile-user-avatar"
          aria-label="Go to settings"
        >
          {initials}
        </Avatar>
      </Group>
      {periodSelector}
    </div>
  );
}
