import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Group, NumberInput, Paper, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { BudgetCategoryResponse } from '@/types/budget';
import styles from './Budget.module.css';

interface BudgetCategoryItemProps {
  category: BudgetCategoryResponse;
  spent: number;
  isEditing: boolean;
  editingValue: number;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditChange: (value: number) => void;
  onEditSave: () => void;
  onDelete: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function BudgetCategoryItem({
  category,
  spent,
  isEditing,
  editingValue,
  onEditStart,
  onEditCancel,
  onEditChange,
  onEditSave,
  onDelete,
  inputRef,
}: BudgetCategoryItemProps) {
  const { t } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const percentage = category.budgetedValue > 0 ? (spent / category.budgetedValue) * 100 : 0;

  const getProgressStatus = (pct: number) => {
    if (pct > 100) {
      return 'danger';
    }
    if (pct >= 85) {
      return 'warning';
    }
    return 'success';
  };

  const status = getProgressStatus(percentage);

  return (
    <Paper className={styles.budgetCategoryItem} withBorder p="lg" radius="md">
      <Stack gap="md">
        {/* Header: Icon, Name, and Actions */}
        <Group justify="space-between" align="flex-start">
          <Group gap="md" align="flex-start" flex={1}>
            <div className={styles.categoryIconWrapper}>{category.category.icon}</div>
            <Stack gap={4} flex={1}>
              <Text fw={600} size="sm">
                {category.category.name}
              </Text>
              <div className={styles.amountsSection}>
                <span className={styles.spentAmount}>
                  <CurrencyValue cents={spent} />
                </span>
                <span className={styles.budgetAmount}>
                  {t('budget.budgetedCategories.of').replace('{{budget}}', '')}
                  {/* Using a separate component for the value to handle formatting correctly */}
                  <CurrencyValue cents={category.budgetedValue} />
                </span>
              </div>
            </Stack>
          </Group>
          <Group className={styles.itemActions} gap={4}>
            {isEditing ? (
              <>
                <ActionIcon
                  variant="light"
                  color="blue"
                  onClick={onEditSave}
                  aria-label="Save budget category"
                >
                  <span>✅</span>
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={onEditCancel}
                  aria-label="Cancel budget category edit"
                >
                  <span>❌</span>
                </ActionIcon>
              </>
            ) : (
              <>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={onEditStart}
                  aria-label="Edit budget category"
                >
                  <span>✏️</span>
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={onDelete}
                  aria-label="Delete budget category"
                >
                  <span>🗑️</span>
                </ActionIcon>
              </>
            )}
          </Group>
        </Group>

        {/* Editing Mode */}
        {isEditing && (
          <NumberInput
            ref={inputRef}
            value={editingValue}
            onChange={(value) => {
              const parsedValue =
                typeof value === 'number' ? value : Number.parseFloat(value || '');
              onEditChange(Number.isFinite(parsedValue) ? parsedValue : 0);
            }}
            decimalScale={globalCurrency.decimalPlaces}
            fixedDecimalScale
            size="sm"
            variant="filled"
            hideControls
            leftSection={<Text size="sm">{globalCurrency.symbol}</Text>}
            placeholder="0.00"
            autoFocus
          />
        )}

        {/* Progress Bar */}
        <div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${styles[status]}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">
              {percentage.toFixed(0)}%{' '}
              {status === 'success'
                ? t('budget.budgetedCategories.onTrack')
                : status === 'warning'
                  ? t('budget.budgetedCategories.nearLimit')
                  : t('budget.budgetedCategories.overBudget')}
            </Text>
            <Text size="xs" c="dimmed">
              <CurrencyValue cents={Math.max(0, category.budgetedValue - spent)} />{' '}
              {percentage > 100
                ? t('budget.budgetedCategories.over')
                : t('budget.budgetedCategories.remaining')}
            </Text>
          </Group>
        </div>
      </Stack>
    </Paper>
  );
}
