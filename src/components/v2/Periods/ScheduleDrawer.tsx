import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Radio,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import type { components } from '@/api/v2';
import {
  useBudgetPeriodSchedule,
  useCreatePeriodSchedule,
  useDeletePeriodSchedule,
  useUpdatePeriodSchedule,
} from '@/hooks/v2/useBudgetPeriods';
import { toast } from '@/lib/toast';
import classes from './Periods.module.css';

type DurationUnit = 'days' | 'weeks' | 'months';
type WeekendPolicy = 'keep' | 'monday' | 'friday';
type RecurrenceMethod = 'dayOfMonth' | 'businessDay' | 'dayOfWeek';

const WEEKEND_POLICY_OPTIONS = [
  { value: 'keep', label: 'Keep as-is' },
  { value: 'monday', label: 'Move to Monday' },
  { value: 'friday', label: 'Move to Friday' },
];

const PATTERN_VARIABLES = [
  { var: '{MONTH}', desc: 'Full month name' },
  { var: '{MONTH_SHORT}', desc: '3-letter month' },
  { var: '{YEAR}', desc: '4-digit year' },
  { var: '{YEAR_SHORT}', desc: '2-digit year' },
  { var: '{START_DATE}', desc: 'Start date' },
  { var: '{END_DATE}', desc: 'End date' },
  { var: '{PERIOD_NUMBER}', desc: 'Sequence #' },
];

interface ScheduleDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function ScheduleDrawer({ opened, onClose }: ScheduleDrawerProps) {
  const { data: schedule } = useBudgetPeriodSchedule();
  const createMutation = useCreatePeriodSchedule();
  const updateMutation = useUpdatePeriodSchedule();
  const deleteMutation = useDeletePeriodSchedule();

  const isExisting = !!schedule;
  const isAutomatic = schedule?.scheduleType === 'automatic';

  const [enabled, setEnabled] = useState(false);
  const [recurrenceMethod, setRecurrenceMethod] = useState<RecurrenceMethod>('dayOfMonth');
  const [startDay, setStartDay] = useState<number | string>(1);
  const [periodDuration, setPeriodDuration] = useState<number | string>(30);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days');
  const [generateAhead, setGenerateAhead] = useState<number | string>(3);
  const [saturdayPolicy, setSaturdayPolicy] = useState<WeekendPolicy>('keep');
  const [sundayPolicy, setSundayPolicy] = useState<WeekendPolicy>('keep');
  const [namePattern, setNamePattern] = useState('{MONTH} {YEAR}');

  // Populate from existing schedule
  useEffect(() => {
    if (schedule) {
      setEnabled(schedule.scheduleType === 'automatic');
      if (schedule.scheduleType === 'automatic') {
        const auto = schedule as components['schemas']['AutomaticSchedule'] & { id: string };
        setRecurrenceMethod(auto.recurrenceMethod as RecurrenceMethod);
        setStartDay(auto.startDayOfTheMonth);
        setPeriodDuration(auto.periodDuration);
        setDurationUnit(auto.durationUnit);
        setGenerateAhead(auto.generateAhead);
        setSaturdayPolicy(auto.saturdayPolicy);
        setSundayPolicy(auto.sundayPolicy);
        setNamePattern(auto.namePattern);
      }
    }
  }, [schedule]);

  // Reset when opening fresh
  useEffect(() => {
    if (opened && !isExisting) {
      setEnabled(false);
      setRecurrenceMethod('dayOfMonth');
      setStartDay(1);
      setPeriodDuration(30);
      setDurationUnit('days');
      setGenerateAhead(3);
      setSaturdayPolicy('keep');
      setSundayPolicy('keep');
      setNamePattern('{MONTH} {YEAR}');
    }
  }, [opened, isExisting]);

  const patternPreview = useMemo(() => {
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const startDate = new Date(now.getFullYear(), now.getMonth(), Number(startDay) || 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(periodDuration) - 1);

    return namePattern
      .replace('{MONTH}', startDate.toLocaleDateString('en-US', { month: 'long' }))
      .replace('{MONTH_SHORT}', startDate.toLocaleDateString('en-US', { month: 'short' }))
      .replace('{YEAR}', String(startDate.getFullYear()))
      .replace('{YEAR_SHORT}', String(startDate.getFullYear()).slice(-2))
      .replace('{START_DATE}', fmt(startDate))
      .replace('{END_DATE}', fmt(endDate))
      .replace('{PERIOD_NUMBER}', '1');
  }, [namePattern, startDay, periodDuration]);

  const handleSubmit = async () => {
    try {
      if (!enabled) {
        // Disable auto-generation
        if (isExisting && isAutomatic) {
          await deleteMutation.mutateAsync();
          toast.success({ message: 'Auto-generation disabled' });
        }
        onClose();
        return;
      }

      const body: components['schemas']['CreatePeriodScheduleRequest'] = {
        scheduleType: 'automatic',
        recurrenceMethod,
        startDayOfTheMonth: Number(startDay),
        periodDuration: Number(periodDuration),
        durationUnit,
        generateAhead: Number(generateAhead),
        saturdayPolicy,
        sundayPolicy,
        namePattern,
      };

      if (isExisting) {
        const { scheduleType: _, ...rest } = body;
        const updateBody: components['schemas']['UpdatePeriodScheduleRequest'] = {
          ...rest,
          scheduleType: 'UpdatePeriodScheduleRequest',
        };
        await updateMutation.mutateAsync(updateBody);
        toast.success({ message: 'Schedule updated' });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: 'Auto-generation enabled' });
      }
      onClose();
    } catch {
      toast.error({ message: 'Failed to save schedule configuration' });
    }
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Auto-generate Periods"
      position="right"
      size="lg"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="lg">
        {/* Enable toggle */}
        <Switch
          label="Auto-generation active"
          description="Set up rules to automatically create budget periods"
          checked={enabled}
          onChange={(e) => setEnabled(e.currentTarget.checked)}
          size="md"
        />

        {enabled && (
          <>
            {/* Recurrence method */}
            <div>
              <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
                Recurrence Method
              </Text>
              <Stack gap="xs" role="radiogroup" aria-label="Recurrence method">
                <RecurrenceOption
                  value="dayOfMonth"
                  label="Day of month"
                  description="Period starts on a specific calendar day"
                  selected={recurrenceMethod}
                  onChange={setRecurrenceMethod}
                />
                <RecurrenceOption
                  value="businessDay"
                  label="Business day"
                  description="Period starts on the Nth business day"
                  selected={recurrenceMethod}
                  onChange={setRecurrenceMethod}
                />
                <RecurrenceOption
                  value="dayOfWeek"
                  label="Day of week"
                  description="Period starts on a specific weekday"
                  selected={recurrenceMethod}
                  onChange={setRecurrenceMethod}
                />
              </Stack>
            </div>

            {/* Start day */}
            {recurrenceMethod === 'dayOfMonth' && (
              <NumberInput
                label="Start Day of Month"
                description="Day of the month when the period begins (1-31)"
                value={startDay}
                onChange={setStartDay}
                min={1}
                max={31}
              />
            )}
            {recurrenceMethod === 'businessDay' && (
              <NumberInput
                label="Business Day"
                description="Nth business day of the month (e.g. 1 = first business day)"
                value={startDay}
                onChange={setStartDay}
                min={1}
                max={23}
              />
            )}
            {recurrenceMethod === 'dayOfWeek' && (
              <Select
                label="Day of Week"
                data={[
                  { value: '1', label: 'Monday' },
                  { value: '2', label: 'Tuesday' },
                  { value: '3', label: 'Wednesday' },
                  { value: '4', label: 'Thursday' },
                  { value: '5', label: 'Friday' },
                  { value: '6', label: 'Saturday' },
                  { value: '0', label: 'Sunday' },
                ]}
                value={String(startDay)}
                onChange={(v) => setStartDay(Number(v ?? 1))}
              />
            )}

            {/* Period duration */}
            <Group grow>
              <NumberInput
                label="Period Length"
                value={periodDuration}
                onChange={setPeriodDuration}
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

            {/* Generate ahead */}
            <NumberInput
              label="Periods to Prepare in Advance"
              description="Number of future periods to pre-generate"
              value={generateAhead}
              onChange={setGenerateAhead}
              min={1}
              max={12}
            />

            {/* Weekend policies */}
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              Weekend Handling
            </Text>
            <div className={classes.weekendPolicies}>
              <Select
                label="If start falls on Saturday"
                data={WEEKEND_POLICY_OPTIONS}
                value={saturdayPolicy}
                onChange={(v) => setSaturdayPolicy((v as WeekendPolicy) ?? 'keep')}
              />
              <Select
                label="If start falls on Sunday"
                data={WEEKEND_POLICY_OPTIONS}
                value={sundayPolicy}
                onChange={(v) => setSundayPolicy((v as WeekendPolicy) ?? 'keep')}
              />
            </div>

            {/* Name pattern */}
            <TextInput
              label="Name Pattern"
              description="Template for auto-generated period names"
              value={namePattern}
              onChange={(e) => setNamePattern(e.currentTarget.value)}
            />

            {/* Pattern variables */}
            <div>
              <Text fz="xs" c="dimmed" mb={4}>
                Available variables:
              </Text>
              <Group gap={4}>
                {PATTERN_VARIABLES.map((v) => (
                  <Text
                    key={v.var}
                    fz="xs"
                    ff="var(--mantine-font-family-monospace)"
                    c="dimmed"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setNamePattern((p) => `${p}${v.var}`)}
                    title={v.desc}
                  >
                    {v.var}
                  </Text>
                ))}
              </Group>
            </div>

            {/* Preview */}
            <div className={classes.patternPreview}>
              <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
                Preview
              </Text>
              <Text fz="sm" ff="var(--mantine-font-family-monospace)">
                {patternPreview}
              </Text>
            </div>

            {/* Summary */}
            <Text fz="xs" c="dimmed">
              {generateAhead} periods prepared ·{' '}
              {durationUnit === 'months' ? 'Monthly' : `Every ${periodDuration} ${durationUnit}`},{' '}
              {recurrenceMethod === 'dayOfMonth'
                ? `${ordinal(Number(startDay))} of month`
                : recurrenceMethod === 'businessDay'
                  ? `${ordinal(Number(startDay))} business day`
                  : `day of week`}
            </Text>
          </>
        )}

        {/* Submit */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Save Rules
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}

function RecurrenceOption({
  value,
  label,
  description,
  selected,
  onChange,
}: {
  value: RecurrenceMethod;
  label: string;
  description: string;
  selected: RecurrenceMethod;
  onChange: (v: RecurrenceMethod) => void;
}) {
  const isActive = selected === value;

  return (
    <div
      className={isActive ? classes.recurrenceOptionActive : classes.recurrenceOption}
      onClick={() => onChange(value)}
      role="radio"
      aria-checked={isActive}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange(value);
        }
      }}
    >
      <Radio checked={isActive} onChange={() => onChange(value)} tabIndex={-1} />
      <div className={classes.recurrenceInfo}>
        <Text fz="sm" fw={500}>
          {label}
        </Text>
        <Text fz="xs" c="dimmed">
          {description}
        </Text>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
