import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Divider,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDeleteBudgetCategory, useUpdateBudgetCategory } from '@/hooks/useCategories';
import { BudgetCategoryResponse } from '@/types/budget';

interface BudgetedCategoriesProps {
  editingId: string | null;
  onEditingChange: (id: string | null) => void;
  categories: BudgetCategoryResponse[];
}

export function BudgetedCategories({
  editingId,
  onEditingChange,
  categories,
}: BudgetedCategoriesProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteBudgetCategory();
  const updateMutation = useUpdateBudgetCategory();
  const inputRef = React.useRef<HTMLInputElement>(null);

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
          budgetedValue: category.budgetedValue / 100,
        });
      } else {
        // If category is not in the list yet, we set a default
        form.setValues({ budgetedValue: 0 });
      }
    }
  }, [editingId, categories]);

  React.useEffect(() => {
    if (editingId && inputRef.current) {
      // The timeout ensures the DOM has painted the new row before focusing
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [editingId, categories]);

  const handleDelete = async (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSave = (values: typeof form.values) => {
    if (!editingId) {
      return;
    }

    updateMutation.mutate({
      id: editingId,
      payload: values.budgetedValue * 100,
    });

    onEditingChange(null);
  };

  const rows = categories?.map((budgetCategory) => {
    const isEditing = editingId === budgetCategory.id;
    const displayValue = budgetCategory.budgetedValue / 100;

    return (
      <Table.Tr key={budgetCategory.id}>
        <Table.Td>
          <Group gap="sm">
            <Text size="sm" fw={500}>
              {budgetCategory.category.icon} {budgetCategory.category.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Group justify="flex-end" gap="xs">
            {isEditing ? (
              <NumberInput
                {...form.getInputProps('budgetedValue')}
                ref={inputRef}
                decimalScale={2}
                fixedDecimalScale
                size="xs"
                w={110}
                variant="filled"
                hideControls
                prefix="€"
              />
            ) : (
              <Text size="sm" fw={700} style={{ fontFamily: 'monospace' }}>
                €{displayValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            )}
          </Group>
        </Table.Td>
        <Table.Td>
          <Group justify="flex-end" gap={4}>
            {isEditing ? (
              <>
                <ActionIcon variant="light" color="blue" type="submit">
                  <span>✅</span>
                </ActionIcon>
                <ActionIcon variant="light" color="gray" onClick={() => onEditingChange(null)}>
                  <span>❌</span>
                </ActionIcon>
              </>
            ) : (
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => {
                  onEditingChange(budgetCategory.id);
                  form.setValues({ budgetedValue: displayValue });
                }}
              >
                <span>✏️</span>
              </ActionIcon>
            )}
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => handleDelete(budgetCategory.id)}
            >
              <span>🗑️</span>
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Paper shadow="sm" radius="md" p="xl" withBorder h="100%">
      <form onSubmit={form.onSubmit(handleSave)}>
        <Stack gap="md">
          <Group justify="space-between" align="flex-end">
            <div>
              <Title order={3} fw={700}>
                {t('budget.budgetedCategories.title')}
              </Title>
              <Text size="xs" c="dimmed">
                {t('budget.budgetedCategories.description')}
              </Text>
            </div>
          </Group>

          <Divider variant="dashed" />

          <ScrollArea offsetScrollbars>
            <Table verticalSpacing="sm" horizontalSpacing="0" variant="simple">
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </Stack>
      </form>
    </Paper>
  );
}
