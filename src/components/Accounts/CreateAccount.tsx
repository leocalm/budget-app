import { IconPlus, IconX } from '@tabler/icons-react';
import {
  Button,
  Collapse,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreateAccountForm } from './CreateAccountForm';

interface CreateAccountProps {
  onAccountCreated: () => void;
}

export function CreateAccount({ onAccountCreated }: CreateAccountProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();

  const onAccountCreatedInternal = () => {
    close();
    onAccountCreated();
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2} fw={800}>
            Accounts
          </Title>
          <Text size="sm" c="dimmed">
            Manage your banks, wallets, and credit cards.
          </Text>
        </div>
        <Button
          onClick={toggle}
          variant={opened ? 'light' : 'filled'}
          color={opened ? 'gray' : 'blue'}
          leftSection={opened ? <IconX size={18} /> : <IconPlus size={18} />}
        >
          {opened ? 'Cancel' : 'Add Account'}
        </Button>
      </Group>

      <Collapse in={opened}>
        <Paper
          withBorder
          p="xl"
          radius="md"
          mb="xl"
          style={{
            background:
              colorScheme === 'dark'
                ? 'var(--mantine-color-dark-6)'
                : 'var(--mantine-color-gray-0)',
          }}
        >
          <Stack gap="md">
            <div>
              <Text fw={700} size="lg">
                New Account Details
              </Text>
              <Text size="xs" c="dimmed">
                Fill in the information below to add a new account to your budget.
              </Text>
            </div>
            <Divider variant="dashed" />
            <CreateAccountForm onAccountCreated={onAccountCreatedInternal} />
          </Stack>
        </Paper>
      </Collapse>
    </Stack>
  );
}
