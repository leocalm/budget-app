import type { ReactNode } from 'react';
import { Stack, Text } from '@mantine/core';

interface NavGroupProps {
  /** Section label (e.g., "OVERVIEW", "PLANNING") */
  label: string;
  /** NavItem children */
  children: ReactNode;
  /** Whether the sidebar is collapsed (hides the label) */
  collapsed?: boolean;
}

export function NavGroup({ label, children, collapsed }: NavGroupProps) {
  return (
    <Stack gap={2} mb="md" role="group" aria-label={label}>
      {!collapsed && (
        <Text
          fz={10}
          fw={600}
          tt="uppercase"
          c="dimmed"
          px="sm"
          mb={4}
          style={{ letterSpacing: '0.08em' }}
        >
          {label}
        </Text>
      )}
      {children}
    </Stack>
  );
}
