import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, NumberInput, Paper, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ErrorState, LoadingState } from '@/components/Utils';
import { useBudget, useUpdateBudget } from '@/hooks/useBudget';

export function BudgetConfiguration() {
  const { t } = useTranslation();
  const { data: budgets, isLoading, isError, refetch } = useBudget();
  const updateMutation = useUpdateBudget();

  const budget = budgets?.[0];

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: budget?.name,
      startDay: budget?.startDay,
    },

    validate: {
      name: (value) =>
        !value || value.length < 2 ? t('budget.configuration.error.nameLength') : null,
      startDay: (value: number | undefined) =>
        value && (value < 1 || value > 31) ? t('budget.configuration.error.startDayRange') : null,
    },
  });

  useEffect(() => {
    if (budget) {
      form.initialize({
        name: budget.name,
        startDay: budget.startDay,
      });
    }
  }, [budget]);

  const onSubmit = async (values: typeof form.values) => {
    updateMutation.mutate({
      id: budget?.id || '',
      name: values.name || '',
      startDay: values.startDay || 1,
    });
  };

  if (isLoading) {
    return <LoadingState variant="spinner" text={t('states.loading.default')} />;
  }
  if (isError) {
    return (
      <ErrorState
        variant="inline"
        icon="⚠️"
        title={t('states.error.loadFailed.title')}
        message={t('budget.configuration.error.load')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <LoadingState
      variant="overlay"
      loading={updateMutation.isPending}
      text={t('states.loading.default')}
    >
      <Paper shadow="md" radius="lg" p="xl" h="100%">
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
          <Stack align="flex-start">
            <Title order={2}>{t('budget.configuration.title')}</Title>
            <TextInput
              label={t('budget.configuration.budgetNameLabel')}
              placeholder={t('budget.configuration.budgetNamePlaceholder')}
              key={form.key('name')}
              {...form.getInputProps('name')}
            />

            <NumberInput
              label={t('budget.configuration.startDayLabel')}
              placeholder={t('budget.configuration.startDayPlaceholder')}
              min={1}
              max={31}
              key={form.key('startDay')}
              {...form.getInputProps('startDay')}
            />
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={updateMutation.isPending}>
              {t('budget.configuration.updateButton')}
            </Button>
          </Group>
        </form>
      </Paper>
    </LoadingState>
  );
}
