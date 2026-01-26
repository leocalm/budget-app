import { useLocation, useNavigate } from 'react-router-dom';
import { Group, Paper, Text, ThemeIcon, UnstyledButton } from '@mantine/core';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { icon: () => <span>📊</span>, label: 'Dashboard', route: '/dashboard' },
    { icon: () => <span>💶</span>, label: 'Transactions', route: '/transactions' },
    { icon: () => <span>📊</span>, label: 'Budget', route: '/budget' },
    { icon: () => <span>👛</span>, label: 'Accounts', route: '/accounts' },
    { icon: () => <span>⋯</span>, label: 'More', route: '/more' },
  ];

  return (
    <Paper
      pos="fixed"
      bottom={0}
      left={0}
      right={0}
      h={80}
      style={{
        zIndex: 100,
        borderTop: '1px solid var(--mantine-color-dark-4)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      radius={0}
    >
      <Group justify="space-around" align="center" h="100%" px="xs" gap={0}>
        {items.map((item) => {
          const isActive =
            location.pathname === item.route ||
            (item.route === '/dashboard' && location.pathname === '/');
          return (
            <UnstyledButton
              key={item.label}
              onClick={() => navigate(item.route)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
              }}
            >
              <ThemeIcon
                variant={isActive ? 'light' : 'transparent'}
                color={isActive ? 'cyan' : 'gray'}
                size="lg"
                radius="md"
              >
                <item.icon />
              </ThemeIcon>
              <Text size="xs" mt={4} c={isActive ? 'cyan' : 'dimmed'} fw={500}>
                {item.label}
              </Text>
            </UnstyledButton>
          );
        })}
      </Group>
    </Paper>
  );
}
