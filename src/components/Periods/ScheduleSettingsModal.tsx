import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { IconCalendarStats, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Drawer,
  Group,
  Modal,
  NumberInput,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  useCreateBudgetPeriodSchedule,
  useDeleteBudgetPeriodSchedule,
  useUpdateBudgetPeriodSchedule,
} from '@/hooks/useBudget';
import { toast } from '@/lib/toast';
import {
  BudgetPeriodSchedule,
  BudgetPeriodScheduleRequest,
  PeriodDurationUnit,
  WeekendAdjustment,
} from '@/types/budget';
import classes from './ScheduleSettingsModal.module.css';

interface ScheduleSettingsModalProps {
  opened: boolean;
  onClose: () => void;
  schedule: BudgetPeriodSchedule | null;
}

interface ScheduleFormValues extends BudgetPeriodScheduleRequest {
  mode: 'manual' | 'automatic';
}

const defaultValues: ScheduleFormValues = {
  mode: 'manual',
  startDay: 1,
  durationValue: 1,
  durationUnit: 'months',
  saturdayAdjustment: 'keep',
  sundayAdjustment: 'keep',
  namePattern: '{MONTH} {YEAR}',
  generateAhead: 6,
};

export function ScheduleSettingsModal({ opened, onClose, schedule }: ScheduleSettingsModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 48em)');
  const createScheduleMutation = useCreateBudgetPeriodSchedule();
  const updateScheduleMutation = useUpdateBudgetPeriodSchedule();
  const deleteScheduleMutation = useDeleteBudgetPeriodSchedule();
  const [values, setValues] = useState<ScheduleFormValues>(defaultValues);

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (schedule) {
      setValues({
        mode: 'automatic',
        startDay: schedule.startDay,
        durationValue: schedule.durationValue,
        durationUnit: schedule.durationUnit,
        saturdayAdjustment: schedule.saturdayAdjustment,
        sundayAdjustment: schedule.sundayAdjustment,
        namePattern: schedule.namePattern,
        generateAhead: schedule.generateAhead,
      });
      return;
    }

    setValues(defaultValues);
  }, [opened, schedule]);

  const isSubmitting =
    createScheduleMutation.isPending ||
    updateScheduleMutation.isPending ||
    deleteScheduleMutation.isPending;

  const previewName = useMemo(() => {
    const date = dayjs().set('date', Math.min(values.startDay, 28));

    return values.namePattern
      .replaceAll('{MONTH}', date.format('MMMM'))
      .replaceAll('{YEAR}', date.format('YYYY'))
      .replaceAll('{DAY}', String(values.startDay));
  }, [values.namePattern, values.startDay]);

  const saveSchedule = async () => {
    if (values.mode === 'manual') {
      if (!schedule) {
        toast.success({
          title: t('common.success'),
          message: t('periods.schedule.savedManualMode'),
        });
        onClose();
        return;
      }

      try {
        await deleteScheduleMutation.mutateAsync();
        toast.success({
          title: t('common.success'),
          message: t('periods.schedule.disabledSuccess'),
        });
        onClose();
      } catch (error) {
        toast.error({
          title: t('common.error'),
          message: error instanceof Error ? error.message : t('periods.schedule.failedToSave'),
          nonCritical: true,
        });
      }

      return;
    }

    if (values.startDay < 1 || values.startDay > 31) {
      toast.error({
        title: t('common.error'),
        message: t('periods.schedule.startDayValidation'),
        nonCritical: true,
      });
      return;
    }

    if (values.durationValue < 1) {
      toast.error({
        title: t('common.error'),
        message: t('periods.schedule.durationValidation'),
        nonCritical: true,
      });
      return;
    }

    const payload: BudgetPeriodScheduleRequest = {
      startDay: values.startDay,
      durationValue: values.durationValue,
      durationUnit: values.durationUnit,
      saturdayAdjustment: values.saturdayAdjustment,
      sundayAdjustment: values.sundayAdjustment,
      namePattern: values.namePattern.trim() || '{MONTH} {YEAR}',
      generateAhead: values.generateAhead,
    };

    try {
      if (schedule) {
        await updateScheduleMutation.mutateAsync(payload);
      } else {
        await createScheduleMutation.mutateAsync(payload);
      }

      toast.success({
        title: t('common.success'),
        message: schedule
          ? t('periods.schedule.updatedSuccess')
          : t('periods.schedule.enabledSuccess'),
      });
      onClose();
    } catch (error) {
      toast.error({
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('periods.schedule.failedToSave'),
        nonCritical: true,
      });
    }
  };

  const automaticSettings = (
    <Stack gap="md">
      {schedule ? (
        <Alert
          icon={<IconInfoCircle size={16} />}
          variant="light"
          color="blue"
          title={t('periods.schedule.editImportant')}
        >
          <Stack gap={4}>
            <Text size="sm">• {t('periods.schedule.editWarningCurrent')}</Text>
            <Text size="sm">• {t('periods.schedule.editWarningPast')}</Text>
            <Text size="sm">• {t('periods.schedule.editWarningFuture')}</Text>
            <Text size="sm">• {t('periods.schedule.editWarningUsed')}</Text>
          </Stack>
        </Alert>
      ) : (
        <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
          {t('periods.schedule.autoInfo')}
        </Alert>
      )}

      <Group grow>
        <NumberInput
          min={1}
          max={31}
          label={t('periods.schedule.startDay')}
          value={values.startDay}
          onChange={(value) =>
            setValues((current) => ({ ...current, startDay: Number(value) || 1 }))
          }
        />
        <NumberInput
          min={1}
          max={12}
          label={t('periods.schedule.generateAhead')}
          value={values.generateAhead}
          onChange={(value) =>
            setValues((current) => ({ ...current, generateAhead: Number(value) || 1 }))
          }
        />
      </Group>

      <Group grow align="flex-end">
        <NumberInput
          min={1}
          label={t('periods.schedule.durationValue')}
          value={values.durationValue}
          onChange={(value) =>
            setValues((current) => ({ ...current, durationValue: Number(value) || 1 }))
          }
        />
        <Select
          label={t('periods.schedule.durationUnit')}
          value={values.durationUnit}
          data={[
            { value: 'days', label: t('periods.modal.durationUnits.days') },
            { value: 'weeks', label: t('periods.modal.durationUnits.weeks') },
            { value: 'months', label: t('periods.modal.durationUnits.months') },
          ]}
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              durationUnit: (value as PeriodDurationUnit) || 'months',
            }))
          }
        />
      </Group>

      <Group grow>
        <Select
          label={t('periods.schedule.saturdayAdjustment')}
          value={values.saturdayAdjustment}
          data={[
            { value: 'keep', label: t('periods.schedule.adjustment.keep') },
            { value: 'friday', label: t('periods.schedule.adjustment.friday') },
            { value: 'monday', label: t('periods.schedule.adjustment.monday') },
          ]}
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              saturdayAdjustment: (value as WeekendAdjustment) || 'keep',
            }))
          }
        />
        <Select
          label={t('periods.schedule.sundayAdjustment')}
          value={values.sundayAdjustment}
          data={[
            { value: 'keep', label: t('periods.schedule.adjustment.keep') },
            { value: 'friday', label: t('periods.schedule.adjustment.friday') },
            { value: 'monday', label: t('periods.schedule.adjustment.monday') },
          ]}
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              sundayAdjustment: (value as WeekendAdjustment) || 'keep',
            }))
          }
        />
      </Group>

      <TextInput
        label={t('periods.schedule.namePattern')}
        value={values.namePattern}
        onChange={(event) =>
          setValues((current) => ({ ...current, namePattern: event.currentTarget.value }))
        }
      />

      <div className={classes.previewCard}>
        <Group gap="xs" mb={6}>
          <IconCalendarStats size={16} />
          <Text fw={700}>{t('periods.schedule.preview')}</Text>
        </Group>
        <Text size="sm" c="dimmed">
          {t('periods.schedule.previewSummary', {
            startDay: values.startDay,
            durationValue: values.durationValue,
            durationUnit: t(`periods.modal.durationUnits.${values.durationUnit}`),
            saturday: t(`periods.schedule.adjustment.${values.saturdayAdjustment}`),
            sunday: t(`periods.schedule.adjustment.${values.sundayAdjustment}`),
            previewName,
            ahead: values.generateAhead,
          })}
        </Text>
      </div>
    </Stack>
  );

  const content = (
    <Stack gap="lg">
      {!schedule && (
        <Radio.Group
          label={t('periods.schedule.mode')}
          value={values.mode}
          onChange={(value) =>
            setValues((current) => ({ ...current, mode: value as 'manual' | 'automatic' }))
          }
        >
          <Stack mt="xs" gap="xs">
            <Radio value="manual" label={t('periods.schedule.manualMode')} />
            <Radio value="automatic" label={t('periods.schedule.automaticMode')} />
          </Stack>
        </Radio.Group>
      )}

      {(values.mode === 'automatic' || !!schedule) && automaticSettings}

      <Group justify="flex-end">
        <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button onClick={saveSchedule} loading={isSubmitting}>
          {schedule ? t('periods.schedule.updateSchedule') : t('common.save')}
        </Button>
      </Group>
    </Stack>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="95%"
        title={t('periods.schedule.title')}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} centered size="lg" title={t('periods.schedule.title')}>
      {content}
    </Modal>
  );
}
