import type { ReactNode } from 'react';
import { IconLogout, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, Group, Image, Menu, Text } from '@mantine/core';
import { useAuth } from '@/context/AuthContext';
import { useV2Theme } from '@/theme/v2';
import classes from './AppShell.module.css';

const LOGO_PATHS: Record<string, string> = {
  nebula: '/logo/piggy-pulse-nebula.svg',
  sunrise: '/logo/piggy-pulse-sunrise.svg',
  neon: '/logo/piggy-pulse-neon.svg',
  tropical: '/logo/piggy-pulse-tropical.svg',
  candy_pop: '/logo/piggy-pulse-candy_pop.svg',
  moonlit: '/logo/piggy-pulse-moonlit.svg',
};

interface MobileHeaderProps {
  /** User display name (for avatar initials) */
  userName: string;
  /** Period selector pill component */
  periodSelector?: ReactNode;
}

export function MobileHeader({ userName, periodSelector }: MobileHeaderProps) {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { colorTheme } = useV2Theme();
  const logoSrc = LOGO_PATHS[colorTheme] ?? LOGO_PATHS.nebula;

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/v2/auth/login');
  };

  return (
    <div className={classes.mobileHeader} data-testid="mobile-header">
      <Group justify="space-between" wrap="nowrap" mb="xs">
        <Group gap="xs" wrap="nowrap">
          <Image src={logoSrc} alt={t('common.piggyPulse')} w={28} h={28} />
          <Text
            fw={700}
            fz="md"
            ff="var(--mantine-font-family-headings)"
            className={classes.brandText}
          >
            {t('common.piggyPulse')}
          </Text>
        </Group>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Avatar
              component="button"
              size="sm"
              radius="xl"
              style={{ cursor: 'pointer' }}
              data-testid="mobile-user-avatar"
              aria-label={t('appShell.userMenu')}
            >
              {initials}
            </Avatar>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconSettings size={14} />}
              onClick={() => navigate('/v2/settings')}
            >
              {t('common.settings')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={handleLogout}>
              {t('common.logOut')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      {periodSelector}
    </div>
  );
}
