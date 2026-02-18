import { useState } from 'react';
import {
  IconArrowsExchange,
  IconBuildingStore,
  IconCalendar,
  IconLayoutDashboard,
  IconLogout,
  IconSettings,
  IconTag,
  IconWallet,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, NavLink, Stack, Text } from '@mantine/core';
import { logout as apiLogout } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

interface NavigationProps {
  onNavigate?: () => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  const navigationSections = [
    {
      key: 'core',
      title: t('layout.navigation.core'),
      items: [
        {
          icon: <IconLayoutDashboard size={18} />,
          label: t('layout.navigation.dashboard'),
          route: '/dashboard',
        },
        {
          icon: <IconArrowsExchange size={18} />,
          label: t('layout.navigation.transactions'),
          route: '/transactions',
        },
        {
          icon: <IconCalendar size={18} />,
          label: t('layout.navigation.periods'),
          route: '/periods',
        },
      ],
    },
    {
      key: 'structure',
      title: t('layout.navigation.structure'),
      items: [
        {
          icon: <IconWallet size={18} />,
          label: t('layout.navigation.accounts'),
          route: '/accounts',
        },
        {
          icon: <IconTag size={18} />,
          label: t('layout.navigation.categories'),
          route: '/categories',
        },
        {
          icon: <IconBuildingStore size={18} />,
          label: t('layout.navigation.vendors'),
          route: '/vendors',
        },
      ],
    },
  ];

  const sessionItems = [
    {
      icon: <IconSettings size={18} />,
      label: t('layout.navigation.settings'),
      route: '/settings',
    },
  ];

  return (
    <Stack gap="md">
      {navigationSections.map((section) => (
        <Box key={section.key}>
          <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase" px="sm">
            {section.title}
          </Text>
          <Stack gap={2}>
            {section.items.map((item) => {
              const active =
                location.pathname === item.route ||
                (item.route === '/dashboard' && location.pathname === '/');
              return (
                <NavLink
                  key={item.route}
                  label={item.label}
                  leftSection={item.icon}
                  active={active}
                  onClick={() => {
                    navigate(item.route);
                    onNavigate?.();
                  }}
                  variant="light"
                  color="cyan"
                  style={{ borderRadius: '8px' }}
                  styles={{
                    label: {
                      color: active ? 'var(--mantine-color-cyan-6)' : 'var(--mantine-color-dimmed)',
                      fontSize: 14,
                      fontWeight: 500,
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      ))}

      <Box>
        <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase" px="sm">
          {t('layout.navigation.session')}
        </Text>
          <Stack gap={2}>
            {sessionItems.map((item) => (
              <NavLink
                key={item.route}
                label={item.label}
                leftSection={item.icon}
                active={location.pathname === item.route}
                onClick={() => {
                  navigate(item.route);
                  onNavigate?.();
                }}
                variant="light"
                color="cyan"
                style={{ borderRadius: '8px', fontSize: 14, fontWeight: 500 }}
              />
            ))}
            <NavLink
              label={t('layout.navigation.logout')}
              leftSection={<IconLogout size={18} />}
              onClick={handleLogout}
              disabled={loggingOut}
              variant="subtle"
              color="dimmed"
              style={{ borderRadius: '8px', fontSize: 14, fontWeight: 500 }}
            />
          </Stack>
      </Box>
    </Stack>
  );
}
