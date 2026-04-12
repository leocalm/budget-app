import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useAccountsOptions } from '@/hooks/v2/useAccounts';
import { useCategoriesOptions } from '@/hooks/v2/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/v2/useTransactions';
import { useVendorsOptions } from '@/hooks/v2/useVendors';
import { toast } from '@/lib/toast';

type TransactionResponse = components['schemas']['TransactionResponse'];

interface TransactionFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  editTransaction?: TransactionResponse | null;
}

export function TransactionFormDrawer({
  opened,
  onClose,
  editTransaction,
}: TransactionFormDrawerProps) {
  const { t } = useTranslation('v2');
  const isEdit = !!editTransaction;
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const { data: categories } = useCategoriesOptions();
  const { data: accounts } = useAccountsOptions();
  const { data: vendors } = useVendorsOptions();

  const [isTransfer, setIsTransfer] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && editTransaction) {
      setIsTransfer(editTransaction.transactionType === 'transfer');
      setDescription(editTransaction.description);
      setAmount(editTransaction.amount / 100);
      setDate(editTransaction.date);
      setCategoryId(editTransaction.category.id);
      setFromAccountId(editTransaction.fromAccount.id);
      setVendorId(editTransaction.vendor?.id ?? null);
      if (editTransaction.transactionType === 'transfer' && editTransaction.toAccount) {
        setToAccountId((editTransaction.toAccount as components['schemas']['AccountRef']).id);
      }
    }
  }, [isEdit, editTransaction]);

  const transferCategoryId = (categories ?? []).find((c) => c.name === 'Transfer')?.id ?? null;
  const categoryOptions = (categories ?? [])
    .filter((c) => c.name !== 'Transfer')
    .map((c) => ({
      value: c.id,
      label: `${c.icon} ${c.name}`,
    }));
  const accountOptions = (accounts ?? []).map((a) => ({ value: a.id, label: a.name }));
  const vendorOptions = (vendors ?? []).map((v) => ({ value: v.id, label: v.name }));

  const handleSubmit = async () => {
    if (!description.trim() || !amount || !fromAccountId || (!isTransfer && !categoryId)) {
      return;
    }

    const cents = Math.round(Number(amount) * 100);

    try {
      if (isTransfer) {
        if (!toAccountId || !transferCategoryId) {
          return;
        }
        const body: components['schemas']['CreateTransactionRequest'] = {
          description: description.trim(),
          amount: cents,
          date,
          categoryId: transferCategoryId,
          fromAccountId,
          toAccountId,
          // API requires PascalCase despite OpenAPI spec declaring lowercase
          transactionType: 'Transfer' as 'transfer',
        };
        if (isEdit && editTransaction) {
          await updateMutation.mutateAsync({ id: editTransaction.id, body });
          toast.success({ message: t('transactions.updated') });
        } else {
          await createMutation.mutateAsync(body);
          toast.success({ message: t('transactions.transferAdded') });
        }
      } else {
        const body: components['schemas']['CreateTransactionRequest'] = {
          description: description.trim(),
          amount: cents,
          date,
          categoryId: categoryId as string,
          fromAccountId,
          vendorId: vendorId || undefined,
          // API requires PascalCase despite OpenAPI spec declaring lowercase
          transactionType: 'Regular' as 'regular',
        };
        if (isEdit && editTransaction) {
          await updateMutation.mutateAsync({ id: editTransaction.id, body });
          toast.success({ message: t('transactions.updated') });
        } else {
          await createMutation.mutateAsync(body);
          toast.success({ message: t('transactions.created') });
        }
      }
      onClose();
      if (!isEdit) {
        setIsTransfer(false);
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setCategoryId(null);
        setFromAccountId(null);
        setToAccountId(null);
        setVendorId(null);
      }
    } catch {
      toast.error({
        message: t('transactions.saveFailed', { action: isEdit ? 'update' : 'create' }),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid =
    description.trim() && amount && fromAccountId && (isTransfer ? toAccountId : categoryId);

  const fromName = accountOptions.find((a) => a.value === fromAccountId)?.label;
  const toName = accountOptions.find((a) => a.value === toAccountId)?.label;

  return (
    <Drawer
      data-testid="transaction-form-drawer"
      opened={opened}
      onClose={onClose}
      title={
        isEdit
          ? t('transactions.form.editTitle')
          : isTransfer
            ? t('transactions.form.addTransferTitle')
            : t('transactions.form.addTitle')
      }
      position="right"
      size="md"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        {/* Transfer toggle */}
        <Switch
          label={t('transactions.form.transferToggle')}
          description={
            isTransfer
              ? t('transactions.form.transferOnDesc')
              : t('transactions.form.transferOffDesc')
          }
          checked={isTransfer}
          onChange={(e) => setIsTransfer(e.currentTarget.checked)}
          disabled={isEdit}
        />

        {/* Description */}
        <TextInput
          data-testid="transaction-description-input"
          label={t('transactions.form.description')}
          placeholder={
            isTransfer
              ? t('transactions.form.descriptionTransferPlaceholder')
              : t('transactions.form.descriptionPlaceholder')
          }
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          required
        />

        {/* Amount + Date */}
        <Group grow>
          <NumberInput
            data-testid="transaction-amount-input"
            label={t('transactions.form.amount')}
            value={amount}
            onChange={setAmount}
            decimalScale={2}
            fixedDecimalScale
            min={0}
            required
          />
          <TextInput
            data-testid="transaction-date-input"
            label={t('transactions.form.date')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            required
          />
        </Group>

        {/* Category — hidden for transfers */}
        {!isTransfer && (
          <Select
            data-testid="transaction-category-select"
            label={t('transactions.form.category')}
            data={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            searchable
            required
          />
        )}

        {/* From Account */}
        <Select
          data-testid="transaction-account-select"
          label={isTransfer ? t('transactions.form.fromAccount') : t('transactions.form.account')}
          data={accountOptions}
          value={fromAccountId}
          onChange={setFromAccountId}
          searchable
          required
        />

        {/* To Account (transfers only) */}
        {isTransfer && (
          <Select
            data-testid="transaction-to-account-select"
            label={t('transactions.form.toAccount')}
            data={accountOptions.filter((a) => a.value !== fromAccountId)}
            value={toAccountId}
            onChange={setToAccountId}
            searchable
            required
          />
        )}

        {/* Vendor (regular only) */}
        {!isTransfer && (
          <Select
            data-testid="transaction-vendor-select"
            label={t('transactions.form.vendorOptional')}
            data={vendorOptions}
            value={vendorId}
            onChange={setVendorId}
            searchable
            clearable
          />
        )}

        {/* Transfer summary */}
        {isTransfer && fromName && toName && amount && (
          <Text fz="xs" c="dimmed">
            {fromName} → {toName} · <CurrencyValue cents={Math.round(Number(amount) * 100)} />{' '}
            {t('transactions.form.transferSummaryFull')}
          </Text>
        )}

        {/* Submit */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button
            data-testid="transaction-form-submit"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!isValid}
          >
            {isEdit
              ? t('common.saveChanges')
              : isTransfer
                ? t('transactions.form.addTransferButton')
                : t('transactions.form.addTransactionButton')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
