import {
  Avatar,
  Button,
  Container,
  Group,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';

export function SettingsPage() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Container size="lg">
      <Stack gap="xl">
        <div>
          <Title order={2}>Settings</Title>
          <Text c="dimmed">Manage your preferences and account settings</Text>
        </div>

        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="xs">
                Profile Information
              </Title>
              <Text c="dimmed" size="sm">
                Update your personal details
              </Text>
            </div>

            <Group align="flex-start">
              <Avatar size={80} radius={80} color="cyan">
                JD
              </Avatar>
              <Stack style={{ flex: 1 }}>
                <Group grow>
                  <TextInput label="First Name" defaultValue="John" />
                  <TextInput label="Last Name" defaultValue="Doe" />
                </Group>
                <TextInput label="Email" defaultValue="john@example.com" />
              </Stack>
            </Group>

            <Group justify="flex-end">
              <Button leftSection={<span>💾</span>}>Save Changes</Button>
            </Group>
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="xs">
                Appearance
              </Title>
              <Text c="dimmed" size="sm">
                Customize how the application looks
              </Text>
            </div>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Theme Mode</Text>
                <Text c="dimmed" size="sm">
                  Switch between light and dark mode
                </Text>
              </div>
              <Switch
                size="lg"
                onLabel={<span style={{ fontSize: 16 }}>☀️</span>}
                offLabel={<span style={{ fontSize: 16 }}>🌙</span>}
                checked={colorScheme === 'dark'}
                onChange={() => toggleColorScheme()}
              />
            </Group>
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="xs">
                Preferences
              </Title>
              <Text c="dimmed" size="sm">
                Regional and application settings
              </Text>
            </div>

            <Select
              label="Currency"
              description="Select your preferred currency for display"
              data={['EUR (€)', 'USD ($)', 'GBP (£)', 'JPY (¥)']}
              defaultValue="EUR (€)"
              w={300}
            />

            <Select
              label="Language"
              description="Select your preferred language"
              data={['English', 'Spanish', 'French', 'German']}
              defaultValue="English"
              w={300}
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
