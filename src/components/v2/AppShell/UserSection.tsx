import { IconLogout, IconMoon, IconSettings, IconSun } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActionIcon, Avatar, Group, Menu, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { useAuth } from '@/context/AuthContext';
import classes from './AppShell.module.css';

interface UserSectionProps {
  /** User display name */
  name: string;
  /** User email */
  email: string;
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
}

export function UserSection({ name, email, collapsed }: UserSectionProps) {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  if (collapsed) {
    return (
      <Stack align="center" gap="xs" className={classes.userSection}>
        <Menu position="right-end" withinPortal>
          <Menu.Target>
            <Avatar
              component="button"
              size="sm"
              radius="xl"
              data-testid="user-avatar"
              style={{ cursor: 'pointer' }}
              aria-label={t('appShell.userMenu')}
            >
              {initials}
            </Avatar>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconSettings size={14} />}
              onClick={() => navigate('/settings')}
            >
              {t('common.settings')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={handleLogout}>
              {t('common.logOut')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Stack>
    );
  }

  return (
    <Group
      className={classes.userSection}
      wrap="nowrap"
      justify="space-between"
      data-testid="user-section"
    >
      <Menu position="top-start" withinPortal>
        <Menu.Target>
          <Group gap="sm" wrap="nowrap" style={{ overflow: 'hidden', flex: 1, cursor: 'pointer' }}>
            <Avatar size="sm" radius="xl">
              {initials}
            </Avatar>
            <Stack gap={0} style={{ overflow: 'hidden' }}>
              <Text fz="sm" fw={500} truncate>
                {name}
              </Text>
              <Text fz="xs" c="dimmed" truncate>
                {email}
              </Text>
            </Stack>
          </Group>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => navigate('/settings')}>
            Settings
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={handleLogout}>
            Log out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <ActionIcon
        variant="subtle"
        size="sm"
        onClick={toggleColorScheme}
        aria-label={isDark ? t('appShell.switchToLightMode') : t('appShell.switchToDarkMode')}
      >
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Group>
  );
}
