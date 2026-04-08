import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const ACCOUNT_TYPES: { value: AccountType; labelKey: string; icon: string }[] = [
  { value: 'Checking', labelKey: 'accounts.types.checking', icon: '🏦' },
  { value: 'Savings', labelKey: 'accounts.types.savings', icon: '🐷' },
  { value: 'CreditCard', labelKey: 'accounts.types.creditCard', icon: '💳' },
  { value: 'Wallet', labelKey: 'accounts.types.wallet', icon: '👛' },
  { value: 'Allowance', labelKey: 'accounts.types.allowance', icon: '🎒' },
];

const TOP_UP_CYCLES: { value: string; labelKey: string }[] = [
  { value: 'weekly', labelKey: 'accounts.topUpCycles.weekly' },
  { value: 'bi-weekly', labelKey: 'accounts.topUpCycles.biWeekly' },
  { value: 'monthly', labelKey: 'accounts.topUpCycles.monthly' },
];

interface AccountFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  editAccountId?: string | null;
}

export function AccountFormDrawer({ opened, onClose, editAccountId }: AccountFormDrawerProps) {
  const { t } = useTranslation('v2');
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
        toast.success({ message: t('accounts.updated') });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: t('accounts.created') });
      }
      onClose();
    } catch {
      toast.error({ message: t('accounts.saveFailed', { action: isEdit ? 'update' : 'create' }) });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid = name.trim().length >= 3 && currencyId;

  return (
    <Drawer
      data-testid="account-form-drawer"
      opened={opened}
      onClose={onClose}
      title={isEdit ? t('accounts.form.editTitle') : t('accounts.form.createTitle')}
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
              {t('accounts.form.accountType')}
            </Text>
            <div className={classes.typeSelector}>
              {ACCOUNT_TYPES.map((acctType) => (
                <UnstyledButton
                  key={acctType.value}
                  className={
                    type === acctType.value ? classes.typeButtonActive : classes.typeButton
                  }
                  onClick={() => setType(acctType.value)}
                >
                  <Text fz="lg">{acctType.icon}</Text>
                  <Text fz="xs" fw={500}>
                    {t(acctType.labelKey)}
                  </Text>
                </UnstyledButton>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <TextInput
          data-testid="account-name-input"
          label={t('accounts.form.accountName')}
          placeholder={t('accounts.form.accountNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          minLength={3}
        />

        {/* Color */}
        <ColorInput
          label={t('accounts.form.color')}
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
          data-testid="account-balance-input"
          label={t('accounts.form.initialBalance')}
          value={initialBalance}
          onChange={setInitialBalance}
          decimalScale={2}
          fixedDecimalScale
          prefix={selectedCurrencySymbol ? `${selectedCurrencySymbol} ` : ''}
          allowNegative
        />

        {/* Currency */}
        <Select
          label={t('accounts.form.currency')}
          data={currencyOptions}
          value={currencyId}
          onChange={(v) => setCurrencyId(v ?? '')}
          searchable
        />

        {/* Credit Card / Allowance: Spend Limit */}
        {(type === 'CreditCard' || type === 'Allowance') && (
          <NumberInput
            label={t('accounts.form.spendLimit')}
            description={
              type === 'CreditCard'
                ? t('accounts.form.spendLimitCreditCard')
                : t('accounts.form.spendLimitAllowance')
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
              label={t('accounts.form.statementCloseDay')}
              description={t('accounts.form.dayOfMonth')}
              value={statementCloseDay}
              onChange={setStatementCloseDay}
              min={1}
              max={31}
            />
            <NumberInput
              label={t('accounts.form.paymentDueDay')}
              description={t('accounts.form.dayOfMonth')}
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
              label={t('accounts.form.topUpAmount')}
              description={t('accounts.form.topUpAmountDesc')}
              value={topUpAmount}
              onChange={setTopUpAmount}
              decimalScale={2}
              fixedDecimalScale
              prefix={selectedCurrencySymbol ? `${selectedCurrencySymbol} ` : ''}
              min={0}
            />
            <Select
              label={t('accounts.form.topUpCycle')}
              data={TOP_UP_CYCLES.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
              value={topUpCycle}
              onChange={setTopUpCycle}
            />
            <NumberInput
              label={t('accounts.form.topUpDay')}
              description={
                topUpCycle === 'weekly' || topUpCycle === 'bi-weekly'
                  ? t('accounts.form.topUpDayWeek')
                  : t('accounts.form.topUpDayMonth')
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
            {t('common.cancel')}
          </Button>
          <Button
            data-testid="account-form-submit"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!isValid}
          >
            {isEdit ? t('common.saveChanges') : t('accounts.form.createTitle')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
