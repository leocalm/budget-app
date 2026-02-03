import React from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDeleteBudgetCategory, useUpdateBudgetCategory } from '@/hooks/useCategories';
import { BudgetCategoryResponse } from '@/types/budget';
import { convertCentsToDisplay, convertDisplayToCents } from '@/utils/currency';
import { BudgetCategoryItem } from './BudgetCategoryItem';

interface BudgetedCategoriesProps {
  editingId: string | null;
  onEditingChange: (id: string | null) => void;
  categories: BudgetCategoryResponse[];
  categorySpending: Map<string, number>;
}

export function BudgetedCategories({
  editingId,
  onEditingChange,
  categories,
  categorySpending,
}: BudgetedCategoriesProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteBudgetCategory();
  const updateMutation = useUpdateBudgetCategory();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const form = useForm({
    initialValues: {
      budgetedValue: 0,
    },
    validate: {
      budgetedValue: (value) =>
        value < 0 ? t('budget.budgetedCategories.error.positiveValue') : null,
    },
  });

  React.useEffect(() => {
    if (editingId) {
      const category = categories?.find((c) => c.id === editingId);
      if (category) {
        form.setValues({
          budgetedValue: convertCentsToDisplay(category.budgetedValue),
        });
      } else {
        form.setValues({ budgetedValue: 0 });
      }
    }
  }, [editingId, categories]);

  React.useEffect(() => {
    if (editingId && inputRef.current) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [editingId]);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSave = (values: typeof form.values) => {
    if (!editingId) {
      return;
    }

    updateMutation.mutate({
      id: editingId,
      payload: convertDisplayToCents(values.budgetedValue),
    });

    onEditingChange(null);
  };

  // Calculate how many are on track
  const onTrackCount = categories.filter((cat) => {
    const spent = categorySpending.get(cat.category.id) || 0;
    const percentage = cat.budgetedValue > 0 ? (spent / cat.budgetedValue) * 100 : 0;
    return percentage <= 100;
  }).length;

  if (categories.length === 0) {
    return (
      <Paper shadow="sm" radius="md" p="xl" withBorder h="100%">
        <Stack gap="md" align="center" justify="center" style={{ minHeight: 300 }}>
          <Title order={3} fw={700}>
            {t('budget.budgetedCategories.noCategories')}
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            {t('budget.budgetedCategories.addFirst')}
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" radius="md" p="xl" withBorder h="100%">
      <form onSubmit={form.onSubmit(handleSave)}>
        <Stack gap="md">
          <div>
            <Group justify="space-between" align="flex-end">
              <div>
                <Title order={3} fw={700}>
                  {t('budget.budgetedCategories.title')}
                </Title>
                <Text size="xs" c="dimmed" mt={4}>
                  {t('budget.budgetedCategories.status', {
                    onTrack: onTrackCount,
                    total: categories.length,
                  })}
                </Text>
              </div>
            </Group>
          </div>

          <Divider variant="dashed" />

          <Stack gap="md">
            {categories.map((category) => (
              <BudgetCategoryItem
                key={category.id}
                category={category}
                spent={categorySpending.get(category.category.id) || 0}
                isEditing={editingId === category.id}
                editingValue={
                  editingId === category.id
                    ? form.values.budgetedValue
                    : category.budgetedValue / 100
                }
                onEditStart={() => {
                  onEditingChange(category.id);
                  form.setValues({ budgetedValue: category.budgetedValue / 100 });
                }}
                onEditCancel={() => onEditingChange(null)}
                onEditChange={(value) => form.setFieldValue('budgetedValue', value)}
                onEditSave={() => handleSave(form.values)}
                onDelete={() => handleDelete(category.id)}
                inputRef={inputRef}
              />
            ))}
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}
