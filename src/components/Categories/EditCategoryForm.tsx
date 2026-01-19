import { useState } from 'react';
import { Alert, Button, Grid, Group, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPicker } from '@/components/Utils/IconPicker';
import { useUpdateCategory } from '@/hooks/useCategories';
import { CATEGORY_TYPES, CategoryRequest, CategoryResponse, CategoryType } from '@/types/category';

interface EditCategoryFormProps {
  category: CategoryResponse;
  onUpdated?: () => void;
}

export function EditCategoryForm({ category, onUpdated }: EditCategoryFormProps) {
  const updateMutation = useUpdateCategory();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: category.name,
      color: category.color,
      icon: category.icon,
      parentId: category.parentId,
      categoryType: category.categoryType as string,
    },
    validate: {
      name: (value) => (!value || value.length < 2 ? 'Name must have at least 2 letters' : null),
    },
  });

  const submitForm = async (values: typeof form.values) => {
    const payload: CategoryRequest = {
      name: values.name,
      color: values.color,
      icon: values.icon,
      parentId: null,
      categoryType: values.categoryType as CategoryType,
    };

    updateMutation.mutate(
      { id: category.id, payload },
      {
        onSuccess: () => onUpdated?.(),
        onError: () => setError('Failed to update category'),
      }
    );
  };

  return (
    <form onSubmit={form.onSubmit((values) => submitForm(values))}>
      <Stack gap="md">
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <Grid gutter="md" align="flex-end">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group gap="xs" align="flex-end" wrap="nowrap">
              <IconPicker
                label="Icon"
                value={form.getValues().icon}
                onChange={(val) => form.setFieldValue('icon', val)}
              />
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
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
