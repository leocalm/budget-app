import type { ReactNode } from 'react';
import { Paper, Stack, Text, Transition } from '@mantine/core';
import { Logo } from '@/components/Layout/Logo';

interface AuthCardProps {
  tagline?: string;
  children: ReactNode;
}

export function AuthCard({ tagline, children }: AuthCardProps) {
  return (
    <Paper withBorder shadow="none" p={30} radius="md">
      <Stack gap="md">
        <Stack gap={4} align="center" mb="xs">
          <Logo />
          {tagline && (
            <Text size="sm" c="dimmed" ta="center">
              {tagline}
            </Text>
          )}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

interface AuthMessageProps {
  message: string | null;
}

export function AuthMessage({ message }: AuthMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <Transition mounted transition="fade" duration={150}>
      {(styles) => (
        <Text
          role="status"
          aria-live="polite"
          size="sm"
          c="dimmed"
          style={{
            ...styles,
            padding: '10px',
            border: '1px solid var(--mantine-color-default-border)',
            borderRadius: 'var(--mantine-radius-md)',
            background: 'var(--mantine-color-default)',
          }}
        >
          {message}
        </Text>
      )}
    </Transition>
  );
}
