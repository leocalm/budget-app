import type { ReactNode } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { ActionIcon, AppShell, Group, Image, ScrollArea, Stack, Text } from '@mantine/core';
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

export function Sidebar({ collapsed, onToggleCollapse, periodSelector, user }: SidebarProps) {
  return (
    <>
      {/* Logo + collapse toggle */}
      <AppShell.Section>
        <Group
          className={classes.sidebarHeader}
          justify={collapsed ? 'center' : 'space-between'}
          wrap="nowrap"
        >
          {(() => {
            const logo = (
              <Image
                src="/piggy-pulse-icon.svg"
                alt="PiggyPulse"
                w={28}
                h={28}
                fallbackSrc="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'><text y='22' font-size='22'>🐷</text></svg>"
              />
            );
            return !collapsed ? (
              <Group gap="xs" wrap="nowrap">
                {logo}
                <Text fw={700} fz="md" ff="var(--mantine-font-family-headings)">
                  PiggyPulse
                </Text>
              </Group>
            ) : (
              logo
            );
          })()}
          <ActionIcon
            variant="subtle"
            size="xs"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            data-testid="sidebar-toggle"
          >
            {collapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
          </ActionIcon>
        </Group>
      </AppShell.Section>

      {/* Period selector */}
      {!collapsed && periodSelector && (
        <AppShell.Section px="sm" mb="md">
          {periodSelector}
        </AppShell.Section>
      )}

      {/* Navigation */}
      <AppShell.Section grow component={ScrollArea} px="xs">
        <Stack gap={0}>
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
      <AppShell.Section px="sm" pb="sm">
        <UserSection name={user.name} email={user.email} collapsed={collapsed} />
      </AppShell.Section>
    </>
  );
}
