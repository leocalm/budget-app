import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  ColorInput,
  Drawer,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import type { components } from '@/api/v2';
import { useAccount, useCreateAccount, useUpdateAccount } from '@/hooks/v2/useAccounts';
import { useCurrencies } from '@/hooks/v2/useCurrencies';
import { toast } from '@/lib/toast';
import classes from './Accounts.module.css';

type AccountType = 'Checking' | 'Savings' | 'CreditCard' | 'Allowance' | 'Wallet';
type CreateReq = components['schemas']['CreateAccountRequest'];

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: 'Checking', label: 'Checking', icon: '🏦' },
  { value: 'Savings', label: 'Savings', icon: '🐷' },
  { value: 'CreditCard', label: 'Credit Card', icon: '💳' },
  { value: 'Wallet', label: 'Wallet', icon: '👛' },
  { value: 'Allowance', label: 'Allowance', icon: '🎒' },
];

const TOP_UP_CYCLES: { value: string; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

interface AccountFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  editAccountId?: string | null;
}

export function AccountFormDrawer({ opened, onClose, editAccountId }: AccountFormDrawerProps) {
  const isEdit = !!editAccountId;
  const { data: editData } = useAccount(editAccountId ?? '');
  const { data: currencies } = useCurrencies();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const [type, setType] = useState<AccountType>('Checking');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B8FD4');
  const [initialBalance, setInitialBalance] = useState<number | string>(0);
  const [currencyId, setCurrencyId] = useState('');
  const [spendLimit, setSpendLimit] = useState<number | string>('');
  const [topUpAmount, setTopUpAmount] = useState<number | string>('');
  const [topUpCycle, setTopUpCycle] = useState<string | null>('weekly');
  const [topUpDay, setTopUpDay] = useState<number | string>(1);
  const [statementCloseDay, setStatementCloseDay] = useState<number | string>('');
  const [paymentDueDay, setPaymentDueDay] = useState<number | string>('');

  const currencyOptions = useMemo(
    () => (currencies ?? []).map((c) => ({ value: c.id, label: `${c.symbol} ${c.name}` })),
    [currencies]
  );

  const selectedCurrencySymbol = useMemo(() => {
    const found = (currencies ?? []).find((c) => c.id === currencyId);
    return found?.symbol ?? '';
  }, [currencies, currencyId]);

  // Set default currency when list loads
  useEffect(() => {
    if (!currencyId && currencies && currencies.length > 0) {
      setCurrencyId(currencies[0].id);
    }
  }, [currencies, currencyId]);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && editData) {
      setType(editData.type);
      setName(editData.name);
      setColor(editData.color);
      setInitialBalance(editData.initialBalance / 100);
      setCurrencyId(editData.currency.id);
      setSpendLimit(editData.spendLimit != null ? editData.spendLimit / 100 : '');
    }
  }, [isEdit, editData]);

  // Reset effect removed — parent uses key={editAccountId ?? 'create'}
  // to force remount, so useState initializers handle the reset.

  const handleSubmit = async () => {
    const balanceCents = Math.round(Number(initialBalance) * 100);

    const body: CreateReq = {
      type,
      name: name.trim(),
      color,
      initialBalance: balanceCents,
      currencyId,
    };

    if (type === 'CreditCard' || type === 'Allowance') {
      const limitVal = Number(spendLimit);
      if (limitVal > 0) {
        body.spendLimit = Math.round(limitVal * 100);
      }
    }

    try {
      if (isEdit && editAccountId) {
        await updateMutation.mutateAsync({ id: editAccountId, body });
        toast.success({ message: 'Account updated' });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: 'Account created' });
      }
      onClose();
    } catch {
      toast.error({ message: `Failed to ${isEdit ? 'update' : 'create'} account` });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid = name.trim().length >= 3 && currencyId;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Account' : 'Create Account'}
      position="right"
      size="md"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        {/* Account type selector */}
        {!isEdit && (
          <div>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
              Account Type
            </Text>
            <div className={classes.typeSelector}>
              {ACCOUNT_TYPES.map((t) => (
                <UnstyledButton
                  key={t.value}
                  className={type === t.value ? classes.typeButtonActive : classes.typeButton}
                  onClick={() => setType(t.value)}
                >
                  <Text fz="lg">{t.icon}</Text>
                  <Text fz="xs" fw={500}>
                    {t.label}
                  </Text>
                </UnstyledButton>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <TextInput
          label="Account Name"
          placeholder="e.g. Main Checking"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          minLength={3}
        />

        {/* Color */}
        <ColorInput
          label="Color"
          value={color}
          onChange={setColor}
          format="hex"
          swatches={[
            '#6B8FD4',
            '#5BA8A0',
            '#C48BA0',
            '#9AA0CC',
            '#D4A0B6',
            '#B088A0',
            '#8B7EC8',
            '#7CA8C4',
          ]}
        />

        {/* Initial balance */}
        <NumberInput
          label="Initial Balance"
          value={initialBalance}
          onChange={setInitialBalance}
          decimalScale={2}
          fixedDecimalScale
          prefix={selectedCurrencySymbol ? `${selectedCurrencySymbol} ` : ''}
          allowNegative
        />

        {/* Currency */}
        <Select
          label="Currency"
          data={currencyOptions}
          value={currencyId}
          onChange={(v) => setCurrencyId(v ?? '')}
          searchable
        />

        {/* Credit Card / Allowance: Spend Limit */}
        {(type === 'CreditCard' || type === 'Allowance') && (
          <NumberInput
            label="Spend Limit"
            description={
              type === 'CreditCard' ? 'Credit limit on the card' : 'Maximum spending per cycle'
            }
            value={spendLimit}
            onChange={setSpendLimit}
            decimalScale={2}
            fixedDecimalScale
            prefix={selectedCurrencySymbol ? `${selectedCurrencySymbol} ` : ''}
            min={0}
          />
        )}

        {/* Credit Card specific */}
        {type === 'CreditCard' && (
          <>
            <NumberInput
              label="Statement Close Day"
              description="Day of month (1-31)"
              value={statementCloseDay}
              onChange={setStatementCloseDay}
              min={1}
              max={31}
            />
            <NumberInput
              label="Payment Due Day"
              description="Day of month (1-31)"
              value={paymentDueDay}
              onChange={setPaymentDueDay}
              min={1}
              max={31}
            />
          </>
        )}

        {/* Allowance specific */}
        {type === 'Allowance' && (
          <>
            <NumberInput
              label="Top-up Amount"
              description="Amount added each cycle"
              value={topUpAmount}
              onChange={setTopUpAmount}
              decimalScale={2}
              fixedDecimalScale
              prefix={selectedCurrencySymbol ? `${selectedCurrencySymbol} ` : ''}
              min={0}
            />
            <Select
              label="Top-up Cycle"
              data={TOP_UP_CYCLES}
              value={topUpCycle}
              onChange={setTopUpCycle}
            />
            <NumberInput
              label="Top-up Day"
              description={
                topUpCycle === 'weekly' || topUpCycle === 'bi-weekly'
                  ? 'Day of week (0=Sun, 6=Sat)'
                  : 'Day of month (1-31)'
              }
              value={topUpDay}
              onChange={setTopUpDay}
              min={topUpCycle === 'monthly' ? 1 : 0}
              max={topUpCycle === 'monthly' ? 31 : 6}
            />
          </>
        )}

        {/* Submit */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isValid}>
            {isEdit ? 'Save Changes' : 'Create Account'}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
