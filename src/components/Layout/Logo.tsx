import { Text, Group, ThemeIcon } from '@mantine/core';

export function Logo() {
  return (
    <Group gap="xs">
      <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'cyan', to: 'violet' }}>
        <span style={{ fontSize: 24 }}>👛</span>
      </ThemeIcon>
      <Text
        size="xl"
        fw={700}
        variant="gradient"
        gradient={{ from: 'white', to: 'cyan' }}
      >
        BudgetApp
      </Text>
    </Group>
  );
}