import type { ReactNode } from 'react';
import { AppShell, Group, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PeriodHeaderControl } from '@/components/BudgetPeriodSelector';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { Logo } from '@/components/Layout/Logo';
import { Sidebar } from '@/components/Layout/Sidebar';
import { UserMenu } from '@/components/Layout/UserMenu';
import { usePageTitle } from '@/hooks/usePageTitle';

const CONTENT_WRAPPER_STYLE = { maxWidth: '1100px', margin: '0 auto' } as const;

export function BasicAppShell({ children }: { children: ReactNode }) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const pageTitle = usePageTitle();

  return (
    <AppShell
      data-testid="app-shell"
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: true, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" align="center">
          {isMobile ? (
            <Logo />
          ) : (
            <Text size="sm" fw={600} c="dimmed" style={{ letterSpacing: '0.01em' }}>
              {pageTitle}
            </Text>
          )}
          <Group gap="sm" align="center" wrap="nowrap" justify="flex-end">
            {!isMobile && <PeriodHeaderControl />}
            <UserMenu variant="topbar" />
          </Group>
        </Group>
      </AppShell.Header>

      <Sidebar />

      <AppShell.Main pb={isMobile ? 80 : undefined} data-testid="app-shell-main">
        <div style={CONTENT_WRAPPER_STYLE}>{children}</div>
      </AppShell.Main>

      {isMobile && <BottomNavigation />}
    </AppShell>
  );
}
