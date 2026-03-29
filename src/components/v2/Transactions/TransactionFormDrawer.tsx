import { useEffect, useState } from 'react';
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

  const categoryOptions = (categories ?? []).map((c) => ({
    value: c.id,
    label: `${c.icon} ${c.name}`,
  }));
  const accountOptions = (accounts ?? []).map((a) => ({ value: a.id, label: a.name }));
  const vendorOptions = (vendors ?? []).map((v) => ({ value: v.id, label: v.name }));

  const handleSubmit = async () => {
    if (!description.trim() || !amount || !categoryId || !fromAccountId) {
      return;
    }

    const cents = Math.round(Number(amount) * 100);

    try {
      if (isTransfer) {
        if (!toAccountId) {
          return;
        }
        const body: components['schemas']['CreateTransactionRequest'] = {
          description: description.trim(),
          amount: cents,
          date,
          categoryId,
          fromAccountId,
          toAccountId,
          transactionType: 'transfer',
        };
        if (isEdit && editTransaction) {
          await updateMutation.mutateAsync({ id: editTransaction.id, body });
          toast.success({ message: 'Transaction updated' });
        } else {
          await createMutation.mutateAsync(body);
          toast.success({ message: 'Transfer added' });
        }
      } else {
        const body: components['schemas']['CreateTransactionRequest'] = {
          description: description.trim(),
          amount: cents,
          date,
          categoryId,
          fromAccountId,
          vendorId: vendorId || undefined,
          transactionType: 'regular',
        };
        if (isEdit && editTransaction) {
          await updateMutation.mutateAsync({ id: editTransaction.id, body });
          toast.success({ message: 'Transaction updated' });
        } else {
          await createMutation.mutateAsync(body);
          toast.success({ message: 'Transaction added' });
        }
      }
      onClose();
    } catch {
      toast.error({ message: `Failed to ${isEdit ? 'update' : 'create'} transaction` });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid =
    description.trim() && amount && categoryId && fromAccountId && (!isTransfer || toAccountId);

  const fromName = accountOptions.find((a) => a.value === fromAccountId)?.label;
  const toName = accountOptions.find((a) => a.value === toAccountId)?.label;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Transaction' : isTransfer ? 'Add Transfer' : 'Add Transaction'}
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
          label="Transfer between accounts"
          description={
            isTransfer
              ? 'Category and vendor are not applicable for transfers'
              : 'Toggle on to move money between your accounts'
          }
          checked={isTransfer}
          onChange={(e) => setIsTransfer(e.currentTarget.checked)}
          disabled={isEdit}
        />

        {/* Description */}
        <TextInput
          label="Description"
          placeholder={isTransfer ? 'e.g. Allowance pay' : 'e.g. Whole Foods groceries'}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          required
        />

        {/* Amount + Date */}
        <Group grow>
          <NumberInput
            label="Amount"
            value={amount}
            onChange={setAmount}
            decimalScale={2}
            fixedDecimalScale
            min={0}
            required
          />
          <TextInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            required
          />
        </Group>

        {/* Category — hidden for transfers in a simplified way */}
        <Select
          label="Category"
          data={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
          searchable
          required
        />

        {/* From Account */}
        <Select
          label={isTransfer ? 'From Account' : 'Account'}
          data={accountOptions}
          value={fromAccountId}
          onChange={setFromAccountId}
          searchable
          required
        />

        {/* To Account (transfers only) */}
        {isTransfer && (
          <Select
            label="To Account"
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
            label="Vendor (optional)"
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
            {fromName} → {toName} · <CurrencyValue cents={Math.round(Number(amount) * 100)} /> will
            be subtracted from source and added to destination
          </Text>
        )}

        {/* Submit */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isValid}>
            {isEdit ? 'Save Changes' : isTransfer ? 'Add Transfer' : 'Add Transaction'}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
