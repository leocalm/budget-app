import { NavLink, Stack, Text, Box } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';

const navigationSections = [
  {
    title: 'Overview',
    items: [
      { icon: () => <span>📊</span>, label: 'Dashboard', route: '/dashboard' },
      { icon: () => <span>💶</span>, label: 'Transactions', route: '/transactions' },
    ],
  },
  {
    title: 'Management',
    items: [
      { icon: () => <span>👛</span>, label: 'Accounts', route: '/accounts' },
      { icon: () => <span>🏷️</span>, label: 'Categories', route: '/categories' },
      { icon: () => <span>📊</span>, label: 'Budget Plan', route: '/budget' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { icon: () => <span>📈</span>, label: 'Reports', route: '/reports' },
      { icon: () => <span>🎯</span>, label: 'Goals', route: '/goals' },
      { icon: () => <span>🔁</span>, label: 'Recurring', route: '/recurring' },
    ],
  },
  {
    title: 'Other',
    items: [
      { icon: () => <span>⚙️</span>, label: 'Settings', route: '/settings' },
      { icon: () => <span>❓</span>, label: 'Help & Support', route: '/help' },
    ],
  },
];

interface NavigationProps {
  onNavigate?: () => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

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