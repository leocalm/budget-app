import { AppShell, Burger, Group, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { BudgetPeriodSelector } from '@/components/BudgetPeriodSelector/BudgetPeriodSelector';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { Logo } from '@/components/Layout/Logo';
import { Sidebar } from '@/components/Layout/Sidebar';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetPeriods } from '@/hooks/useBudget';

export function BasicAppShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { data: periods = [] } = useBudgetPeriods();
  const { selectedPeriodId, setSelectedPeriodId } = useBudgetPeriodSelection();

  return (
    <AppShell
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
          {isMobile && (
            <div style={{ width: 120 }}>
              <BudgetPeriodSelector
                periods={periods}
                selectedPeriodId={selectedPeriodId}
                onPeriodChange={setSelectedPeriodId}
              />
            </div>
          )}
        </Group>
      </AppShell.Header>

      <Sidebar onNavigate={close} />

      <AppShell.Main pb={isMobile ? 80 : undefined}>{children}</AppShell.Main>

      {isMobile && <BottomNavigation />}
    </AppShell>
  );
}
