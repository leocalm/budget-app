import { useEffect, useState } from 'react';
import { Button, Center, Group, Select, SimpleGrid, Stack, Switch, Text } from '@mantine/core';
import { fetchPeriodModel, updatePeriodModel } from '@/api/settings';
import type { PeriodModelRequest, WeekendAdjustment } from '@/types/settings';
import { DayPicker } from '../DayPicker';

const DEFAULT_SCHEDULE = {
  startDay: 1,
  durationValue: 1,
  durationUnit: 'months',
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

  // Restore previously saved settings when navigating back to this step
  useEffect(() => {
    fetchPeriodModel()
      .then(({ schedule: saved }) => {
        if (saved) {
          setSchedule({
            startDay: saved.startDay,
            durationValue: saved.durationValue,
            durationUnit: saved.durationUnit,
            generateAhead: saved.generateAhead,
            saturdayAdjustment: saved.saturdayAdjustment,
            sundayAdjustment: saved.sundayAdjustment,
            namePattern: saved.namePattern,
          });
          const isNonDefault =
            saved.startDay !== DEFAULT_SCHEDULE.startDay ||
            saved.durationValue !== DEFAULT_SCHEDULE.durationValue ||
            saved.generateAhead !== DEFAULT_SCHEDULE.generateAhead ||
            saved.saturdayAdjustment !== DEFAULT_SCHEDULE.saturdayAdjustment ||
            saved.sundayAdjustment !== DEFAULT_SCHEDULE.sundayAdjustment;
          if (isNonDefault) {
            setIsCustom(true);
          }
        }
      })
      .catch(() => {
        // No period model yet — keep defaults
      });
  }, []);

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
        mode: 'automatic',
        schedule,
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
        Periods are how PiggyPulse slices your timeline for tracking. The default — monthly,
        starting on the 1st — works for most people.
      </Text>

      <Switch
        label="Customize"
        checked={isCustom}
        onChange={(e) => setIsCustom(e.currentTarget.checked)}
      />

      {isCustom && (
        <Stack gap="lg">
          {/* Row 1: Start day · Duration · Generate ahead */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" style={{ alignItems: 'stretch' }}>
            <Stack gap={6} justify="space-between">
              <Stack gap={6}>
                <Text size="sm" fw={500}>
                  Start day
                </Text>
                <Text size="xs" c="dimmed">
                  The day of the month your period begins. Capped at 28 so it exists every month.
                </Text>
              </Stack>
              <Center>
                <DayPicker value={schedule.startDay} onChange={(v) => set('startDay', v)} />
              </Center>
            </Stack>

            <Stack gap={6} justify="space-between">
              <Stack gap={6}>
                <Text size="sm" fw={500}>
                  Period length
                </Text>
                <Text size="xs" c="dimmed">
                  How many months each period spans. Most people use 1.
                </Text>
              </Stack>
              <Center>
                <DayPicker
                  value={schedule.durationValue}
                  min={1}
                  max={12}
                  onChange={(v) => set('durationValue', v)}
                />
              </Center>
            </Stack>

            <Stack gap={6} justify="space-between">
              <Stack gap={6}>
                <Text size="sm" fw={500}>
                  Periods to prepare
                </Text>
                <Text size="xs" c="dimmed">
                  How many future periods to create in advance.
                </Text>
              </Stack>
              <Center>
                <DayPicker
                  value={schedule.generateAhead}
                  min={1}
                  max={24}
                  onChange={(v) => set('generateAhead', v)}
                />
              </Center>
            </Stack>
          </SimpleGrid>

          {/* Row 2: Weekend adjustments */}
          <Stack gap={6}>
            <Text size="sm" fw={500}>
              Weekend shift
            </Text>
            <Text size="xs" c="dimmed">
              If the period start date falls on a weekend, PiggyPulse can shift it to the nearest
              weekday. This only affects when a period is recorded as starting — it does not change
              how long the period lasts.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt={4}>
              <Select
                label="If it lands on Saturday"
                data={[
                  { value: 'keep', label: 'Keep Saturday' },
                  { value: 'friday', label: 'Shift to Friday' },
                  { value: 'monday', label: 'Shift to Monday' },
                ]}
                value={schedule.saturdayAdjustment}
                onChange={(v) => set('saturdayAdjustment', (v ?? 'keep') as WeekendAdjustment)}
              />
              <Select
                label="If it lands on Sunday"
                data={[
                  { value: 'keep', label: 'Keep Sunday' },
                  { value: 'friday', label: 'Shift to Friday' },
                  { value: 'monday', label: 'Shift to Monday' },
                ]}
                value={schedule.sundayAdjustment}
                onChange={(v) => set('sundayAdjustment', (v ?? 'keep') as WeekendAdjustment)}
              />
            </SimpleGrid>
          </Stack>
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
