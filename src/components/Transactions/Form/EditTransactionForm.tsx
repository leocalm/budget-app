import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { AccountResponse } from '@/types/account';
import { CategoryResponse, CategoryType } from '@/types/category';
import { TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { convertCentsToDisplay } from '@/utils/currency';
import { getIcon, iconMap } from '@/utils/IconMap';

interface EditTransactionFormProps {
  transaction: TransactionResponse;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
  onSave: (data: EditFormValues) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

export interface EditFormValues {
  description: string;
  amount: number;
  occurredAt: Date | null;
  categoryId: string;
  categoryType: CategoryType;
  fromAccountId: string;
  toAccountId: string;
  vendorName: string;
}

const inputStyles = {
  input: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-medium)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    '&:focus': {
      borderColor: 'var(--accent-primary)',
      boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
    },
  },
  label: {
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
};

const renderAccountIcon = (icon?: string) => {
  if (icon && iconMap[icon]) {
    return getIcon(icon, 16);
  }

  if (icon) {
    return <span aria-hidden>{icon}</span>;
  }

  return getIcon('wallet', 16);
};

export const EditTransactionForm = ({
  transaction,
  accounts,
  categories,
  vendors,
  onSave,
  onCancel,
  isPending = false,
}: EditTransactionFormProps) => {
  const { t } = useTranslation();
  const form = useForm<EditFormValues>({
    initialValues: {
      description: transaction.description,
      amount: convertCentsToDisplay(transaction.amount),
      occurredAt: new Date(transaction.occurredAt),
      categoryType: transaction.category.categoryType,
      categoryId: transaction.category.id,
      fromAccountId: transaction.fromAccount.id,
      toAccountId: transaction.toAccount?.id || '',
      vendorName: transaction.vendor?.name || '',
    },
    validate: {
      description: (value) => {
        if (!value || value.trim().length === 0) {
          return t('transactions.quickAddTransaction.error.description.required');
        }
        return null;
      },
      amount: (value) => {
        if (!value || value <= 0) {
          return t('transactions.quickAddTransaction.error.amount.greaterThanZero');
        }
        return null;
      },
      occurredAt: (value) =>
        !value ? t('transactions.quickAddTransaction.error.occurredAt.required') : null,
      fromAccountId: (value) =>
        !value ? t('transactions.quickAddTransaction.error.fromAccount.required') : null,
      categoryId: (value) =>
        !value ? t('transactions.quickAddTransaction.error.category.required') : null,
    },
  });

  // Filter categories by transaction type
  const filteredCategories = categories.filter(
    (cat) => cat.categoryType === form.values.categoryType
  );

  const renderAccountOption = ({ option }: { option: { value: string; label: string } }) => {
    const account = accounts.find((acc) => acc.id === option.value);

    return (
      <Group gap="xs" wrap="nowrap">
        {renderAccountIcon(account?.icon)}
        <span>{option.label}</span>
      </Group>
    );
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await onSave(values);
      notifications.show({
        title: t('common.success'),
        message: t('transactions.editTransaction.success'),
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: t('common.error'),
        message: t('transactions.editTransaction.error.update'),
        color: 'red',
      });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Date */}
        <DateInput
          label={t('transactions.editTransaction.date.label')}
          value={form.values.occurredAt}
          onChange={(value) => form.setFieldValue('occurredAt', value as Date | null)}
          error={form.errors.occurredAt}
          valueFormat="YYYY-MM-DD"
          styles={inputStyles}
        />

        {/* Description */}
        <TextInput
          label={t('transactions.editTransaction.description.label')}
          placeholder={t('transactions.editTransaction.description.placeholder')}
          value={form.values.description}
          onChange={(e) => form.setFieldValue('description', e.currentTarget.value)}
          error={form.errors.description}
          styles={inputStyles}
        />

        {/* Amount */}
        <NumberInput
          label={t('transactions.editTransaction.amount.label')}
          placeholder="0.00"
          value={form.values.amount}
          onChange={(value) => form.setFieldValue('amount', Number(value) || 0)}
          error={form.errors.amount}
          decimalScale={2}
          fixedDecimalScale
          hideControls
          leftSection={
            <Text size="sm" c="dimmed">
              €
            </Text>
          }
          styles={inputStyles}
        />

        {/* From Account */}
        <Select
          label={t('transactions.editTransaction.fromAccount.label')}
          placeholder={t('transactions.editTransaction.fromAccount.placeholder')}
          value={form.values.fromAccountId}
          onChange={(value) => form.setFieldValue('fromAccountId', value || '')}
          data={accounts.map((acc) => ({
            value: acc.id,
            label: acc.name,
          }))}
          renderOption={renderAccountOption}
          error={form.errors.fromAccountId}
          searchable
          styles={inputStyles}
        />

        {/* To Account (for transfers) */}
        {form.values.categoryType === 'Transfer' && (
          <Select
            label={t('transactions.editTransaction.toAccount.label')}
            placeholder={t('transactions.editTransaction.toAccount.placeholder')}
            value={form.values.toAccountId}
            onChange={(value) => form.setFieldValue('toAccountId', value || '')}
            data={accounts
              .filter((acc) => acc.id !== form.values.fromAccountId)
              .map((acc) => ({
                value: acc.id,
                label: acc.name,
              }))}
            renderOption={renderAccountOption}
            error={form.errors.toAccountId}
            searchable
            styles={inputStyles}
          />
        )}

        {/* Category (not for transfers) */}
        {form.values.categoryType !== 'Transfer' && (
          <Select
            label={t('transactions.editTransaction.category.label')}
            placeholder={t('transactions.editTransaction.category.placeholder')}
            value={form.values.categoryId}
            onChange={(value) => form.setFieldValue('categoryId', value || '')}
            data={filteredCategories.map((cat) => ({
              value: cat.id,
              label: `${cat.icon || ''} ${cat.name}`.trim(),
            }))}
            error={form.errors.categoryId}
            searchable
            styles={inputStyles}
          />
        )}

        {/* Vendor (not for transfers) */}
        {form.values.categoryType !== 'Transfer' && (
          <Autocomplete
            label={t('transactions.editTransaction.vendor.label')}
            placeholder={t('transactions.editTransaction.vendor.placeholder')}
            value={form.values.vendorName}
            onChange={(value) => form.setFieldValue('vendorName', value)}
            data={vendors.map((v) => v.name)}
            styles={inputStyles}
          />
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={onCancel}
            styles={{
              root: {
                color: 'var(--text-secondary)',
                '&:hover': {
                  background: 'var(--bg-elevated)',
                },
              },
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={isPending}
            styles={{
              root: {
                background: 'linear-gradient(135deg, #00d4ff 0%, #b47aff 100%)',
                border: 'none',
                '&:hover': {
                  opacity: 0.9,
                },
              },
            }}
          >
            {t('transactions.editTransaction.saveChanges')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
