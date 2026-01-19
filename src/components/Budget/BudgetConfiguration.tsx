import React, { useEffect } from 'react';
import {
  Alert,
  Button,
  Group,
  Loader,
  NumberInput,
  Paper,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useBudget, useUpdateBudget } from '@/hooks/useBudget';

export function BudgetConfiguration() {
  const { data: budgets, isLoading, isError } = useBudget();
  const updateMutation = useUpdateBudget();

  const budget = budgets?.[0];

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: budget?.name,
      startDay: budget?.startDay,
    },

    validate: {
      name: (value) => (!value || value.length < 2 ? 'Name must have at least 2 letters' : null),
      startDay: (value: number | undefined) =>
        value && (value < 1 || value > 31) ? 'Start day must be between 1 and 31' : null,
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
    return <Loader />;
  }
  if (isError) {
    return <Alert color="red">Error loading categories</Alert>;
  }

  return (
    <Paper shadow="md" radius="lg" p="xl" h="100%">
      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
        <Stack align="flex-start">
          <Title order={2}>Budget Configuration</Title>
          <TextInput
            label="Budget Name"
            placeholder="My Budget"
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <NumberInput
            label="Start day"
            placeholder="Stard day"
            min={1}
            max={31}
            key={form.key('startDay')}
            {...form.getInputProps('startDay')}
          />
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button type="submit">Update Budget</Button>
        </Group>
      </form>
    </Paper>
  );
}
