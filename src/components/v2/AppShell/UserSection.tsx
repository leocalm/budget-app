import { IconMoon, IconSun } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Avatar,
  Group,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import classes from './AppShell.module.css';

interface UserSectionProps {
  /** User display name */
  name: string;
  /** User email */
  email: string;
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
}

export function UserSection({ name, email, collapsed }: UserSectionProps) {
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (collapsed) {
    return (
      <Stack align="center" gap="xs" className={classes.userSection}>
        <Avatar
          component="button"
          size="sm"
          radius="xl"
          data-testid="user-avatar"
          onClick={() => navigate('/v2/settings')}
          style={{ cursor: 'pointer' }}
          aria-label="Go to settings"
        >
          {initials}
        </Avatar>
      </Stack>
    );
  }

  return (
    <Group
      className={classes.userSection}
      wrap="nowrap"
      justify="space-between"
      data-testid="user-section"
    >
      <UnstyledButton
        onClick={() => navigate('/v2/settings')}
        style={{ overflow: 'hidden', flex: 1 }}
      >
        <Group gap="sm" wrap="nowrap">
          <Avatar size="sm" radius="xl">
            {initials}
          </Avatar>
          <Stack gap={0} style={{ overflow: 'hidden' }}>
            <Text fz="sm" fw={500} truncate>
              {name}
            </Text>
            <Text fz="xs" c="dimmed" truncate>
              {email}
            </Text>
          </Stack>
        </Group>
      </UnstyledButton>
      <ActionIcon
        variant="subtle"
        size="sm"
        onClick={toggleColorScheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Group>
  );
}
