import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import {
  IconAlertTriangle,
  IconCalendarPlus,
  IconChevronDown,
  IconChevronUp,
  IconPlayerPause,
  IconRefresh,
  IconSettings,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  useBudgetPeriodGaps,
  useBudgetPeriods,
  useBudgetPeriodSchedule,
  useDeleteBudgetPeriod,
  useDeleteBudgetPeriodSchedule,
} from '@/hooks/useBudget';
import { BudgetPeriod } from '@/types/budget';
import { PeriodCard } from './PeriodCard';
import { PeriodFormModal } from './PeriodFormModal';
import { ScheduleSettingsModal } from './ScheduleSettingsModal';
import classes from './PeriodsPage.module.css';

const sortByStartDateDesc = (left: BudgetPeriod, right: BudgetPeriod) =>
  dayjs(right.startDate).valueOf() - dayjs(left.startDate).valueOf();

export function PeriodsPage() {
  const { t } = useTranslation();
  const { data: periods = [], isLoading: isLoadingPeriods } = useBudgetPeriods();
  const { data: schedule, isLoading: isLoadingSchedule } = useBudgetPeriodSchedule();
  const { data: gaps, isLoading: isLoadingGaps } = useBudgetPeriodGaps();
  const deletePeriodMutation = useDeleteBudgetPeriod();
  const disableScheduleMutation = useDeleteBudgetPeriodSchedule();

  const [isPastOpen, setIsPastOpen] = useState(false);
  const [isPeriodModalOpen, setPeriodModalOpen] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<BudgetPeriod | null>(null);
  const [periodPendingDelete, setPeriodPendingDelete] = useState<BudgetPeriod | null>(null);
  const [isDisableScheduleConfirmOpen, setDisableScheduleConfirmOpen] = useState(false);
  const [suggestedRange, setSuggestedRange] = useState<{
    startDate: string;
    endDate?: string;
  } | null>(null);

  const now = dayjs().startOf('day');

  const groupedPeriods = useMemo(() => {
    const current = periods.filter(
      (period) =>
        dayjs(period.startDate).startOf('day').isBefore(now.add(1, 'day')) &&
        dayjs(period.endDate).startOf('day').isAfter(now.subtract(1, 'day'))
    );

    const upcoming = periods
      .filter((period) => dayjs(period.startDate).startOf('day').isAfter(now))
      .sort(sortByStartDateDesc);

    const past = periods
      .filter((period) => dayjs(period.endDate).startOf('day').isBefore(now))
      .sort(sortByStartDateDesc);

    return {
      current: current.sort(sortByStartDateDesc),
      upcoming,
      past,
    };
  }, [now, periods]);

  const openCreateModal = () => {
    setEditingPeriod(null);
    setSuggestedRange(null);
    setPeriodModalOpen(true);
  };

  const openEditModal = (period: BudgetPeriod) => {
    setEditingPeriod(period);
    setSuggestedRange(null);
    setPeriodModalOpen(true);
  };

  const handleDelete = (period: BudgetPeriod) => {
    setPeriodPendingDelete(period);
  };

  const confirmDelete = async () => {
    if (!periodPendingDelete) {
      return;
    }

    try {
      await deletePeriodMutation.mutateAsync(periodPendingDelete.id);
      notifications.show({
        color: 'green',
        title: t('common.success'),
        message: t('periods.deletedSuccess'),
      });
      setPeriodPendingDelete(null);
    } catch (error) {
      notifications.show({
        color: 'red',
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('periods.deleteFailed'),
      });
    }
  };

  const confirmDisableSchedule = async () => {
    try {
      await disableScheduleMutation.mutateAsync();
      notifications.show({
        color: 'green',
        title: t('common.success'),
        message: t('periods.schedule.disabledSuccess'),
      });
      setDisableScheduleConfirmOpen(false);
    } catch (error) {
      notifications.show({
        color: 'red',
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('periods.schedule.failedToSave'),
      });
    }
  };

  const handleFixGap = () => {
    const transactions = gaps?.transactions ?? [];

    if (transactions.length > 0) {
      const ordered = [...transactions].sort(
        (left, right) => dayjs(left.occurredAt).valueOf() - dayjs(right.occurredAt).valueOf()
      );

      setSuggestedRange({
        startDate: ordered[0].occurredAt,
        endDate: ordered[ordered.length - 1].occurredAt,
      });
    }

    setEditingPeriod(null);
    setPeriodModalOpen(true);
  };

  if (isLoadingPeriods || isLoadingSchedule || isLoadingGaps) {
    return (
      <div className={classes.loadingState}>
        <Loader size="sm" />
      </div>
    );
  }

  return (
    <Stack gap="xl" className={classes.pageRoot}>
      <div>
        <Title order={1}>{t('periods.page.title')}</Title>
        <Text c="dimmed">{t('periods.page.description')}</Text>
      </div>

      {schedule ? (
        <Paper withBorder radius="lg" p="lg" className={classes.scheduleCard}>
          <Group justify="space-between" align="flex-start" gap="md">
            <Stack gap={4}>
              <Group gap="xs">
                <Text fw={700}>{t('periods.schedule.activeTitle')}</Text>
                <Badge color="violet" variant="light">
                  {t('periods.schedule.activeBadge')}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {t('periods.schedule.summary', {
                  startDay: schedule.startDay,
                  durationValue: schedule.durationValue,
                  durationUnit: t(`periods.modal.durationUnits.${schedule.durationUnit}`),
                  generateAhead: schedule.generateAhead,
                })}
              </Text>
            </Stack>

            <Group gap="xs">
              <Button
                variant="light"
                leftSection={<IconSettings size={14} />}
                onClick={() => setScheduleModalOpen(true)}
              >
                {t('periods.schedule.edit')}
              </Button>
              <Button
                color="red"
                variant="light"
                leftSection={<IconPlayerPause size={14} />}
                onClick={() => setDisableScheduleConfirmOpen(true)}
                loading={disableScheduleMutation.isPending}
              >
                {t('periods.schedule.disable')}
              </Button>
            </Group>
          </Group>
        </Paper>
      ) : (
        <Paper withBorder radius="lg" p="lg" className={classes.setupCard}>
          <Group justify="space-between" align="center">
            <div>
              <Text fw={700}>{t('periods.schedule.notConfiguredTitle')}</Text>
              <Text size="sm" c="dimmed">
                {t('periods.schedule.notConfiguredDescription')}
              </Text>
            </div>
            <Button
              leftSection={<IconRefresh size={14} />}
              onClick={() => setScheduleModalOpen(true)}
            >
              {t('periods.schedule.configure')}
            </Button>
          </Group>
        </Paper>
      )}

      {(gaps?.unassignedCount ?? 0) > 0 && (
        <Alert
          color="orange"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title={t('periods.gaps.title', { count: gaps?.unassignedCount ?? 0 })}
        >
          <Stack gap="sm" mt="xs">
            <Text size="sm">{t('periods.gaps.subtitle')}</Text>
            {(gaps?.transactions ?? []).slice(0, 3).map((transaction) => (
              <Group
                key={transaction.id}
                justify="space-between"
                className={classes.gapTransaction}
              >
                <Text size="sm">
                  {dayjs(transaction.occurredAt).format('MMM D')} - {transaction.description}
                </Text>
                <Text size="sm" fw={700}>
                  {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(
                    transaction.amount / 100
                  )}
                </Text>
              </Group>
            ))}
            <Button size="xs" color="orange" variant="filled" onClick={handleFixGap}>
              {t('periods.gaps.fixAction')}
            </Button>
          </Stack>
        </Alert>
      )}

      <section className={classes.section}>
        <Group justify="space-between">
          <Title order={3}>{t('periods.sections.current')}</Title>
        </Group>

        <Stack gap="md" mt="md">
          {groupedPeriods.current.length > 0 ? (
            groupedPeriods.current.map((period) => (
              <PeriodCard
                key={period.id}
                period={period}
                status="current"
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <Text c="dimmed">{t('periods.empty.current')}</Text>
          )}
        </Stack>
      </section>

      <section className={classes.section}>
        <Group justify="space-between">
          <Title order={3}>{t('periods.sections.upcoming')}</Title>
          <Badge variant="light" color="gray">
            {groupedPeriods.upcoming.length}
          </Badge>
        </Group>

        <Stack gap="md" mt="md">
          {groupedPeriods.upcoming.length > 0 ? (
            groupedPeriods.upcoming.map((period) => (
              <PeriodCard
                key={period.id}
                period={period}
                status="upcoming"
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <Text c="dimmed">{t('periods.empty.upcoming')}</Text>
          )}
        </Stack>
      </section>

      <section className={classes.section}>
        <Group justify="space-between" align="center">
          <Title order={3}>{t('periods.sections.past')}</Title>
          <Group gap="xs">
            <Badge variant="light" color="gray">
              {groupedPeriods.past.length}
            </Badge>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setIsPastOpen((current) => !current)}
              aria-label="Toggle past periods"
            >
              {isPastOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
        </Group>

        {isPastOpen && (
          <Stack gap="md" mt="md">
            {groupedPeriods.past.length > 0 ? (
              groupedPeriods.past.map((period) => (
                <PeriodCard
                  key={period.id}
                  period={period}
                  status="past"
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <Text c="dimmed">{t('periods.empty.past')}</Text>
            )}
          </Stack>
        )}
      </section>

      {!schedule && (
        <Button
          className={classes.fab}
          radius="xl"
          size="lg"
          leftSection={<IconCalendarPlus size={16} />}
          onClick={openCreateModal}
        >
          {t('periods.createPeriod')}
        </Button>
      )}

      <PeriodFormModal
        opened={isPeriodModalOpen}
        onClose={() => {
          setPeriodModalOpen(false);
          setEditingPeriod(null);
          setSuggestedRange(null);
        }}
        periods={periods}
        period={editingPeriod}
        suggestedRange={suggestedRange}
      />

      <ScheduleSettingsModal
        opened={isScheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        schedule={schedule ?? null}
      />

      <Modal
        opened={Boolean(periodPendingDelete)}
        onClose={() => setPeriodPendingDelete(null)}
        title={t('budget.budgetedCategories.delete')}
        centered
      >
        <Stack gap="md">
          <Text>
            {t('periods.confirmDelete', {
              name: periodPendingDelete?.name ?? '',
            })}
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setPeriodPendingDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button color="red" onClick={confirmDelete} loading={deletePeriodMutation.isPending}>
              {t('budget.budgetedCategories.delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={isDisableScheduleConfirmOpen}
        onClose={() => setDisableScheduleConfirmOpen(false)}
        title={t('periods.schedule.disable')}
        centered
      >
        <Stack gap="md">
          <Text>{t('periods.schedule.disableConfirm')}</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDisableScheduleConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              color="red"
              onClick={confirmDisableSchedule}
              loading={disableScheduleMutation.isPending}
            >
              {t('periods.schedule.disable')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
