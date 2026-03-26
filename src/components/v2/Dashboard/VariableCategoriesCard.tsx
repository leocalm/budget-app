import { Button, Progress, ScrollArea, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useCategoriesOverview } from '@/hooks/v2/useCategories';
import { useV2Theme } from '@/theme/v2';
import classes from './VariableCategoriesCard.module.css';

interface VariableCategoriesCardProps {
  periodId: string;
}

export function VariableCategoriesCard({ periodId }: VariableCategoriesCardProps) {
  const { data, isLoading, isError, refetch } = useCategoriesOverview(periodId);
  const { accents } = useV2Theme();

  if (isLoading) {
    return <VariableCategoriesCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card} data-testid="variable-categories-card-error">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Variable Categories
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your categories.
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const variableCategories = (data?.categories ?? []).filter(
    (c) => c.behavior === 'variable' && c.type === 'expense' && c.budgeted != null && c.budgeted > 0
  );

  if (variableCategories.length === 0) {
    return (
      <div className={classes.card} data-testid="variable-categories-card-empty">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Variable Categories
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            No variable categories with budgets yet. Set a category as &ldquo;variable&rdquo; and
            assign a budget to see it here.
          </Text>
        </div>
      </div>
    );
  }

  const totalSpent = variableCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalBudgeted = variableCategories.reduce((sum, c) => sum + (c.budgeted ?? 0), 0);
  const overallPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const sorted = [...variableCategories].sort((a, b) => {
    const pctA = a.budgeted! > 0 ? a.actual / a.budgeted! : 0;
    const pctB = b.budgeted! > 0 ? b.actual / b.budgeted! : 0;
    return pctB - pctA;
  });

  return (
    <div className={classes.card} data-testid="variable-categories-card">
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          Variable Categories
        </Text>
        <Text fz="xs" fw={600} c="var(--v2-primary)">
          {variableCategories.length} {variableCategories.length === 1 ? 'category' : 'categories'}
        </Text>
      </div>

      <div className={classes.summary}>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-monospace)">
          <CurrencyValue cents={totalSpent} />
        </Text>
        <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)">
          of <CurrencyValue cents={totalBudgeted} /> budgeted
        </Text>
      </div>

      <Progress
        value={Math.min(overallPct, 100)}
        size={6}
        radius="xl"
        color={accents.primary}
        className={classes.overallBar}
        aria-label={`Overall variable budget used: ${Math.min(overallPct, 100)}%`}
      />

      <div className={classes.tableHeader}>
        <Text fz={10} fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>
          Category
        </Text>
        <Text
          fz={10}
          fw={700}
          tt="uppercase"
          c="dimmed"
          ta="right"
          style={{ letterSpacing: '0.06em' }}
        >
          Spent / Budget
        </Text>
        <Text
          fz={10}
          fw={700}
          tt="uppercase"
          c="dimmed"
          ta="right"
          style={{ letterSpacing: '0.06em' }}
        >
          %
        </Text>
        <Text fz={10} fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>
          Progress
        </Text>
      </div>

      <ScrollArea className={classes.scrollArea} type="auto" offsetScrollbars={false}>
        {sorted.map((cat) => {
          const pct = cat.budgeted! > 0 ? Math.round((cat.actual / cat.budgeted!) * 100) : 0;
          const isOver = pct > 100;
          const barColor = isOver ? accents.secondary : accents.primary;
          const barWidth = `${Math.min(pct, 100)}%`;

          return (
            <div key={cat.id} className={classes.row}>
              <Text fz="sm" fw={500} truncate>
                {cat.name}
              </Text>
              <Text fz="xs" c="dimmed" ta="right" ff="var(--mantine-font-family-monospace)">
                <CurrencyValue cents={cat.actual} /> / <CurrencyValue cents={cat.budgeted!} />
              </Text>
              <Text fz="xs" ta="right" ff="var(--mantine-font-family-monospace)">
                {pct}%
              </Text>
              <div className={classes.miniBarTrack}>
                <div
                  className={classes.miniBarFill}
                  style={{ width: barWidth, backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}

function VariableCategoriesCardSkeleton() {
  return (
    <div className={classes.card} data-testid="variable-categories-card-loading">
      <div className={classes.header}>
        <Skeleton width={140} height={12} />
        <Skeleton width={80} height={12} />
      </div>
      <Stack gap={6} mb="md">
        <Skeleton width={100} height={28} />
        <Skeleton width={140} height={14} />
        <Skeleton height={6} radius="xl" />
      </Stack>
      <Stack gap={12}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={classes.row}>
            <Skeleton height={14} />
            <Skeleton height={14} width={90} />
            <Skeleton height={14} width={36} />
            <Skeleton height={4} radius="xl" />
          </div>
        ))}
      </Stack>
    </div>
  );
}
