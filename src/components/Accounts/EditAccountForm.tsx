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
      currency: account.currency.currency,
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
      currency: values.currency,
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
            {t('accounts.forms.buttons.save')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
