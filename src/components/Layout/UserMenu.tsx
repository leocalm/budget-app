import { useState } from 'react';
import { IconLogout, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { logout as apiLogout } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

interface UserMenuProps {
  /** 'sidebar' renders full name + email row; 'topbar' renders avatar-only button */
  variant?: 'sidebar' | 'topbar';
}

export function UserMenu({ variant = 'sidebar' }: UserMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiLogout();
    } finally {
      logout();
      setLoggingOut(false);
      navigate('/auth/login');
    }
  };

  const getInitials = (name: string) => {
    if (!name.trim()) {
      return 'U';
    }
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const menuPosition = variant === 'topbar' ? 'bottom-end' : 'right-end';

  return (
    <Menu shadow="md" width={200} position={menuPosition}>
      <Menu.Target>
        {variant === 'topbar' ? (
          <UnstyledButton
            data-testid="user-menu-trigger"
            style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', padding: 4 }}
          >
            <Avatar radius="xl" color="cyan" size={36}>
              {user?.name ? getInitials(user.name) : 'U'}
            </Avatar>
          </UnstyledButton>
        ) : (
          <UnstyledButton
            w="100%"
            p="xs"
            data-testid="user-menu-trigger"
            style={{ borderRadius: '8px', transition: 'background-color 0.2s' }}
          >
            <Group>
              <Avatar radius="xl" color="cyan" size={40}>
                {user?.name ? getInitials(user.name) : 'U'}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {user?.name || t('layout.userMenu.userName')}
                </Text>
                <Text c="dimmed" size="xs">
                  {user?.email || t('layout.userMenu.userEmail')}
                </Text>
              </div>
              <span style={{ fontSize: 14 }}>›</span>
            </Group>
          </UnstyledButton>
        )}
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('layout.userMenu.application')}</Menu.Label>
        {/* Profile link removed from user menu per request */}
        <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => navigate('/settings')}>
          {t('layout.userMenu.settings')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          data-testid="user-menu-logout"
          leftSection={<IconLogout size={14} />}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {t('layout.userMenu.logout')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
