import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const ACCOUNT_COLOR_SWATCHES = [
  '#5E63E6',
  '#8C6CFB',
  '#00D4FF',
  '#00FFA3',
  '#FFA940',
  '#FF6B9D',
  '#B47AFF',
  '#4A4FC2',
  '#7358D4',
  '#CC8733',
];

export function EditAccountForm({ account, onUpdated }: EditAccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateAccount();
  const { t } = useTranslation();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: account.name,
      accountType: account.accountType as string,
      balance: convertCentsToDisplay(account.balance),
      color: account.color,
      icon: account.icon,
      spendLimit: account.spendLimit ? account.spendLimit / 100 : undefined,
    },
    validate: {
      name: (value) =>
        !value || value.length < 2 ? t('accounts.forms.validation.nameMinLength') : null,
      accountType: (value) => (value ? null : t('accounts.forms.validation.accountTypeRequired')),
      balance: (value) =>
        value === undefined || value === null
          ? t('accounts.forms.validation.balanceRequired')
          : null,
    },
  });

  const accountTypeOptions = ACCOUNT_TYPES.map((accountType) => ({
    value: accountType,
    label: t(`accounts.types.${accountType}`, { defaultValue: accountType }),
  }));

  const submitForm = async (values: typeof form.values) => {
    setError(null);
    const payload: AccountRequest = {
      name: values.name,
      accountType: values.accountType as AccountType,
      balance: convertDisplayToCents(values.balance || 0),
      color: values.color,
      icon: values.icon,
      // currency: values.currency, // Removed
      spendLimit: values.spendLimit ? values.spendLimit * 100 : undefined,
    };

    updateMutation.mutate(
      { id: account.id, payload },
      {
        onSuccess: () => onUpdated?.(),
        onError: () => setError(t('accounts.forms.errors.updateFailed')),
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
              label={t('accounts.forms.fields.name.label')}
              placeholder={t('accounts.forms.fields.name.placeholder')}
              leftSection={<span>🏷️</span>}
              {...form.getInputProps('name')}
              required
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label={t('accounts.forms.fields.type.label')}
              placeholder={t('accounts.forms.fields.type.placeholder')}
              data={accountTypeOptions}
              searchable
              nothingFoundMessage={t('accounts.forms.select.nothingFound')}
              leftSection={<span>💼</span>}
              {...form.getInputProps('accountType')}
              required
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label={t('accounts.forms.fields.balance.label')}
              placeholder={t('accounts.forms.fields.balance.placeholder')}
              decimalScale={2}
              fixedDecimalScale
              leftSection={<span>💶</span>}
              {...form.getInputProps('balance')}
              required
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <ColorInput
              label={t('accounts.forms.fields.color.label')}
              placeholder={t('accounts.forms.fields.color.placeholder')}
              disallowInput
              withPicker={false}
              swatchesPerRow={10}
              swatches={ACCOUNT_COLOR_SWATCHES}
              {...form.getInputProps('color')}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="lg">
          <Button type="submit" px="xl">
            {t('accounts.forms.buttons.save')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
