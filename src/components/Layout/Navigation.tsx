import React from 'react';
import {
  IconArrowsExchange,
  IconBuildingStore,
  IconCalendar,
  IconLayoutDashboard,
  IconTag,
  IconWallet,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, NavLink, Stack, Text } from '@mantine/core';

interface NavigationProps {
  onNavigate?: () => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  // No session items in desktop sidebar per design

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

      {/* Session section intentionally omitted for desktop sidebar */}
    </Stack>
  );
}
