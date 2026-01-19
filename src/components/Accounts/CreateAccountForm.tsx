import { useState } from 'react';
import { IconBriefcase, IconCurrencyEuro, IconTag } from '@tabler/icons-react';
import {
  Alert,
  Button,
  ColorInput,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
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
  const [, setSuccess] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      accountType: '',
      balance: 0,
      color: '',
      icon: 'wallet',
      currency: 'EUR',
      spendLimit: undefined,
    },

    validate: {
      name: (value) => (!value || value.length < 2 ? 'Name must have at least 2 letters' : null),
      accountType: (value) => (value ? null : 'Account type is required'),
    },
  });

  const submitForm = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const accountData: AccountRequest = {
        name: values.name,
        accountType: values.accountType as AccountType,
        balance: values.balance * 100,
        color: values.color,
        icon: values.icon,
        currency: values.currency,
        spendLimit: (values.spendLimit || 0) * 100,
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

  const hasLimit =
    form.values.accountType === 'CreditCard' || form.values.accountType === 'Allowance';

  const bottomRowColSpan = hasLimit ? { base: 12, md: 4 } : { base: 12, md: 6 };
  return (
    <form onSubmit={form.onSubmit((values) => submitForm(values))}>
      <Stack gap="md">
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <TextInput
              label="Account Name"
              placeholder="e.g. Main Checking, Savings, Cash"
              leftSection={<IconTag size={16} />}
              {...form.getInputProps('name')}
              required
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Type"
              placeholder="Search type..."
              data={[...ACCOUNT_TYPES]}
              searchable
              nothingFoundMessage="No types found..."
              leftSection={<IconBriefcase size={16} />}
              {...form.getInputProps('accountType')}
              required
            />
          </Grid.Col>

          <Grid.Col span={bottomRowColSpan}>
            <NumberInput
              label="Initial Balance"
              placeholder="0.00"
              decimalScale={2}
              fixedDecimalScale
              leftSection={<IconCurrencyEuro size={16} />}
              {...form.getInputProps('balance')}
              required
            />
          </Grid.Col>

          {hasLimit && (
            <Grid.Col span={bottomRowColSpan}>
              <NumberInput
                label="Spend Limit"
                placeholder="0.00"
                decimalScale={2}
                fixedDecimalScale
                leftSection={<IconCurrencyEuro size={16} />}
                {...form.getInputProps('spendLimit')}
                required
              />
            </Grid.Col>
          )}

          <Grid.Col span={bottomRowColSpan}>
            <ColorInput
              label="Theme Color"
              placeholder="Pick a color for the card"
              disallowInput
              withPicker={false}
              swatchesPerRow={10}
              swatches={[
                '#fa5252',
                '#fd7e14',
                '#fab005',
                '#82c91e',
                '#40c057',
                '#15aabf',
                '#228be6',
                '#4c6ef5',
                '#7950f2',
                '#be4bdb',
              ]}
              {...form.getInputProps('color')}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="lg">
          <Button variant="light" color="gray" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" px="xl">
            Create Account
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
