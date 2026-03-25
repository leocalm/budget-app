import { useLocation, useNavigate } from 'react-router-dom';
import { Group, Text, UnstyledButton } from '@mantine/core';
import { useV2Theme } from '@/theme/v2';
import classes from './AppShell.module.css';

interface NavItemProps {
  /** Emoji icon displayed before the label */
  icon: string;
  /** Navigation label */
  label: string;
  /** Route path to navigate to */
  to: string;
  /** Show a dot indicator (e.g., active overlay) */
  dot?: boolean;
  /** Whether the sidebar is collapsed (icon-only mode) */
  collapsed?: boolean;
}

export function NavItem({ icon, label, to, dot, collapsed }: NavItemProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { accents } = useV2Theme();

  const isActive = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <UnstyledButton
      className={classes.navItem}
      data-active={isActive || undefined}
      data-testid={`nav-item-${label.toLowerCase()}`}
      onClick={() => navigate(to)}
      title={collapsed ? label : undefined}
    >
      <Group gap="sm" wrap="nowrap">
        <Text component="span" fz="md">
          {icon}
        </Text>
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
    </UnstyledButton>
  );
}
