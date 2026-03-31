import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Stack, Text } from '@mantine/core';
import { CategoryDetail } from '@/components/v2/Categories';
import { NoPeriodState } from '@/components/v2/NoPeriodState';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';

export function CategoryDetailV2Page() {
  const { t } = useTranslation('v2');
  const { id } = useParams<{ id: string }>();
  const { selectedPeriodId } = useBudgetPeriodSelection();

  if (!id) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text c="dimmed" fz="sm">
          {t('categories.notFound')}
        </Text>
      </Stack>
    );
  }

  if (!selectedPeriodId) {
    return <NoPeriodState pageTitle={t('categories.title')} />;
  }

  return <CategoryDetail categoryId={id} periodId={selectedPeriodId} />;
}
