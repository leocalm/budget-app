import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { IconAlertTriangle, IconCalendarPlus, IconDeviceFloppy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Drawer,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useCreateBudgetPeriod, useUpdateBudgetPeriod } from '@/hooks/useBudget';
import { BudgetPeriod, PeriodDurationUnit } from '@/types/budget';
import classes from './PeriodFormModal.module.css';

interface PeriodFormModalProps {
  opened: boolean;
  onClose: () => void;
  periods: BudgetPeriod[];
  period?: BudgetPeriod | null;
  suggestedRange?: { startDate: string; endDate?: string } | null;
}

interface FormValues {
  startDate: string;
  durationValue: number;
  durationUnit: PeriodDurationUnit;
  endDateMode: 'duration' | 'manual';
  manualEndDate: string;
  name: string;
  copyBudgetsFromPrevious: boolean;
}

const getDefaultValues = (
  period?: BudgetPeriod | null,
  suggestedRange?: { startDate: string; endDate?: string } | null
): FormValues => {
  if (period) {
    return {
      startDate: period.startDate,
      durationValue: 1,
      durationUnit: 'months',
      endDateMode: 'manual',
      manualEndDate: period.endDate,
      name: period.name,
      copyBudgetsFromPrevious: true,
    };
  }

  if (suggestedRange) {
    const derivedDuration = suggestedRange.endDate
      ? Math.max(dayjs(suggestedRange.endDate).diff(dayjs(suggestedRange.startDate), 'day'), 1)
      : 30;

    return {
      startDate: suggestedRange.startDate,
      durationValue: derivedDuration,
      durationUnit: 'days',
      endDateMode: suggestedRange.endDate ? 'manual' : 'duration',
      manualEndDate: suggestedRange.endDate || '',
      name: '',
      copyBudgetsFromPrevious: true,
    };
  }

  return {
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    durationValue: 1,
    durationUnit: 'months',
    endDateMode: 'duration',
    manualEndDate: '',
    name: '',
    copyBudgetsFromPrevious: true,
  };
};

const getDurationEndDate = (
  startDate: string,
  durationValue: number,
  durationUnit: PeriodDurationUnit
) => {
  if (!startDate || durationValue < 1) {
    return '';
  }

  return dayjs(startDate).add(durationValue, durationUnit).format('YYYY-MM-DD');
};

const overlapsAnyPeriod = (
  startDate: string,
  endDate: string,
  periods: BudgetPeriod[],
  currentPeriodId?: string
) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  return periods.some((existingPeriod) => {
    if (existingPeriod.id === currentPeriodId) {
      return false;
    }

    const existingStart = dayjs(existingPeriod.startDate);
    const existingEnd = dayjs(existingPeriod.endDate);

    return (
      start.isBefore(existingEnd.add(1, 'day')) && end.isAfter(existingStart.subtract(1, 'day'))
    );
  });
};

export function PeriodFormModal({
  opened,
  onClose,
  periods,
  period,
  suggestedRange,
}: PeriodFormModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 48em)');
  const createMutation = useCreateBudgetPeriod();
  const updateMutation = useUpdateBudgetPeriod();
  const [values, setValues] = useState<FormValues>(getDefaultValues(period, suggestedRange));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditMode = Boolean(period);

  useEffect(() => {
    if (opened) {
      setValues(getDefaultValues(period, suggestedRange));
      setErrorMessage(null);
    }
  }, [opened, period, suggestedRange]);

  const calculatedEndDate = useMemo(
    () => getDurationEndDate(values.startDate, values.durationValue, values.durationUnit),
    [values.durationUnit, values.durationValue, values.startDate]
  );

  const selectedEndDate =
    values.endDateMode === 'duration' ? calculatedEndDate : values.manualEndDate;
  const selectedEndDateDisplay = selectedEndDate
    ? dayjs(selectedEndDate).format('MMM D, YYYY')
    : '—';
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const validateForm = () => {
    if (!values.startDate) {
      return t('periods.modal.errors.startDateRequired');
    }

    if (values.endDateMode === 'duration' && values.durationValue < 1) {
      return t('periods.modal.errors.durationValueMin');
    }

    if (values.endDateMode === 'manual' && !values.manualEndDate) {
      return t('periods.modal.errors.endDateRequired');
    }

    if (!selectedEndDate || !dayjs(selectedEndDate).isValid()) {
      return t('periods.modal.errors.endDateRequired');
    }

    if (!dayjs(selectedEndDate).isAfter(dayjs(values.startDate))) {
      return t('periods.modal.errors.endDateAfterStart');
    }

    if (overlapsAnyPeriod(values.startDate, selectedEndDate, periods, period?.id)) {
      return t('periods.modal.errors.overlapDetected');
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);

    const fallbackName = dayjs(values.startDate).format('MMMM YYYY');
    const payload = {
      name: values.name.trim() || fallbackName,
      startDate: values.startDate,
      endDate: selectedEndDate,
      copyBudgetsFromPrevious: values.copyBudgetsFromPrevious,
    };

    try {
      if (period) {
        await updateMutation.mutateAsync({ id: period.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      notifications.show({
        color: 'green',
        title: t('common.success'),
        message: isEditMode
          ? t('periods.modal.success.updated')
          : t('periods.modal.success.created'),
      });

      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('periods.modal.errors.saveFailed');
      notifications.show({
        color: 'red',
        title: t('common.error'),
        message,
      });
    }
  };

  const formContent = (
    <Stack gap="md">
      {isEditMode && (
        <Alert variant="light" color="yellow" icon={<IconAlertTriangle size={16} />}>
          {t('periods.modal.editWarning')}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="light" color="red" icon={<IconAlertTriangle size={16} />}>
          {errorMessage}
        </Alert>
      )}

      <TextInput
        type="date"
        label={t('periods.modal.startDate')}
        value={values.startDate}
        onChange={(event) => {
          const startDate = event.currentTarget.value;
          setValues((current) => ({ ...current, startDate }));
        }}
        required
      />

      <Group grow align="flex-end">
        <NumberInput
          min={1}
          label={t('periods.modal.duration')}
          value={values.durationValue}
          onChange={(value) =>
            setValues((current) => ({ ...current, durationValue: Number(value) || 1 }))
          }
          required
        />
        <Select
          label={t('periods.modal.durationUnit')}
          value={values.durationUnit}
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              durationUnit: (value as PeriodDurationUnit) || 'months',
            }))
          }
          data={[
            { label: t('periods.modal.durationUnits.days'), value: 'days' },
            { label: t('periods.modal.durationUnits.weeks'), value: 'weeks' },
            { label: t('periods.modal.durationUnits.months'), value: 'months' },
          ]}
        />
      </Group>

      <SegmentedControl
        value={values.endDateMode}
        onChange={(value) =>
          setValues((current) => ({ ...current, endDateMode: value as 'duration' | 'manual' }))
        }
        data={[
          { label: t('periods.modal.endDateModes.duration'), value: 'duration' },
          { label: t('periods.modal.endDateModes.manual'), value: 'manual' },
        ]}
      />

      {values.endDateMode === 'manual' ? (
        <TextInput
          type="date"
          label={t('periods.modal.manualEndDate')}
          value={values.manualEndDate}
          onChange={(event) => {
            const manualEndDate = event.currentTarget.value;
            setValues((current) => ({ ...current, manualEndDate }));
          }}
          required
        />
      ) : (
        <div className={classes.previewCard}>
          <Text size="xs" c="dimmed">
            {t('periods.modal.calculatedEndDate')}
          </Text>
          <Text fw={700}>{selectedEndDateDisplay}</Text>
        </div>
      )}

      <TextInput
        label={t('periods.modal.periodName')}
        placeholder={t('periods.modal.periodNamePlaceholder')}
        value={values.name}
        onChange={(event) => {
          const name = event.currentTarget.value;
          setValues((current) => ({ ...current, name }));
        }}
      />

      <Switch
        checked={values.copyBudgetsFromPrevious}
        onChange={(event) => {
          const copyBudgetsFromPrevious = event.currentTarget.checked;
          setValues((current) => ({
            ...current,
            copyBudgetsFromPrevious,
          }));
        }}
        label={t('periods.modal.copyBudgets')}
      />

      <Group justify="flex-end" mt="sm">
        <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          leftSection={isEditMode ? <IconDeviceFloppy size={16} /> : <IconCalendarPlus size={16} />}
        >
          {isEditMode ? t('periods.modal.saveChanges') : t('periods.modal.createPeriod')}
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
        title={isEditMode ? t('periods.modal.editTitle') : t('periods.modal.createTitle')}
        size="95%"
      >
        {formContent}
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? t('periods.modal.editTitle') : t('periods.modal.createTitle')}
      centered
      size="lg"
    >
      {formContent}
    </Modal>
  );
}
