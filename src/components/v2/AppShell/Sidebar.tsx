import type { ReactNode } from 'react';
import { IconChevronLeft } from '@tabler/icons-react';
import { ActionIcon, AppShell, Group, Image, ScrollArea, Stack, Text } from '@mantine/core';
import { useV2Theme } from '@/theme/v2';
import { navGroups } from './navConfig';
import { NavGroup } from './NavGroup';
import { NavItem } from './NavItem';
import { UserSection } from './UserSection';
import classes from './AppShell.module.css';

interface SidebarProps {
  /** Whether the sidebar is collapsed (icon-only) */
  collapsed: boolean;
  /** Toggle collapsed state */
  onToggleCollapse: () => void;
  /** Period selector component — rendered between logo and nav */
  periodSelector?: ReactNode;
  /** Current user info */
  user: { name: string; email: string };
}

const LOGO_PATHS: Record<string, string> = {
  moonlit: '/logo/piggy-pulse-moonlit.svg',
  nebula: '/logo/piggy-pulse-nebula.svg',
  frost: '/logo/piggy-pulse-frost.svg',
  twilight: '/logo/piggy-pulse-twilight.svg',
};

export function Sidebar({ collapsed, onToggleCollapse, periodSelector, user }: SidebarProps) {
  const { colorTheme } = useV2Theme();
  const logoSrc = LOGO_PATHS[colorTheme] ?? LOGO_PATHS.nebula;

  const logo = <Image src={logoSrc} alt="PiggyPulse" w={28} h={28} />;

  return (
    <>
      {/* Logo + collapse toggle */}
      <AppShell.Section>
        {collapsed ? (
          <div
            className={classes.sidebarHeaderCollapsed}
            onClick={onToggleCollapse}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onToggleCollapse();
              }
            }}
            aria-label="Expand sidebar"
            data-testid="sidebar-toggle"
            style={{ cursor: 'pointer' }}
          >
            {logo}
          </div>
        ) : (
          <Group className={classes.sidebarHeader} justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              {logo}
              <Text
                fw={700}
                fz="md"
                ff="var(--mantine-font-family-headings)"
                className={classes.brandText}
              >
                PiggyPulse
              </Text>
            </Group>
            <ActionIcon
              variant="subtle"
              size="xs"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              data-testid="sidebar-toggle"
            >
              <IconChevronLeft size={14} />
            </ActionIcon>
          </Group>
        )}
      </AppShell.Section>

      {/* Period selector */}
      {!collapsed && periodSelector && (
        <AppShell.Section px="sm" mb="md">
          {periodSelector}
        </AppShell.Section>
      )}

      {/* Navigation */}
      <AppShell.Section grow component={ScrollArea} p={collapsed ? 'md' : 'xs'}>
        <Stack gap={0} align={collapsed ? 'center' : undefined}>
          {navGroups.map((group) => (
            <NavGroup key={group.label} label={group.label} collapsed={collapsed}>
              {group.items.map((item) => (
                <NavItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  collapsed={collapsed}
                  dot={item.dot}
                />
              ))}
            </NavGroup>
          ))}
        </Stack>
      </AppShell.Section>

      {/* User section */}
      <AppShell.Section px={collapsed ? 0 : 'sm'} pb="sm">
        <UserSection name={user.name} email={user.email} collapsed={collapsed} />
      </AppShell.Section>
    </>
  );
}
