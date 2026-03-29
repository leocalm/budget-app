import { useState } from 'react';
import { Button, NumberInput, Select, Text, TextInput } from '@mantine/core';
import { useAccountsOptions } from '@/hooks/v2/useAccounts';
import { useCategoriesOptions } from '@/hooks/v2/useCategories';
import { useCreateTransaction } from '@/hooks/v2/useTransactions';
import { useVendorsOptions } from '@/hooks/v2/useVendors';
import { toast } from '@/lib/toast';
import classes from './Transactions.module.css';

export function QuickAdd() {
  const createMutation = useCreateTransaction();
  const { data: categories } = useCategoriesOptions();
  const { data: accounts } = useAccountsOptions();
  const { data: vendors } = useVendorsOptions();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);

  const categoryOptions = (categories ?? []).map((c) => ({
    value: c.id,
    label: `${c.icon} ${c.name}`,
  }));
  const accountOptions = (accounts ?? []).map((a) => ({ value: a.id, label: a.name }));
  const vendorOptions = (vendors ?? []).map((v) => ({ value: v.id, label: v.name }));

  const handleSubmit = async () => {
    if (!description.trim() || !amount || !categoryId || !accountId) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        description: description.trim(),
        amount: Math.round(Number(amount) * 100),
        date,
        categoryId,
        fromAccountId: accountId,
        vendorId: vendorId || undefined,
        transactionType: 'regular',
      });
      toast.success({ message: 'Transaction added' });
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setVendorId(null);
    } catch {
      toast.error({ message: 'Failed to add transaction' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={classes.quickAddCard} data-testid="quick-add-form">
      <Text fz="xs" fw={600} c="dimmed" mb="xs">
        ⚡ Quick Add
      </Text>
      <div className={classes.quickAddRow}>
        <div className={classes.quickAddField}>
          <TextInput
            placeholder="Description"
            size="xs"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className={classes.quickAddSmall}>
          <NumberInput
            placeholder="Amount"
            size="xs"
            value={amount}
            onChange={setAmount}
            decimalScale={2}
            fixedDecimalScale
            min={0}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className={classes.quickAddSmall}>
          <TextInput
            type="date"
            size="xs"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className={classes.quickAddSmall}>
          <Select
            placeholder="Category"
            size="xs"
            data={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            searchable
          />
        </div>
        <div className={classes.quickAddSmall}>
          <Select
            placeholder="Account"
            size="xs"
            data={accountOptions}
            value={accountId}
            onChange={setAccountId}
            searchable
          />
        </div>
        <div className={classes.quickAddSmall}>
          <Select
            placeholder="Vendor"
            size="xs"
            data={vendorOptions}
            value={vendorId}
            onChange={setVendorId}
            searchable
            clearable
          />
        </div>
        <div className={classes.quickAddButton}>
          <Button
            size="xs"
            onClick={handleSubmit}
            loading={createMutation.isPending}
            disabled={!description.trim() || !amount || !categoryId || !accountId}
          >
            Add
          </Button>
        </div>
      </div>
      <Text fz="xs" c="dimmed" mt={4}>
        Press Enter to add and continue. Category and account are kept for consecutive entries.
      </Text>
    </div>
  );
}
