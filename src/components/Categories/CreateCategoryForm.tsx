import { Alert, Button, Group, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateCategory } from '@/hooks/useCategories';
import { CATEGORY_TYPES, CategoryRequest, CategoryType } from '@/types/category';
import { getIcon, iconMap } from '@/utils/IconMap';
import { IconSelector } from '@/utils/IconSelector';

export function CreateCategoryForm() {
  const createMutation = useCreateCategory();

  const iconOptions = Object.keys(iconMap).map((key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }));

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      color: 'red',
      icon: 'wallet',
      parent_id: null,
      category_type: '',
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
      parent_id: null,
      category_type: values.category_type as CategoryType,
    };

    createMutation.mutate(categoryData, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <form onSubmit={form.onSubmit((values) => submitForm(values))}>
      {createMutation.isError && (
        <Alert color="red" mb="md" title="Error">
          {createMutation.error.message || 'Failed to create category'}
        </Alert>
      )}

      {createMutation.isSuccess && (
        <Alert color="green" mb="md" title="Success">
          Category created successfully!
        </Alert>
      )}

      <Select
        withAsterisk
        placeholder="Select icon"
        data={iconOptions}
        renderOption={({ option }) => (
          <Group gap="xs">
            {getIcon(option.value, 16)}
            {option.label}
          </Group>
        )}
        searchable
        key={form.key('icon')}
        {...form.getInputProps('icon')}
        radius="xl"
      />

      <IconSelector
        value={form.key('icon')}
        onChange={(icon) => form.setFieldValue('icon', icon)}
      />

      <TextInput
        withAsterisk
        label="Category Name"
        placeholder="Category Name"
        key={form.key('name')}
        {...form.getInputProps('name')}
        radius="xl"
      />

      <Select
        withAsterisk
        label="Category Type"
        placeholder="Category Type"
        data={[...CATEGORY_TYPES]}
        key={form.key('category_type')}
        {...form.getInputProps('category_type')}
        radius="xl"
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Create Category</Button>
      </Group>
    </form>
  );
}
