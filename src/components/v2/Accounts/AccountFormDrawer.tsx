import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ColorInput,
  Drawer,
  Group,
  NumberInput,
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
type LowerAccountType = 'checking' | 'savings' | 'creditcard' | 'wallet' | 'allowance';

const TO_LOWER: Record<AccountType, LowerAccountType> = {
  Checking: 'checking',
  Savings: 'savings',
  CreditCard: 'creditcard',
  Wallet: 'wallet',
  Allowance: 'allowance',
};
const TO_PASCAL: Record<LowerAccountType, AccountType> = {
  checking: 'Checking',
  savings: 'Savings',
  creditcard: 'CreditCard',
  wallet: 'Wallet',
  allowance: 'Allowance',
};

// The encrypted v2 API expects `accountType` in lowercase (per iOS Phase 4a
// memory: "Lowercase account types" + "accountType field name"). The
// generated OpenAPI types still describe the PascalCase `type` field, so
// we override at the boundary.
type LegacyCreateAccountRequest = components['schemas']['CreateAccountRequest'];
type EncryptedCreateAccountRequest = Omit<LegacyCreateAccountRequest, 'type'> & {
  accountType: LowerAccountType;
};
type CreateReq = EncryptedCreateAccountRequest;

const ACCOUNT_TYPES: { value: AccountType; labelKey: string }[] = [
  { value: 'Checking', labelKey: 'accounts.types.checking' },
  { value: 'Savings', labelKey: 'accounts.types.savings' },
  { value: 'CreditCard', labelKey: 'accounts.types.creditCard' },
  { value: 'Wallet', labelKey: 'accounts.types.wallet' },
  { value: 'Allowance', labelKey: 'accounts.types.allowance' },
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

  // Populate form when editing. The encrypted store returns lowercase
  // `accountType`, `currentBalance`, and `currencyId` (no nested currency
  // object or dedicated `initialBalance`), so we adapt per the Phase 4a
  // iOS memory: preserve the existing balance when editing and treat
  // `currentBalance` as the form's initial value.
  useEffect(() => {
    if (isEdit && editData) {
      setType(TO_PASCAL[editData.accountType]);
      setName(editData.name);
      setColor(editData.color);
      setInitialBalance(editData.currentBalance / 100);
      setCurrencyId(editData.currencyId);
      setSpendLimit(editData.spendLimit != null ? editData.spendLimit / 100 : '');
    }
  }, [isEdit, editData]);

  // Reset effect removed — parent uses key={editAccountId ?? 'create'}
  // to force remount, so useState initializers handle the reset.

  const handleSubmit = async () => {
    const balanceCents = Math.round(Number(initialBalance) * 100);

    const body: CreateReq = {
      accountType: TO_LOWER[type],
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
        // Cast to the generated openapi-fetch body type — the actual shape
        // matches the encrypted API even though the typings are stale.
        await updateMutation.mutateAsync({
          id: editAccountId,
          body: body as unknown as LegacyCreateAccountRequest,
        });
        toast.success({ message: t('accounts.updated') });
      } else {
        await createMutation.mutateAsync(body as unknown as LegacyCreateAccountRequest);
        toast.success({ message: t('accounts.created') });
      }
      onClose();
      if (!isEdit) {
        setType('Checking');
        setName('');
        setColor('#6B8FD4');
        setInitialBalance(0);
        setSpendLimit('');
      }
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
        {/*
          Account type is immutable after creation. The backend enforces this
          via a BEFORE UPDATE trigger on the `account` table (migration
          20260327000004), because account_type is snapshotted by the
          transaction aggregate trigger at insert time to classify spending
          (Transfer-to-Allowance). Editing it would silently drift the
          materialized aggregates. Do not add an edit-mode branch here.
        */}
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

        {/* Currency is auto-set from user default */}

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
