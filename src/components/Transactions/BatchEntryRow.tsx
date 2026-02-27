import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, Button, Group, NumberInput, Select, Table, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { useCreateVendor } from '@/hooks/useVendors';
import { toast } from '@/lib/toast';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionRequest } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { convertDisplayToCents } from '@/utils/currency';

interface BatchEntryRowProps {
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
  onSave: (payload: TransactionRequest) => Promise<void>;
}

interface BatchFormValues {
  occurredAt: string;
  description: string;
  categoryId: string;
  fromAccountId: string;
  toAccountId: string;
  vendorName: string;
  amount: number | '';
}

const today = () => new Date().toISOString().slice(0, 10);

export const BatchEntryRow = ({ accounts, categories, vendors, onSave }: BatchEntryRowProps) => {
  const { t } = useTranslation();
  const globalCurrency = useDisplayCurrency();
  const createVendorMutation = useCreateVendor();
  const categoryRef = useRef<HTMLInputElement>(null);

  const form = useForm<BatchFormValues>({
    initialValues: {
      occurredAt: today(),
      description: '',
      categoryId: '',
      fromAccountId: '',
      toAccountId: '',
      vendorName: '',
      amount: '',
    },
    validate: {
      occurredAt: (v) =>
        !v ? t('transactions.quickAddTransaction.error.occurredAt.required') : null,
      categoryId: (v) =>
        !v ? t('transactions.quickAddTransaction.error.category.required') : null,
      fromAccountId: (v) =>
        !v ? t('transactions.quickAddTransaction.error.fromAccount.required') : null,
      amount: (v) =>
        v === '' || Number(v) <= 0
          ? t('transactions.quickAddTransaction.error.amount.greaterThanZero')
          : null,
      toAccountId: (v, vals) => {
        const cat = categories.find((c) => c.id === vals.categoryId);
        if (cat?.categoryType === 'Transfer' && !v) {
          return t('transactions.quickAddTransaction.error.toAccount.required');
        }
        return null;
      },
    },
  });

  const selectedCategory = categories.find((c) => c.id === form.values.categoryId);
  const isTransfer = selectedCategory?.categoryType === 'Transfer';

  const handleSubmit = form.onSubmit(async (values) => {
    let vendorId: string | undefined;
    if (!isTransfer && values.vendorName.trim()) {
      const existing = vendors.find(
        (v) => v.name.toLowerCase() === values.vendorName.toLowerCase()
      );
      if (existing) {
        vendorId = existing.id;
      } else {
        try {
          const created = await createVendorMutation.mutateAsync({
            name: values.vendorName.trim(),
          });
          vendorId = created.id;
        } catch {
          return;
        }
      }
    }

    const payload: TransactionRequest = {
      description: values.description,
      amount: convertDisplayToCents(Number(values.amount)),
      occurredAt: values.occurredAt,
      categoryId: values.categoryId,
      fromAccountId: values.fromAccountId,
      toAccountId: isTransfer ? values.toAccountId : undefined,
      vendorId,
    };

    try {
      await onSave(payload);
      // Reset: keep date + account, clear rest
      form.setValues((prev) => ({
        ...prev,
        description: '',
        categoryId: '',
        toAccountId: '',
        vendorName: '',
        amount: '',
      }));
      setTimeout(() => categoryRef.current?.focus(), 50);
    } catch {
      toast.error({
        title: t('common.error'),
        message: t('transactions.batch.saveError'),
        nonCritical: true,
      });
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      const stickyDate = form.values.occurredAt;
      const stickyAccount = form.values.fromAccountId;
      form.reset();
      form.setValues((prev) => ({ ...prev, occurredAt: stickyDate, fromAccountId: stickyAccount }));
    }
  };

  return (
    <Table.Tr onKeyDown={handleKeyDown} style={{ background: 'var(--mantine-color-blue-light)' }}>
      <Table.Td>
        <TextInput
          size="xs"
          placeholder="YYYY-MM-DD"
          {...form.getInputProps('occurredAt')}
          w={110}
        />
      </Table.Td>
      <Table.Td>
        <TextInput
          size="xs"
          placeholder={t('transactions.batch.notesPlaceholder')}
          {...form.getInputProps('description')}
        />
      </Table.Td>
      <Table.Td>
        <Select
          ref={categoryRef}
          size="xs"
          placeholder={t('transactions.batch.categoryPlaceholder')}
          data={categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
          searchable
          {...form.getInputProps('categoryId')}
          w={160}
        />
      </Table.Td>
      <Table.Td>
        {isTransfer ? (
          <Group gap="xs" wrap="nowrap">
            <Select
              size="xs"
              placeholder={t('transactions.batch.fromAccount')}
              data={accounts.map((a) => ({ value: a.id, label: a.name }))}
              searchable
              {...form.getInputProps('fromAccountId')}
              w={130}
            />
            <Select
              size="xs"
              placeholder={t('transactions.batch.toAccount')}
              data={accounts
                .filter((a) => a.id !== form.values.fromAccountId)
                .map((a) => ({ value: a.id, label: a.name }))}
              searchable
              {...form.getInputProps('toAccountId')}
              w={130}
            />
          </Group>
        ) : (
          <Select
            size="xs"
            placeholder={t('transactions.batch.accountPlaceholder')}
            data={accounts.map((a) => ({ value: a.id, label: a.name }))}
            searchable
            {...form.getInputProps('fromAccountId')}
            w={160}
          />
        )}
      </Table.Td>
      <Table.Td>
        {!isTransfer && (
          <Autocomplete
            size="xs"
            placeholder={t('transactions.batch.vendorPlaceholder')}
            data={vendors.map((v) => v.name)}
            {...form.getInputProps('vendorName')}
            w={130}
          />
        )}
      </Table.Td>
      <Table.Td>
        <NumberInput
          size="xs"
          placeholder="0.00"
          decimalScale={globalCurrency.decimalPlaces}
          fixedDecimalScale
          hideControls
          leftSection={globalCurrency.symbol}
          {...form.getInputProps('amount')}
          w={100}
        />
      </Table.Td>
      <Table.Td>
        <Button size="xs" variant="filled" onClick={() => void handleSubmit()}>
          {t('transactions.batch.save')}
        </Button>
      </Table.Td>
    </Table.Tr>
  );
};
