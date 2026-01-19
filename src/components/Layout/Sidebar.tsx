import { AppShell, Group, ScrollArea } from '@mantine/core';
import { BudgetPeriodSelector } from '@/components/BudgetPeriodSelector/BudgetPeriodSelector';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetPeriods } from '@/hooks/useBudget';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { data: periods = [] } = useBudgetPeriods();
  const { selectedPeriodId, setSelectedPeriodId } = useBudgetPeriodSelection();

  return (
    <AppShell.Navbar p="md" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
      <AppShell.Section>
        <Group justify="space-between" mb="xl">
          <Logo />
        </Group>
        <div style={{ marginBottom: 'var(--mantine-spacing-xl)' }}>
          <BudgetPeriodSelector
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onPeriodChange={setSelectedPeriodId}
          />
        </div>
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea}>
        <Navigation onNavigate={onNavigate} />
      </AppShell.Section>

      <AppShell.Section pt="md" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
        <UserMenu />
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
