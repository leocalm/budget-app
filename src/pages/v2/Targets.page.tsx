import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton, Stack, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { TargetRow } from '@/components/v2/Categories';
import classes from '@/components/v2/Categories/Categories.module.css';
import { NoPeriodState } from '@/components/v2/NoPeriodState';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useCategoryTargets } from '@/hooks/v2/useCategoryTargets';
import { totalAllowanceBudget, useEncryptedStore } from '@/hooks/v2/useEncryptedStore';

type TargetItem = components['schemas']['TargetItem'];

export function TargetsV2Page() {
  const { t } = useTranslation('v2');
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: targetsData, isLoading, isError, refetch } = useCategoryTargets(selectedPeriodId);
  const store = useEncryptedStore(selectedPeriodId);
  const targets = targetsData?.targets ?? [];
  const summary = targetsData?.summary;

  const allowanceBudget = useMemo(
    () => (store.data ? totalAllowanceBudget(store.data) : 0),
    [store.data]
  );

  const { incomeTargets, expenseTargets } = useMemo(() => {
    const income: TargetItem[] = [];
    const expense: TargetItem[] = [];

    for (const t of targets) {
      if (t.type === 'income') {
        income.push(t);
      } else {
        expense.push(t);
      }
    }

    return { incomeTargets: income, expenseTargets: expense };
  }, [targets]);

  if (!selectedPeriodId) {
    return <NoPeriodState pageTitle={t('targets.title')} />;
  }

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
          {t('targets.title')}
        </Text>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            {t('targets.loadError')}
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Skeleton width={120} height={28} />
        <Skeleton height={60} radius="md" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={44} radius="md" />
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Header */}
      <div className={classes.pageHeader}>
        <div>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            {t('targets.title')}
          </Text>
          <Text c="dimmed" fz="sm">
            {t('targets.subtitle')}
          </Text>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className={classes.statsBar}>
          <div className={classes.statItem}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              {t('targets.period')}
            </Text>
            <Text fz="md" fw={600}>
              {summary.periodName}
            </Text>
          </div>
          <div className={classes.statItem}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              {t('targets.expenseBudget')}
            </Text>
            <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
              <CurrencyValue cents={summary.currentPosition} />
            </Text>
          </div>
          {allowanceBudget > 0 && (
            <div className={classes.statItem}>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                {t('targets.allowanceBudget')}
              </Text>
              <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                <CurrencyValue cents={allowanceBudget} />
              </Text>
            </div>
          )}
          <div className={classes.statItem}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              {t('targets.incomeTarget')}
            </Text>
            <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
              <CurrencyValue cents={summary.incomeTarget} />
            </Text>
          </div>
          <div className={classes.statItem}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              {t('targets.withTargets')}
            </Text>
            <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
              {summary.categoriesWithTargets.withTargets} / {summary.categoriesWithTargets.total}
            </Text>
          </div>
        </div>
      )}

      {/* Empty state */}
      {targets.length === 0 && (
        <div className={classes.centeredState}>
          <Text fz={32}>🎯</Text>
          <Text fz={18} fw={700} ff="var(--mantine-font-family-headings)">
            {t('targets.emptyTitle')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            {t('targets.emptyDescription')}
          </Text>
        </div>
      )}

      {/* Table header */}
      {targets.length > 0 && (
        <div
          className={classes.targetRow}
          style={{ border: 'none', padding: '0 var(--mantine-spacing-md)' }}
        >
          <div className={classes.targetInfo}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              {t('targets.category')}
            </Text>
          </div>
          <div className={classes.targetValue}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              {t('targets.target')}
            </Text>
          </div>
          <div className={classes.targetActual}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              {t('targets.actual')}
            </Text>
          </div>
          <div className={classes.targetProgress}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              {t('targets.progress')}
            </Text>
          </div>
          <div className={classes.targetActions} />
        </div>
      )}

      {/* Income targets */}
      {incomeTargets.length > 0 && (
        <Stack gap="xs">
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.88px' }}>
            {t('common.incoming')}
          </Text>
          {incomeTargets.map((t) => (
            <TargetRow key={t.id} target={t} />
          ))}
        </Stack>
      )}

      {/* Expense targets */}
      {expenseTargets.length > 0 && (
        <Stack gap="xs">
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.88px' }}>
            {t('common.outgoing')}
          </Text>
          {expenseTargets.map((t) => (
            <TargetRow key={t.id} target={t} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
