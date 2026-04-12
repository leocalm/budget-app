import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const WEEKEND_POLICY_KEYS = [
  { value: 'keep', labelKey: 'periods.schedule.keepAsIs' },
  { value: 'monday', labelKey: 'periods.schedule.moveToMonday' },
  { value: 'friday', labelKey: 'periods.schedule.moveToFriday' },
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
  const { t } = useTranslation('v2');
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
          toast.success({ message: t('periods.schedule.disabled') });
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
          scheduleType: 'automatic' as unknown as 'UpdatePeriodScheduleRequest',
        };
        await updateMutation.mutateAsync(updateBody);
        toast.success({ message: t('periods.schedule.scheduleSaved') });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: t('periods.schedule.enabled') });
      }
      onClose();
    } catch {
      toast.error({ message: t('periods.schedule.scheduleFailed') });
    }
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('periods.schedule.title')}
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
          label={t('periods.schedule.enableLabel')}
          description={t('periods.schedule.enableDesc')}
          checked={enabled}
          onChange={(e) => setEnabled(e.currentTarget.checked)}
          size="md"
        />

        {enabled && (
          <>
            {/* Recurrence method */}
            <div>
              <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
                {t('periods.schedule.recurrenceMethod')}
              </Text>
              <Stack gap="xs" role="radiogroup" aria-label="Recurrence method">
                <RecurrenceOption
                  value="dayOfMonth"
                  label={t('periods.schedule.dayOfMonth')}
                  description={t('periods.schedule.dayOfMonthDesc')}
                  selected={recurrenceMethod}
                  onChange={setRecurrenceMethod}
                />
                <RecurrenceOption
                  value="businessDay"
                  label={t('periods.schedule.businessDay')}
                  description={t('periods.schedule.businessDayDesc')}
                  selected={recurrenceMethod}
                  onChange={setRecurrenceMethod}
                />
                <RecurrenceOption
                  value="dayOfWeek"
                  label={t('periods.schedule.dayOfWeek')}
                  description={t('periods.schedule.dayOfWeekDesc')}
                  selected={recurrenceMethod}
                  onChange={setRecurrenceMethod}
                />
              </Stack>
            </div>

            {/* Start day */}
            {recurrenceMethod === 'dayOfMonth' && (
              <NumberInput
                label={t('periods.schedule.startDayOfMonth')}
                description={t('periods.schedule.startDayOfMonthDesc')}
                value={startDay}
                onChange={setStartDay}
                min={1}
                max={31}
              />
            )}
            {recurrenceMethod === 'businessDay' && (
              <NumberInput
                label={t('periods.schedule.businessDayLabel')}
                description={t('periods.schedule.businessDayLabelDesc')}
                value={startDay}
                onChange={setStartDay}
                min={1}
                max={23}
              />
            )}
            {recurrenceMethod === 'dayOfWeek' && (
              <Select
                label={t('periods.schedule.dayOfWeekLabel')}
                data={[
                  { value: '1', label: t('periods.schedule.weekdays.monday') },
                  { value: '2', label: t('periods.schedule.weekdays.tuesday') },
                  { value: '3', label: t('periods.schedule.weekdays.wednesday') },
                  { value: '4', label: t('periods.schedule.weekdays.thursday') },
                  { value: '5', label: t('periods.schedule.weekdays.friday') },
                  { value: '6', label: t('periods.schedule.weekdays.saturday') },
                  { value: '0', label: t('periods.schedule.weekdays.sunday') },
                ]}
                value={String(startDay)}
                onChange={(v) => setStartDay(Number(v ?? 1))}
              />
            )}

            {/* Period duration */}
            <Group grow>
              <NumberInput
                label={t('periods.schedule.periodLength')}
                value={periodDuration}
                onChange={setPeriodDuration}
                min={1}
                max={366}
              />
              <Select
                label={t('periods.form.unit')}
                data={[
                  { value: 'days', label: t('periods.form.days') },
                  { value: 'weeks', label: t('periods.form.weeks') },
                  { value: 'months', label: t('periods.form.months') },
                ]}
                value={durationUnit}
                onChange={(v) => setDurationUnit((v as DurationUnit) ?? 'days')}
              />
            </Group>

            {/* Generate ahead */}
            <NumberInput
              label={t('periods.schedule.periodsToPrep')}
              description={t('periods.schedule.periodsToPrepDesc')}
              value={generateAhead}
              onChange={setGenerateAhead}
              min={1}
              max={12}
            />

            {/* Weekend policies */}
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              {t('periods.schedule.weekendHandling')}
            </Text>
            <div className={classes.weekendPolicies}>
              <Select
                label={t('periods.schedule.saturdayLabel')}
                data={WEEKEND_POLICY_KEYS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                value={saturdayPolicy}
                onChange={(v) => setSaturdayPolicy((v as WeekendPolicy) ?? 'keep')}
              />
              <Select
                label={t('periods.schedule.sundayLabel')}
                data={WEEKEND_POLICY_KEYS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                value={sundayPolicy}
                onChange={(v) => setSundayPolicy((v as WeekendPolicy) ?? 'keep')}
              />
            </div>

            {/* Name pattern */}
            <TextInput
              label={t('periods.schedule.namePattern')}
              description={t('periods.schedule.namePatternDesc')}
              value={namePattern}
              onChange={(e) => setNamePattern(e.currentTarget.value)}
            />

            {/* Pattern variables */}
            <div>
              <Text fz="xs" c="dimmed" mb={4}>
                {t('periods.schedule.availableVars')}
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
                {t('periods.schedule.preview')}
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
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {t('periods.schedule.saveRules')}
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
