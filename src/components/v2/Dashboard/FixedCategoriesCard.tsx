import { useTranslation } from 'react-i18next';
import { Button, Progress, ScrollArea, Skeleton, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDashboardFixedCategories } from '@/hooks/v2/useDashboard';
import { useV2Theme } from '@/theme/v2';
import classes from './FixedCategoriesCard.module.css';

interface FixedCategoriesCardProps {
  periodId: string;
}

export function FixedCategoriesCard({ periodId }: FixedCategoriesCardProps) {
  const { t } = useTranslation('v2');
  const { data, isLoading, isError, refetch } = useDashboardFixedCategories(periodId);
  const { accents } = useV2Theme();

  if (isLoading) {
    return <FixedCategoriesCardSkeleton />;
  }

  if (isError) {
    return (
      <div className={classes.card} data-testid="fixed-categories-card-error">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.fixedCategories.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('dashboard.fixedCategories.error')}
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  // v2 API returns a flat array of categories
  const categories = Array.isArray(data) ? data : (data?.categories ?? []);

  if (categories.length === 0) {
    return (
      <div className={classes.card} data-testid="fixed-categories-card-empty">
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            {t('dashboard.fixedCategories.title')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            {t('dashboard.fixedCategories.empty')}
          </Text>
        </div>
      </div>
    );
  }

  const totalBudgeted = Array.isArray(data)
    ? categories.reduce((sum: number, c: { budgeted: number }) => sum + c.budgeted, 0)
    : (data?.totalBudgeted ?? 0);
  const totalPaid = Array.isArray(data)
    ? categories.reduce((sum: number, c: { spent: number }) => sum + c.spent, 0)
    : (data?.totalPaid ?? 0);
  const overallPct = totalBudgeted > 0 ? Math.min((totalPaid / totalBudgeted) * 100, 100) : 0;

  return (
    <div className={classes.card} data-testid="fixed-categories-card">
      <div className={classes.header}>
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          {t('dashboard.fixedCategories.title')}
        </Text>
        <Text fz="xs" fw={600} c="var(--v2-primary)">
          {t('dashboard.fixedCategories.categoryCount', {
            count: categories.length,
            label: categories.length === 1 ? t('common.category') : t('common.categories'),
          })}
        </Text>
      </div>

      <div className={classes.summary}>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-monospace)">
          <CurrencyValue cents={totalPaid} />
        </Text>
        <Text fz="sm" c="dimmed" ff="var(--mantine-font-family-monospace)">
          of <CurrencyValue cents={totalBudgeted} /> paid
        </Text>
      </div>

      <Progress
        value={overallPct}
        size={6}
        radius="xl"
        color={accents.tertiary}
        className={classes.overallBar}
        aria-label={t('dashboard.fixedCategories.overallAria', { pct: Math.round(overallPct) })}
      />

      <ScrollArea className={classes.scrollArea} type="auto" offsetScrollbars={false}>
        {categories.map((cat: any) => {
          const id = cat.categoryId ?? cat.id;
          const name = cat.categoryName ?? cat.name;
          const paid = cat.spent ?? cat.paid ?? 0;
          const budgeted = cat.budgeted ?? 0;
          const status = cat.status;
          return (
            <div key={id} className={classes.row}>
              <div className={classes.checkbox} data-status={status} />
              <Text fz="sm" fw={500} truncate c={status === 'pending' ? 'dimmed' : undefined}>
                {name}
              </Text>
              <Text
                fz="xs"
                c="dimmed"
                ff="var(--mantine-font-family-monospace)"
                className={classes.amount}
              >
                <CurrencyValue cents={paid} /> / <CurrencyValue cents={budgeted} />
              </Text>
              <StatusBadge status={status} />
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}

function StatusBadge({ status }: { status: 'paid' | 'partial' | 'pending' }) {
  const { t } = useTranslation('v2');

  const colorMap = {
    paid: 'var(--v2-tertiary)',
    partial: 'var(--v2-primary)',
    pending: 'var(--mantine-color-dimmed)',
  } as const;

  const labelMap = {
    paid: t('dashboard.fixedCategories.paid'),
    partial: t('dashboard.fixedCategories.partial'),
    pending: t('dashboard.fixedCategories.pending'),
  } as const;

  return (
    <Text
      component="span"
      fz={10}
      fw={700}
      tt="uppercase"
      style={{ letterSpacing: '0.04em', color: colorMap[status] }}
      className={classes.badge}
    >
      {labelMap[status]}
    </Text>
  );
}

function FixedCategoriesCardSkeleton() {
  return (
    <div className={classes.card} data-testid="fixed-categories-card-loading">
      <div className={classes.header}>
        <Skeleton width={130} height={12} />
        <Skeleton width={80} height={12} />
      </div>
      <Stack gap={6} mb="md">
        <Skeleton width={100} height={28} />
        <Skeleton width={150} height={14} />
        <Skeleton height={6} radius="xl" />
      </Stack>
      <Stack gap={0}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={classes.row}>
            <Skeleton width={18} height={18} radius={5} />
            <Skeleton height={14} />
            <Skeleton height={14} width={90} />
            <Skeleton height={14} width={52} />
          </div>
        ))}
      </Stack>
    </div>
  );
}
