import { useEffect, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { createAccount, fetchAccountsManagement } from '@/api/account';
import { fetchCurrencies } from '@/api/currency';
import { fetchProfile, updateProfile } from '@/api/settings';
import type { AccountType } from '@/types/account';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

interface AccountForm {
  id?: string; // present if already persisted
  name: string;
  accountType: AccountType;
  balance: number;
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'BRL', label: 'BRL — Brazilian Real' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'SEK', label: 'SEK — Swedish Krona' },
  { value: 'NOK', label: 'NOK — Norwegian Krone' },
  { value: 'DKK', label: 'DKK — Danish Krone' },
  { value: 'PLN', label: 'PLN — Polish Złoty' },
  { value: 'CZK', label: 'CZK — Czech Koruna' },
  { value: 'HUF', label: 'HUF — Hungarian Forint' },
];

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'Checking', label: 'Checking' },
  { value: 'Savings', label: 'Savings' },
  { value: 'CreditCard', label: 'Credit Card' },
  { value: 'Wallet', label: 'Wallet' },
];

const ASSET_TYPES: AccountType[] = ['Checking', 'Savings', 'Wallet'];

const DEFAULT_COLOR = '#228be6';
const DEFAULT_ICON = 'wallet';

function blankAccount(): AccountForm {
  return { name: '', accountType: 'Checking', balance: 0 };
}

export function AccountsStep({ onComplete, onBack }: Props) {
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountForm[]>([blankAccount()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing accounts and currency on mount so navigating back shows current state
  useEffect(() => {
    Promise.all([fetchAccountsManagement(), fetchProfile(), fetchCurrencies()]).then(
      ([existing, profile, currencies]) => {
        const active = existing.filter((a) => !a.isArchived);
        if (active.length > 0) {
          setAccounts(
            active.map((a) => ({
              id: a.id,
              name: a.name,
              accountType: a.accountType,
              balance: a.balance / 10 ** a.currency.decimalPlaces,
            }))
          );
          // Infer currency from first account
          setCurrencyCode(active[0].currency.currency);
        } else if (profile.defaultCurrencyId) {
          const match = currencies.find((c) => c.id === profile.defaultCurrencyId);
          if (match) {
            setCurrencyCode(match.currency);
          }
        }
      }
    );
  }, []);

  const hasValidAccount = accounts.some(
    (a) => a.name.trim() !== '' && ASSET_TYPES.includes(a.accountType)
  );

  const updateAccount = (index: number, patch: Partial<AccountForm>) => {
    setAccounts((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  const addAccount = () => {
    if (accounts.length < 10) {
      setAccounts((prev) => [...prev, blankAccount()]);
    }
  };

  const removeAccount = (index: number) => {
    setAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    setLoading(true);
    setError(null);
    try {
      if (currencyCode) {
        const [profile, currencies] = await Promise.all([fetchProfile(), fetchCurrencies()]);
        const found = currencies.find((c) => c.currency === currencyCode);
        if (found) {
          await updateProfile({
            name: profile.name,
            timezone: profile.timezone,
            defaultCurrencyId: found.id,
          });
        }
      }

      // Only create accounts that are new (no id yet)
      const toCreate = accounts.filter((a) => !a.id && a.name.trim() !== '');
      for (const account of toCreate) {
        await createAccount({
          name: account.name.trim(),
          accountType: account.accountType,
          balance: Math.round(account.balance * 100),
          color: DEFAULT_COLOR,
          icon: DEFAULT_ICON,
        });
      }

      onComplete();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="lg">
      <Title order={3}>Set Up Your Accounts</Title>

      {error && (
        <Alert color="red" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <Stack gap="xs">
        <Text fw={500}>Default currency</Text>
        <Select
          placeholder="Select currency"
          data={CURRENCY_OPTIONS}
          value={currencyCode}
          onChange={(value) => setCurrencyCode(value)}
          searchable
          clearable
        />
      </Stack>

      {accounts.map((account, index) => (
        <Card key={account.id ?? index} withBorder p="md">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={500}>Account {index + 1}</Text>
              {accounts.length > 1 && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => removeAccount(index)}
                  aria-label="Remove account"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>

            <TextInput
              label="Account name"
              placeholder="e.g. Main Checking"
              value={account.name}
              readOnly={!!account.id}
              onChange={(e) => updateAccount(index, { name: e.currentTarget.value })}
            />

            <Select
              label="Account type"
              data={ACCOUNT_TYPE_OPTIONS}
              value={account.accountType}
              readOnly={!!account.id}
              onChange={(value) =>
                updateAccount(index, { accountType: (value as AccountType) ?? 'Checking' })
              }
            />

            <NumberInput
              label="Starting balance"
              placeholder="0.00"
              step={0.01}
              decimalScale={2}
              value={account.balance}
              readOnly={!!account.id}
              onChange={(value) =>
                updateAccount(index, { balance: typeof value === 'number' ? value : 0 })
              }
            />
          </Stack>
        </Card>
      ))}

      {accounts.length < 10 && (
        <Button variant="subtle" onClick={addAccount}>
          + Add another account
        </Button>
      )}

      <Group justify="space-between">
        <Button variant="default" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!hasValidAccount} loading={loading}>
          Continue
        </Button>
      </Group>
    </Stack>
  );
}
