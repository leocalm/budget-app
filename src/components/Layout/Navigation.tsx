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

  const navigationSections = [
    {
      title: t('layout.navigation.overview'),
      items: [
        {
          icon: () => <span>📊</span>,
          label: t('layout.navigation.dashboard'),
          route: '/dashboard',
        },
        {
          icon: () => <span>💶</span>,
          label: t('layout.navigation.transactions'),
          route: '/transactions',
        },
      ],
    },
    {
      title: t('layout.navigation.management'),
      items: [
        {
          icon: () => <span>👛</span>,
          label: t('layout.navigation.accounts'),
          route: '/accounts',
        },
        {
          icon: () => <span>🏷️</span>,
          label: t('layout.navigation.categories'),
          route: '/categories',
        },
        {
          icon: () => <span>🏪</span>,
          label: t('layout.navigation.vendors'),
          route: '/vendors',
        },
        {
          icon: () => <span>📊</span>,
          label: t('layout.navigation.budgetPlan'),
          route: '/budget',
        },
        {
          icon: () => <span>🎯</span>,
          label: t('layout.navigation.overlays'),
          route: '/overlays',
        },
      ],
    },
    {
      title: t('layout.navigation.insights'),
      items: [
        {
          icon: () => <span>📈</span>,
          label: t('layout.navigation.reports'),
          route: '/reports',
        },
        { icon: () => <span>🎯</span>, label: t('layout.navigation.goals'), route: '/goals' },
        {
          icon: () => <span>🔁</span>,
          label: t('layout.navigation.recurring'),
          route: '/recurring',
        },
      ],
    },
    {
      title: t('layout.navigation.other'),
      items: [
        {
          icon: () => <span>⚙️</span>,
          label: t('layout.navigation.settings'),
          route: '/settings',
        },
        {
          icon: () => <span>❓</span>,
          label: t('layout.navigation.helpSupport'),
          route: '/help',
        },
      ],
    },
  ];

  return (
    <Stack gap="md">
      {navigationSections.map((section) => (
        <Box key={section.title}>
          <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase" px="sm">
            {section.title}
          </Text>
          <Stack gap={2}>
            {section.items.map((item) => (
              <NavLink
                key={item.route}
                label={item.label}
                leftSection={<item.icon />}
                active={
                  location.pathname === item.route ||
                  (item.route === '/dashboard' && location.pathname === '/')
                }
                onClick={() => {
                  navigate(item.route);
                  onNavigate?.();
                }}
                variant="light"
                color="cyan"
                style={{ borderRadius: '8px' }}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
