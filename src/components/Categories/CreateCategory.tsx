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
import { CreateCategoryForm } from './CreateCategoryForm';

export function CreateCategory() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();

  const onCategoryCreatedInternal = () => {
    close();
  };

  return (
    <Stack gap="md" w="100%">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2} fw={800}>
            Categories
          </Title>
          <Text size="sm" c="dimmed">
            Organize your transactions into meaningful groups.
          </Text>
        </div>
        <Button
          onClick={toggle}
          variant={opened ? 'light' : 'filled'}
          color={opened ? 'gray' : 'blue'}
          leftSection={opened ? <IconX size={18} /> : <IconPlus size={18} />}
        >
          {opened ? 'Cancel' : 'Add Category'}
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
                New Category Details
              </Text>
              <Text size="xs" c="dimmed">
                Define the name and icon for your new spending or income category.
              </Text>
            </div>
            <Divider variant="dashed" />
            <CreateCategoryForm onCategoryCreated={onCategoryCreatedInternal} />
          </Stack>
        </Paper>
      </Collapse>
    </Stack>
  );
}
