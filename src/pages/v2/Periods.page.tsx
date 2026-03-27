import { useMemo, useState } from 'react';
import { Button, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { PeriodCard, PeriodFormDrawer, ScheduleDrawer } from '@/components/v2/Periods';
import classes from '@/components/v2/Periods/Periods.module.css';
import { groupPeriods } from '@/components/v2/PeriodSelector/periodUtils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import {
  useBudgetPeriods,
  useBudgetPeriodSchedule,
  useDeleteBudgetPeriod,
} from '@/hooks/v2/useBudgetPeriods';
import { toast } from '@/lib/toast';

export function PeriodsV2Page() {
  const { setSelectedPeriodId } = useBudgetPeriodSelection();
  const { data: periodsData, isLoading, isError, refetch } = useBudgetPeriods({ limit: 200 });
  const { data: schedule } = useBudgetPeriodSchedule();
  const deleteMutation = useDeleteBudgetPeriod();
  const [periodDrawerOpened, { open: openPeriodDrawer, close: closePeriodDrawer }] =
    useDisclosure(false);
  const [scheduleDrawerOpened, { open: openScheduleDrawer, close: closeScheduleDrawer }] =
    useDisclosure(false);
  const [editPeriodId, setEditPeriodId] = useState<string | null>(null);

  const periods = periodsData?.data ?? [];
  const isAutoGenActive = schedule?.scheduleType === 'automatic';

  const groups = useMemo(() => groupPeriods(periods), [periods]);

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
      toast.success({ message: 'Period deleted' });
    } catch {
      toast.error({ message: 'Failed to delete period' });
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
            Retry
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
            Periods
          </Text>
          <Text c="dimmed" fz="sm">
            Manage your budget periods
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
              {isAutoGenActive ? 'Auto-generation active' : 'Auto-generation inactive'}
            </Text>
          </UnstyledButton>
          <Button size="sm" onClick={handleCreate}>
            + New Period
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!hasPeriods && (
        <div className={classes.centeredState}>
          <Text fz={32}>📅</Text>
          <Text fz={18} fw={700} ff="var(--mantine-font-family-headings)">
            No periods yet
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            Create your first budget period to start tracking spending, or enable auto-generation to
            have periods created automatically.
          </Text>
          <Button size="sm" onClick={handleCreate}>
            + Create First Period
          </Button>
        </div>
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

      <PeriodFormDrawer
        opened={periodDrawerOpened}
        onClose={closePeriodDrawer}
        editPeriodId={editPeriodId}
      />
      <ScheduleDrawer opened={scheduleDrawerOpened} onClose={closeScheduleDrawer} />
    </Stack>
  );
}
