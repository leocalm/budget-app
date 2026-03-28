import { useMemo } from 'react';
import { Button, Skeleton, Stack, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { TargetRow } from '@/components/v2/Categories';
import classes from '@/components/v2/Categories/Categories.module.css';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useCategoryTargets } from '@/hooks/v2/useCategoryTargets';

type TargetItem = components['schemas']['TargetItem'];

export function TargetsV2Page() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const {
    data: targetsData,
    isLoading,
    isError,
    refetch,
  } = useCategoryTargets(selectedPeriodId ?? '');
  const targets = targetsData?.targets ?? [];
  const summary = targetsData?.summary;

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
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
          Targets
        </Text>
        <Text c="dimmed" fz="sm">
          No budget period selected.
        </Text>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
          Targets
        </Text>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your targets.
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            Retry
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
            Targets
          </Text>
          <Text c="dimmed" fz="sm">
            Set spending targets for this period
          </Text>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className={classes.statsBar}>
          <div className={classes.statItem}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              Period
            </Text>
            <Text fz="md" fw={600}>
              {summary.periodName}
            </Text>
          </div>
          <div className={classes.statItem}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              Position
            </Text>
            <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
              <CurrencyValue cents={summary.currentPosition} />
            </Text>
          </div>
          <div className={classes.statItem}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              With Targets
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
            No targets set
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            Click on any target amount below to set a spending goal for that category.
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
              Category
            </Text>
          </div>
          <div className={classes.targetValue}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              Target
            </Text>
          </div>
          <div className={classes.targetActual}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              Actual
            </Text>
          </div>
          <div className={classes.targetProgress}>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              Progress
            </Text>
          </div>
          <div className={classes.targetActions} />
        </div>
      )}

      {/* Income targets */}
      {incomeTargets.length > 0 && (
        <Stack gap="xs">
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.88px' }}>
            Incoming
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
            Outgoing
          </Text>
          {expenseTargets.map((t) => (
            <TargetRow key={t.id} target={t} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
