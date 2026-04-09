import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { EmptyState } from '@/components/Utils/EmptyState/EmptyState';
import { PageHint } from '@/components/v2/PageHint';
import { PeriodCard, PeriodFormDrawer, ScheduleDrawer } from '@/components/v2/Periods';
import classes from '@/components/v2/Periods/Periods.module.css';
import { groupPeriods } from '@/components/v2/PeriodSelector/periodUtils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import {
  useBudgetPeriodSchedule,
  useDeleteBudgetPeriod,
  useInfiniteBudgetPeriods,
} from '@/hooks/v2/useBudgetPeriods';
import { useInfiniteScroll } from '@/hooks/v2/useInfiniteScroll';
import { toast } from '@/lib/toast';

export function PeriodsV2Page() {
  const { t } = useTranslation('v2');
  const { setSelectedPeriodId } = useBudgetPeriodSelection();
  const {
    data: infiniteData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBudgetPeriods();
  const { data: schedule } = useBudgetPeriodSchedule();
  const deleteMutation = useDeleteBudgetPeriod();
  const [periodDrawerOpened, { open: openPeriodDrawer, close: closePeriodDrawer }] =
    useDisclosure(false);
  const [scheduleDrawerOpened, { open: openScheduleDrawer, close: closeScheduleDrawer }] =
    useDisclosure(false);
  const [editPeriodId, setEditPeriodId] = useState<string | null>(null);

  const loadMoreRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
  });
  const periods = infiniteData?.pages.flatMap((p) => p.data ?? []) ?? [];
  const isAutoGenActive = schedule?.scheduleType === 'automatic';

  const groups = useMemo(() => groupPeriods(periods, t), [periods, t]);

  const handleCreate = () => {
    setEditPeriodId(null);
    openPeriodDrawer();
  };

  const handleEdit = (id: string) => {
    setEditPeriodId(id);
    openPeriodDrawer();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success({ message: t('periods.deleted') });
    } catch {
      toast.error({ message: t('periods.deleteFailed') });
    }
  };

  const handleSelect = (id: string) => {
    setSelectedPeriodId(id);
  };

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <div className={classes.pageHeader}>
          <div>
            <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
              Periods
            </Text>
          </div>
        </div>
        <div className={classes.centeredState}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
            Periods
          </Text>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your periods.
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
        <div className={classes.pageHeader}>
          <div>
            <Skeleton width={120} height={28} />
            <Skeleton width={200} height={16} mt={4} />
          </div>
          <Skeleton width={120} height={32} radius="md" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className={classes.skeletonCard}>
            <div style={{ flex: 1 }}>
              <Skeleton width={160} height={16} mb={6} />
              <Skeleton width={200} height={12} />
            </div>
            <Skeleton width={60} height={30} />
            <Skeleton width={60} height={30} />
            <Skeleton width={60} height={30} />
          </div>
        ))}
      </Stack>
    );
  }

  const hasPeriods = periods.length > 0;

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Header */}
      <div className={classes.pageHeader}>
        <div>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            {t('periods.title')}
          </Text>
          <Text c="dimmed" fz="sm">
            {t('periods.subtitle')}
          </Text>
        </div>
        <div className={classes.headerActions}>
          <UnstyledButton className={classes.schedulePill} onClick={openScheduleDrawer}>
            <span
              className={classes.scheduleDot}
              style={{
                backgroundColor: isAutoGenActive ? 'var(--v2-primary)' : 'var(--v2-border)',
              }}
            />
            <Text fz="xs" fw={500} c={isAutoGenActive ? undefined : 'dimmed'}>
              {isAutoGenActive ? t('periods.autoGenActive') : t('periods.autoGenInactive')}
            </Text>
          </UnstyledButton>
          <Button data-testid="periods-add-button" size="sm" onClick={handleCreate}>
            {t('periods.newPeriod')}
          </Button>
        </div>
      </div>

      {/* Page hint */}
      <PageHint hintId="periods" message={t('hints.periods')} />

      {/* Empty state */}
      {!hasPeriods && (
        <EmptyState
          icon="📅"
          title={t('periods.emptyTitle')}
          message={t('periods.emptyDescription')}
          primaryAction={{ label: t('periods.createFirstPeriod'), onClick: handleCreate }}
          tips={[
            t('periods.emptyTips.timeframe'),
            t('periods.emptyTips.autoGen'),
            t('periods.emptyTips.compare'),
          ]}
          onboardingSteps={[
            {
              title: t('periods.emptySteps.create.title'),
              description: t('periods.emptySteps.create.description'),
            },
            {
              title: t('periods.emptySteps.configure.title'),
              description: t('periods.emptySteps.configure.description'),
            },
            {
              title: t('periods.emptySteps.select.title'),
              description: t('periods.emptySteps.select.description'),
            },
          ]}
          data-testid="periods-empty-state"
        />
      )}

      {/* Grouped periods */}
      {groups.map((group) => (
        <Stack key={group.label} gap="sm">
          <div className={classes.groupHeader}>
            <Text fz="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.88px' }}>
              {group.label}
            </Text>
          </div>
          {group.periods.map((period) => (
            <PeriodCard
              key={period.id}
              period={period}
              scheduleActive={isAutoGenActive}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleSelect}
            />
          ))}
        </Stack>
      ))}

      {isFetchingNextPage && (
        <Stack gap="xs">
          <Skeleton height={72} radius="lg" />
          <Skeleton height={72} radius="lg" />
        </Stack>
      )}
      {hasNextPage && !isFetchingNextPage && <div ref={loadMoreRef} style={{ height: 1 }} />}

      <PeriodFormDrawer
        key={editPeriodId ?? 'create'}
        opened={periodDrawerOpened}
        onClose={closePeriodDrawer}
        editPeriodId={editPeriodId}
      />
      <ScheduleDrawer opened={scheduleDrawerOpened} onClose={closeScheduleDrawer} />
    </Stack>
  );
}
