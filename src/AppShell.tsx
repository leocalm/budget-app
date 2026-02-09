import { AppShell, Burger, Group, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { Logo } from '@/components/Layout/Logo';
import { Sidebar } from '@/components/Layout/Sidebar';

export function BasicAppShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <AppShell
      data-testid="app-shell"
      header={{ height: 60, collapsed: !isMobile }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Logo />
          </Group>
        </Group>
      </AppShell.Header>

      <Sidebar onNavigate={close} />

      <AppShell.Main pb={isMobile ? 80 : undefined} data-testid="app-shell-main">
        {children}
      </AppShell.Main>

      {isMobile && <BottomNavigation />}
    </AppShell>
  );
}
