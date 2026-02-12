import React, { Suspense, useState } from 'react';
import type { EmojiClickData } from 'emoji-picker-react';
import { useTranslation } from 'react-i18next';
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

const EmojiPicker = React.lazy(() => import('emoji-picker-react'));

interface CreateCategoryFormProps {
  onCategoryCreated?: () => void;
  selectedPeriodId: string | null;
}

export function CreateCategoryForm({
  onCategoryCreated,
  selectedPeriodId,
}: CreateCategoryFormProps) {
  const createMutation = useCreateCategory(selectedPeriodId);
  const [opened, setOpened] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('❤️');
  const { t } = useTranslation();

  const emojiSelected = (values: typeof form.values, emoji: EmojiClickData) => {
    values.icon = emoji.emoji;
    setSelectedIcon(emoji.emoji);
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
      name: (value) =>
        !value || value.length < 2 ? t('categories.forms.validation.nameMinLength') : null,
    },
  });

  const categoryTypeOptions = CATEGORY_TYPES.map((categoryType) => ({
    value: categoryType,
    label: t(`categories.types.${categoryType}`, { defaultValue: categoryType }),
  }));

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
            {createMutation.error.message || t('categories.forms.errors.createFailed')}
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
                    <Suspense fallback={<div>{t('categories.forms.loadingEmojiPicker')}</div>}>
                      <EmojiPicker
                        open={opened}
                        onEmojiClick={(emojiData: EmojiClickData) =>
                          emojiSelected(form.values, emojiData)
                        }
                      />
                    </Suspense>
                  </Popover.Dropdown>
                </Popover>
              </Box>
              <TextInput
                label={t('categories.forms.fields.name.label')}
                placeholder={t('categories.forms.fields.name.placeholder')}
                style={{ flex: 1 }}
                {...form.getInputProps('name')}
                required
              />
            </Group>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label={t('categories.forms.fields.type.label')}
              placeholder={t('categories.forms.fields.type.placeholder')}
              data={categoryTypeOptions}
              searchable
              {...form.getInputProps('categoryType')}
              required
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="lg">
          <Button type="submit" px="xl">
            {t('categories.forms.buttons.create')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
