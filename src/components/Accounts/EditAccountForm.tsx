import { useState } from 'react';
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
import { useUpdateAccount } from '@/hooks/useAccounts';
import { ACCOUNT_TYPES, AccountRequest, AccountResponse, AccountType } from '@/types/account';
import { convertCentsToDisplay, convertDisplayToCents } from '@/utils/currency';

interface EditAccountFormProps {
  account: AccountResponse;
  onUpdated?: () => void;
}

export function EditAccountForm({ account, onUpdated }: EditAccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateAccount();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: account.name,
      accountType: account.accountType as string,
      balance: convertCentsToDisplay(account.balance),
      color: account.color,
      icon: account.icon,
      currency: account.currency.currency,
    },
    validate: {
      name: (value) => (!value || value.length < 2 ? 'Name must have at least 2 letters' : null),
      accountType: (value) => (value ? null : 'Account type is required'),
      balance: (value) => (value === undefined || value === null ? 'Balance is required' : null),
    },
  });

  const submitForm = async (values: typeof form.values) => {
    setError(null);
    const payload: AccountRequest = {
      name: values.name,
      accountType: values.accountType as AccountType,
      balance: convertDisplayToCents(values.balance || 0),
      color: values.color,
      icon: values.icon,
      currency: values.currency,
    };

    updateMutation.mutate(
      { id: account.id, payload },
      {
        onSuccess: () => onUpdated?.(),
        onError: () => setError('Failed to update account'),
      }
    );
  };

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
              leftSection={<span>🏷️</span>}
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
              leftSection={<span>💼</span>}
              {...form.getInputProps('accountType')}
              required
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="Balance"
              placeholder="0.00"
              decimalScale={2}
              fixedDecimalScale
              leftSection={<span>💶</span>}
              {...form.getInputProps('balance')}
              required
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
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
          <Button type="submit" px="xl">
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
