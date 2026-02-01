import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { logout as apiLogout } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Call backend logout endpoint
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state regardless of API response
      logout();
      setLoggingOut(false);
      navigate('/auth/login');
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Menu shadow="md" width={200} position="right-end">
      <Menu.Target>
        <UnstyledButton
          w="100%"
          p="xs"
          style={{ borderRadius: '8px', transition: 'background-color 0.2s' }}
        >
          <Group>
            <Avatar radius="xl" color="cyan">
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
            <span style={{ fontSize: 14 }}>➡️</span>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('layout.userMenu.application')}</Menu.Label>
        <Menu.Item leftSection={<span style={{ fontSize: 14 }}>👤</span>}>
          {t('layout.userMenu.profile')}
        </Menu.Item>
        <Menu.Item leftSection={<span style={{ fontSize: 14 }}>⚙️</span>}>
          {t('layout.userMenu.settings')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<span style={{ fontSize: 14 }}>🚪</span>}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {t('layout.userMenu.logout')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
