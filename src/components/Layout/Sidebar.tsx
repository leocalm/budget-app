import { AppShell, Group, ScrollArea } from '@mantine/core';
import { Logo } from './Logo';
import { Navigation } from './Navigation';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <AppShell.Navbar p="md" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
      <AppShell.Section>
        <Group justify="space-between" mb="xl">
          <Logo />
        </Group>
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea}>
        <Navigation onNavigate={onNavigate} />
      </AppShell.Section>

      {/* Desktop sidebar should not show the UserMenu (session area) */}
    </AppShell.Navbar>
  );
}
