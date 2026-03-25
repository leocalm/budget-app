import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Group, Image, Text } from '@mantine/core';
import { useV2Theme } from '@/theme/v2';
import classes from './AppShell.module.css';

const LOGO_PATHS: Record<string, string> = {
  moonlit: '/logo/piggy-pulse-moonlit.svg',
  nebula: '/logo/piggy-pulse-nebula.svg',
  frost: '/logo/piggy-pulse-frost.svg',
  twilight: '/logo/piggy-pulse-twilight.svg',
};

interface MobileHeaderProps {
  /** User display name (for avatar initials) */
  userName: string;
  /** Period selector pill component */
  periodSelector?: ReactNode;
}

export function MobileHeader({ userName, periodSelector }: MobileHeaderProps) {
  const navigate = useNavigate();
  const { colorTheme } = useV2Theme();
  const logoSrc = LOGO_PATHS[colorTheme] ?? LOGO_PATHS.nebula;

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
          <Image src={logoSrc} alt="PiggyPulse" w={28} h={28} />
          <Text
            fw={700}
            fz="md"
            ff="var(--mantine-font-family-headings)"
            className={classes.brandText}
          >
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
