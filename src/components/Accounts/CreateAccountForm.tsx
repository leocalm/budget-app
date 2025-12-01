import { useState } from 'react';
import {
  Alert,
  Button,
  ColorInput,
  DEFAULT_THEME,
  Group,
  NumberInput,
  Select,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { createAccount } from '@/api/account';
import { ACCOUNT_TYPES, AccountRequest, AccountType } from '@/types/account';

interface CreateAccountFormProps {
  onAccountCreated?: () => void;
}

export function CreateAccountForm({ onAccountCreated }: CreateAccountFormProps) {
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      account_type: '',
      balance: 0,
      color: '',
      icon: 'wallet',
      currency: 'EUR',
    },

    validate: {
      name: (value) => (!value || value.length < 2 ? 'Name must have at least 2 letters' : null),
      account_type: (value) => (value ? null : 'Account type is required'),
      balance: (value) => (!value ? 'Balance must be non-zero' : null),
    },
  });

  const submitForm = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const accountData: AccountRequest = {
        name: values.name,
        account_type: values.account_type as AccountType,
        balance: values.balance,
        color: values.color,
        icon: values.icon,
        currency: values.currency,
      };

      await createAccount(accountData);
      setSuccess(true);
      form.reset();

      onAccountCreated?.();
    } catch (error) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit((values) => submitForm(values))}>
      {error && (
        <Alert color="red" mb="md" title="Error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="green" mb="md" title="Success">
          Account created successfully!
        </Alert>
      )}

      <TextInput
        withAsterisk
        label="Account Name"
        placeholder="Account Name"
        key={form.key('name')}
        {...form.getInputProps('name')}
      />

      <Select
        withAsterisk
        label="Account Type"
        placeholder="Account Type"
        data={[...ACCOUNT_TYPES]}
        key={form.key('account_type')}
        {...form.getInputProps('account_type')}
      />

      <NumberInput
        withAsterisk
        label="Initial Balance"
        placeholder="Initial Balance"
        key={form.key('balance')}
        {...form.getInputProps('balance')}
      />

      <ColorInput
        placeholder="Pick color"
        label="Account color"
        disallowInput
        withPicker={false}
        swatches={[
          ...DEFAULT_THEME.colors.red,
          ...DEFAULT_THEME.colors.green,
          ...DEFAULT_THEME.colors.blue,
          ...DEFAULT_THEME.colors.orange,
          ...DEFAULT_THEME.colors.yellow,
        ]}
        key={form.key('color')}
        {...form.getInputProps('color')}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Create Account</Button>
      </Group>
    </form>
  );
}