import React, { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Popover,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateCategory } from '@/hooks/useCategories';
import { CATEGORY_TYPES, CategoryRequest, CategoryType } from '@/types/category';

interface CreateCategoryFormProps {
  onCategoryCreated?: () => void;
}

export function CreateCategoryForm({ onCategoryCreated }: CreateCategoryFormProps) {
  const createMutation = useCreateCategory();
  const [opened, setOpened] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('❤️');

  const emojiSelected = (values: typeof form.values, emoji: EmojiClickData) => {
    values.icon = emoji.emoji;
    setOpened(false);
  };

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      color: 'red',
      icon: '❤️',
      parentId: null,
      categoryType: '',
    },

    validate: {
      name: (value) => (!value || value.length < 2 ? 'Name must have at least 2 letters' : null),
    },
  });

  const submitForm = async (values: typeof form.values) => {
    const categoryData: CategoryRequest = {
      name: values.name,
      color: values.color,
      icon: values.icon,
      parentId: null,
      categoryType: values.categoryType as CategoryType,
    };

    createMutation.mutate(categoryData, {
      onSuccess: () => {
        form.reset();
        onCategoryCreated?.();
      },
    });
  };

  return (
    <form onSubmit={form.onSubmit((values) => submitForm(values))}>
      <Stack gap="md">
        {createMutation.isError && (
          <Alert color="red" variant="light">
            {createMutation.error.message || 'Failed to create category'}
          </Alert>
        )}

        <Grid gutter="md" align="flex-end">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group gap="xs" align="flex-end" wrap="nowrap">
              <Box style={{ flexShrink: 0 }}>
                <Popover
                  opened={opened}
                  onChange={setOpened}
                  position="bottom-start"
                  withArrow
                  shadow="md"
                  width={250}
                >
                  <Popover.Target>
                    <ActionIcon
                      variant="outline"
                      size={36} // Matches standard Mantine input height
                      radius="md"
                      onClick={() => setOpened((o) => !o)}
                      styles={{
                        root: {
                          borderColor: 'var(--mantine-color-default-border)',
                          color: 'var(--mantine-color-dimmed)',
                        },
                      }}
                    >
                      {selectedIcon}
                    </ActionIcon>
                  </Popover.Target>

                  <Popover.Dropdown p="xs">
                    <EmojiPicker
                      open={opened}
                      onEmojiClick={(emojiData) => emojiSelected(form.values, emojiData)}
                    />
                  </Popover.Dropdown>
                </Popover>
              </Box>
              <TextInput
                label="Category Name"
                placeholder="e.g. Rent, Groceries"
                style={{ flex: 1 }}
                {...form.getInputProps('name')}
                required
              />
            </Group>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Type"
              placeholder="Select type"
              data={[...CATEGORY_TYPES]}
              searchable
              {...form.getInputProps('categoryType')}
              required
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="lg">
          <Button type="submit" px="xl">
            Create Category
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
