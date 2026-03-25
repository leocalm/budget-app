import { Outlet } from 'react-router-dom';
import { AppShell, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { PeriodSelector } from '@/components/v2/PeriodSelector';
import { useMe } from '@/hooks/v2/useAuth';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import { Sidebar } from './Sidebar';

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 60;

export function V2AppShell() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [collapsed, { toggle: toggleCollapse }] = useDisclosure(false);
  const { data: user } = useMe();

  const userName = user?.name ?? 'User';
  const userEmail = user?.email ?? '';

  // Auto-collapse on medium screens (between sm and md)
  const isNarrow = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const effectiveCollapsed = isMobile ? false : collapsed || (isNarrow ?? false);
  const sidebarWidth = effectiveCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <AppShell
      navbar={
        isMobile
          ? undefined
          : {
              width: sidebarWidth,
              breakpoint: 'sm',
            }
      }
      header={isMobile ? { height: 'auto' } : undefined}
      footer={isMobile ? { height: 'auto' } : undefined}
      padding="md"
      styles={{
        root: {
          backgroundColor: 'var(--v2-bg)',
          minHeight: '100vh',
        },
        navbar: {
          backgroundColor: 'var(--v2-card)',
          borderRight: '1px solid var(--v2-border)',
        },
        header: {
          backgroundColor: 'var(--v2-bg)',
          borderBottom: 'none',
        },
        footer: {
          backgroundColor: 'var(--v2-card)',
          borderTop: 'none',
          padding: 0,
        },
        main: {
          backgroundColor: 'var(--v2-bg)',
        },
      }}
    >
      {/* Desktop sidebar */}
      {!isMobile && (
        <AppShell.Navbar data-testid="desktop-sidebar">
          <Sidebar
            collapsed={effectiveCollapsed}
            onToggleCollapse={toggleCollapse}
            periodSelector={<PeriodSelector variant="sidebar" />}
            user={{ name: userName, email: userEmail }}
          />
        </AppShell.Navbar>
      )}

      {/* Mobile header */}
      {isMobile && (
        <AppShell.Header data-testid="mobile-app-header">
          <MobileHeader userName={userName} periodSelector={<PeriodSelector variant="pill" />} />
        </AppShell.Header>
      )}

      {/* Main content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <AppShell.Footer data-testid="mobile-app-footer">
          <BottomNav />
        </AppShell.Footer>
      )}
    </AppShell>
  );
}
