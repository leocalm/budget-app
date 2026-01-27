import { useTranslation } from 'react-i18next';
import { Paper, Stack, Text, Title } from '@mantine/core';

export function BudgetDetails() {
  const { t } = useTranslation();
  return (
    <Paper shadow="md" radius="lg" p="xl" h="100%">
      <Stack align="flex-start">
        <Title order={2}>{t('budget.details.title')}</Title>
        <Text>{t('budget.details.totalIncoming')}: 1000</Text>
        <Text>{t('budget.details.totalOutgoing')}: 1000</Text>
        <Text>{t('budget.details.difference')}: 0</Text>
      </Stack>
    </Paper>
  );
}
