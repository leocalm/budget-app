import { Menu, Group, Avatar, Text, UnstyledButton, rem } from '@mantine/core';

export function UserMenu() {
  return (
    <Menu shadow="md" width={200} position="right-end">
      <Menu.Target>
        <UnstyledButton
          w="100%"
          p="xs"
          style={{ borderRadius: '8px', transition: 'background-color 0.2s' }}
        >
          <Group>
            <Avatar radius="xl" color="cyan">
              JD
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                John Doe
              </Text>
              <Text c="dimmed" size="xs">
                john@example.com
              </Text>
            </div>
            <span style={{ fontSize: 14 }}>➡️</span>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Application</Menu.Label>
        <Menu.Item leftSection={<span style={{ fontSize: 14 }}>👤</span>}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<span style={{ fontSize: 14 }}>⚙️</span>}>
          Settings
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<span style={{ fontSize: 14 }}>🚪</span>}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}