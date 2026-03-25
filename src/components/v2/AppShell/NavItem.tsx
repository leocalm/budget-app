import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import { Group, Text, Tooltip } from '@mantine/core';
import { useV2Theme } from '@/theme/v2';
import classes from './AppShell.module.css';

interface NavItemProps {
  /** Tabler icon component */
  icon: ComponentType<{ size?: number | string; stroke?: number; color?: string }>;
  /** Navigation label */
  label: string;
  /** Route path to navigate to */
  to: string;
  /** Show a dot indicator (e.g., active overlay) */
  dot?: boolean;
  /** Whether the sidebar is collapsed (icon-only mode) */
  collapsed?: boolean;
}

export function NavItem({ icon: Icon, label, to, dot, collapsed }: NavItemProps) {
  const { accents } = useV2Theme();

  const link = (
    <NavLink
      to={to}
      className={({ isActive }) =>
        collapsed
          ? `${classes.navItemCollapsed}${isActive ? ` ${classes.navItemActive}` : ''}`
          : `${classes.navItem}${isActive ? ` ${classes.navItemActive}` : ''}`
      }
      data-testid={`nav-item-${label.toLowerCase().replace(/\s+/g, '-')}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {({ isActive }) => (
        <Group gap="sm" wrap="nowrap" justify={collapsed ? 'center' : undefined}>
          <Icon size={22} stroke={1.5} color={isActive ? accents.primary : undefined} />
          {!collapsed && (
            <Text
              fz="sm"
              fw={isActive ? 500 : 400}
              style={{ color: isActive ? accents.primary : undefined }}
            >
              {label}
            </Text>
          )}
          {!collapsed && dot && <span className={classes.navDot} />}
        </Group>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip label={label} position="right" withArrow>
        {link}
      </Tooltip>
    );
  }

  return link;
}
