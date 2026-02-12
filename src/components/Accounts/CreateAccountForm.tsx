import { useState } from 'react';
import { IconBriefcase, IconCurrencyEuro, IconTag } from '@tabler/icons-react';
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
import { useCreateAccount } from '@/hooks/useAccounts';
import { ACCOUNT_TYPES, AccountRequest, AccountType } from '@/types/account';

interface CreateAccountFormProps {
  onAccountCreated?: () => void;
}

export function CreateAccountForm({ onAccountCreated }: CreateAccountFormProps) {
  const createAccountMutation = useCreateAccount();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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
      name: (value) =>
        !value || value.length < 2 ? t('accounts.forms.validation.nameMinLength') : null,
      accountType: (value) => (value ? null : t('accounts.forms.validation.accountTypeRequired')),
    },
  });

  const accountTypeOptions = ACCOUNT_TYPES.map((accountType) => ({
    value: accountType,
    label: t(`accounts.types.${accountType}`, { defaultValue: accountType }),
  }));

  const submitForm = async (values: typeof form.values) => {
    setError(null);

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

      await createAccountMutation.mutateAsync(accountData);
      form.reset();

      onAccountCreated?.();
    } catch {
      setError(t('accounts.forms.errors.createFailed'));
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
              label={t('accounts.forms.fields.name.label')}
              placeholder={t('accounts.forms.fields.name.placeholder')}
              leftSection={<IconTag size={16} />}
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
              leftSection={<IconBriefcase size={16} />}
              {...form.getInputProps('accountType')}
              required
            />
          </Grid.Col>

          <Grid.Col span={bottomRowColSpan}>
            <NumberInput
              label={t('accounts.forms.fields.initialBalance.label')}
              placeholder={t('accounts.forms.fields.initialBalance.placeholder')}
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
                label={t('accounts.forms.fields.spendLimit.label')}
                placeholder={t('accounts.forms.fields.spendLimit.placeholder')}
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
          <Button variant="light" color="gray" onClick={() => form.reset()}>
            {t('accounts.forms.buttons.reset')}
          </Button>
          <Button type="submit" px="xl" loading={createAccountMutation.isPending}>
            {t('accounts.forms.buttons.create')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
