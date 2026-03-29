import { useEffect, useState } from 'react';
import { Alert, Button, Drawer, Group, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import type { components } from '@/api/v2';
import {
  useBudgetPeriod,
  useCreateBudgetPeriod,
  useUpdateBudgetPeriod,
} from '@/hooks/v2/useBudgetPeriods';
import { toast } from '@/lib/toast';

type PeriodType = 'duration' | 'manualEndDate';
type DurationUnit = 'days' | 'weeks' | 'months';

interface PeriodFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  editPeriodId?: string | null;
}

export function PeriodFormDrawer({ opened, onClose, editPeriodId }: PeriodFormDrawerProps) {
  const isEdit = !!editPeriodId;
  const { data: editData } = useBudgetPeriod(editPeriodId ?? '');
  const createMutation = useCreateBudgetPeriod();
  const updateMutation = useUpdateBudgetPeriod();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [periodType, setPeriodType] = useState<PeriodType>('duration');
  const [durationUnits, setDurationUnits] = useState<number | string>(30);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days');
  const [manualEndDate, setManualEndDate] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (isEdit && editData) {
      setName(editData.name);
      setStartDate(editData.startDate);
      setPeriodType(editData.periodType);
      if (editData.periodType === 'duration' && 'duration' in editData) {
        const dur = (editData as components['schemas']['DurationBased']).duration;
        setDurationUnits(dur.durationUnits);
        setDurationUnit(dur.durationUnit as DurationUnit);
      }
      if (editData.periodType === 'manualEndDate' && 'manualEndDate' in editData) {
        setManualEndDate((editData as components['schemas']['ManualEndDate']).manualEndDate);
      }
    }
  }, [isEdit, editData]);

  const isPastPeriod = isEdit && editData?.status === 'past';

  const handleSubmit = async () => {
    const base = {
      name: name.trim(),
      startDate,
      periodType,
    };

    let body: components['schemas']['CreatePeriodRequest'];

    if (periodType === 'duration') {
      body = {
        ...base,
        duration: {
          durationUnits: Number(durationUnits),
          durationUnit,
        },
      } as components['schemas']['CreatePeriodRequest'];
    } else {
      body = {
        ...base,
        manualEndDate,
      } as components['schemas']['CreatePeriodRequest'];
    }

    try {
      if (isEdit && editPeriodId) {
        const { periodType: _, ...rest } = body;
        const updateBody: components['schemas']['UpdatePeriodRequest'] = {
          ...rest,
          periodType: 'UpdatePeriodRequest',
        };
        await updateMutation.mutateAsync({
          id: editPeriodId,
          body: updateBody,
        });
        toast.success({ message: 'Period updated' });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: 'Period created' });
      }
      onClose();
    } catch {
      toast.error({ message: `Failed to ${isEdit ? 'update' : 'create'} period` });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid = name.trim().length >= 1 && startDate;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Period' : 'Create Period'}
      position="right"
      size="md"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        {isPastPeriod && (
          <Alert variant="light" color="orange" title="Warning">
            Changing dates on a past period will shift transactions between periods.
          </Alert>
        )}

        {/* Period name */}
        <TextInput
          label="Period Name"
          placeholder="e.g. April 2026"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        {/* Start date */}
        <TextInput
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.currentTarget.value)}
          required
        />

        {/* Period type */}
        {!isEdit && (
          <Select
            label="Period Type"
            data={[
              { value: 'duration', label: 'Duration-based' },
              { value: 'manualEndDate', label: 'Manual end date' },
            ]}
            value={periodType}
            onChange={(v) => setPeriodType((v as PeriodType) ?? 'duration')}
          />
        )}

        {/* Duration fields */}
        {periodType === 'duration' && (
          <Group grow>
            <NumberInput
              label="Duration"
              value={durationUnits}
              onChange={setDurationUnits}
              min={1}
              max={366}
            />
            <Select
              label="Unit"
              data={[
                { value: 'days', label: 'Days' },
                { value: 'weeks', label: 'Weeks' },
                { value: 'months', label: 'Months' },
              ]}
              value={durationUnit}
              onChange={(v) => setDurationUnit((v as DurationUnit) ?? 'days')}
            />
          </Group>
        )}

        {/* Manual end date */}
        {periodType === 'manualEndDate' && (
          <TextInput
            label="End Date"
            type="date"
            value={manualEndDate}
            onChange={(e) => setManualEndDate(e.currentTarget.value)}
            required
          />
        )}

        {/* Submit */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isValid}>
            {isEdit ? 'Save Changes' : 'Create Period'}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
