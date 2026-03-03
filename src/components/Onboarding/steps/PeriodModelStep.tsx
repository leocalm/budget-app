import { useState } from 'react';
import { Button, Group, NumberInput, Select, Stack, Switch, Text, TextInput } from '@mantine/core';
import { updatePeriodModel } from '@/api/settings';
import type { PeriodModelRequest, WeekendAdjustment } from '@/types/settings';

const DEFAULT_SCHEDULE = {
  startDay: 1,
  durationValue: 1,
  durationUnit: 'Month',
  generateAhead: 3,
  saturdayAdjustment: 'keep' as WeekendAdjustment,
  sundayAdjustment: 'keep' as WeekendAdjustment,
  namePattern: '{MONTH} {YEAR}',
};

interface Props {
  onComplete: () => void;
}
export function PeriodModelStep({ onComplete }: Props) {
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);

  function set<K extends keyof typeof DEFAULT_SCHEDULE>(
    key: K,
    value: (typeof DEFAULT_SCHEDULE)[K]
  ) {
    setSchedule((prev) => ({ ...prev, [key]: value }));
  }

  async function handleContinue() {
    setIsLoading(true);
    try {
      const payload: PeriodModelRequest = {
        periodMode: 'automatic',
        periodSchedule: schedule,
      };
      await updatePeriodModel(payload);
      onComplete();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Stack mt="lg" gap="md">
      <Text size="sm" c="dimmed">
        Monthly, starting on the 1st — the default works for most people.
      </Text>

      <Switch
        label="Customize"
        checked={isCustom}
        onChange={(e) => setIsCustom(e.currentTarget.checked)}
      />

      {isCustom && (
        <Stack gap="sm">
          <NumberInput
            label="Start day"
            min={1}
            max={28}
            value={schedule.startDay}
            onChange={(v) => set('startDay', Number(v))}
          />
          <NumberInput
            label="Duration (months)"
            min={1}
            max={12}
            value={schedule.durationValue}
            onChange={(v) => set('durationValue', Number(v))}
          />
          <NumberInput
            label="Generate ahead"
            min={1}
            max={24}
            value={schedule.generateAhead}
            onChange={(v) => set('generateAhead', Number(v))}
          />
          <Select
            label="Saturday adjustment"
            data={[
              { value: 'keep', label: 'Keep' },
              { value: 'friday', label: 'Move to Friday' },
              { value: 'monday', label: 'Move to Monday' },
            ]}
            value={schedule.saturdayAdjustment}
            onChange={(v) => set('saturdayAdjustment', (v ?? 'keep') as WeekendAdjustment)}
          />
          <Select
            label="Sunday adjustment"
            data={[
              { value: 'keep', label: 'Keep' },
              { value: 'friday', label: 'Move to Friday' },
              { value: 'monday', label: 'Move to Monday' },
            ]}
            value={schedule.sundayAdjustment}
            onChange={(v) => set('sundayAdjustment', (v ?? 'keep') as WeekendAdjustment)}
          />
          <TextInput
            label="Name pattern"
            description="Use {MONTH}, {YEAR}, {DAY}"
            value={schedule.namePattern}
            onChange={(e) => set('namePattern', e.currentTarget.value)}
          />
        </Stack>
      )}

      <Group justify="flex-end" mt="md">
        <Button onClick={handleContinue} loading={isLoading}>
          Continue
        </Button>
      </Group>
    </Stack>
  );
}
