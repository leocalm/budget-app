import React from 'react';
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
    background: '#1e2433',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    '&:focus': {
      borderColor: '#00d4ff',
      boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
    },
  },
  label: {
    color: '#8892a6',
    marginBottom: '8px',
  },
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
  const form = useForm<EditFormValues>({
    initialValues: {
      description: transaction.description,
      amount: transaction.amount / 100, // Convert from cents to display value
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
          return 'Description is required';
        }
        return null;
      },
      amount: (value) => {
        if (!value || value <= 0) {
          return 'Amount must be greater than 0';
        }
        return null;
      },
      occurredAt: (value) => (!value ? 'Date is required' : null),
      fromAccountId: (value) => (!value ? 'Account is required' : null),
      categoryId: (value) => (!value ? 'Category is required' : null),
    },
  });

  // Filter categories by transaction type
  const filteredCategories = categories.filter(
    (cat) => cat.categoryType === form.values.categoryType
  );

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await onSave(values);
      notifications.show({
        title: 'Success',
        message: 'Transaction updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update transaction',
        color: 'red',
      });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Date */}
        <DateInput
          label="Date"
          value={form.values.occurredAt}
          onChange={(value) => form.setFieldValue('occurredAt', value)}
          error={form.errors.occurredAt}
          valueFormat="YYYY-MM-DD"
          styles={inputStyles}
        />

        {/* Description */}
        <TextInput
          label="Description"
          placeholder="Enter description"
          value={form.values.description}
          onChange={(e) => form.setFieldValue('description', e.currentTarget.value)}
          error={form.errors.description}
          styles={inputStyles}
        />

        {/* Amount */}
        <NumberInput
          label="Amount"
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
          label="Account"
          placeholder="Select account"
          value={form.values.fromAccountId}
          onChange={(value) => form.setFieldValue('fromAccountId', value || '')}
          data={accounts.map((acc) => ({
            value: acc.id,
            label: `${acc.icon || ''} ${acc.name}`.trim(),
          }))}
          error={form.errors.fromAccountId}
          searchable
          styles={inputStyles}
        />

        {/* To Account (for transfers) */}
        {form.values.categoryType === 'Transfer' && (
          <Select
            label="To Account"
            placeholder="Select destination account"
            value={form.values.toAccountId}
            onChange={(value) => form.setFieldValue('toAccountId', value || '')}
            data={accounts
              .filter((acc) => acc.id !== form.values.fromAccountId)
              .map((acc) => ({
                value: acc.id,
                label: `${acc.icon || ''} ${acc.name}`.trim(),
              }))}
            error={form.errors.toAccountId}
            searchable
            styles={inputStyles}
          />
        )}

        {/* Category (not for transfers) */}
        {form.values.categoryType !== 'Transfer' && (
          <Select
            label="Category"
            placeholder="Select category"
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
            label="Vendor (optional)"
            placeholder="Enter vendor name"
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
                color: '#8892a6',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                },
              },
            }}
          >
            Cancel
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
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
