import { Group, Paper, Progress, Text, useMantineColorScheme } from '@mantine/core';
import { MonthlyBurnIn } from '@/types/dashboard';

type MonthlyBurnRateProps = {
  data: MonthlyBurnIn | undefined;
};

export function MonthlyBurnRate({ data }: MonthlyBurnRateProps) {
  const { colorScheme } = useMantineColorScheme();

  if (!data) {
    return (
      <Paper
        radius="lg"
        p="lg"
        style={{
          background:
            colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
        }}
      >
        Error
      </Paper>
    );
  }

  const currentDay = data.currentDay;
  const daysInPeriod = data.daysInPeriod;
  const totalBudget = data.totalBudget / 100;
  const spentBudget = data.spentBudget / 100;

  const dailyBurn = spentBudget / currentDay; // actual burn per day
  const idealDailyBurn = totalBudget / daysInPeriod; // ideal to not overspend
  const projectedTotal = dailyBurn * daysInPeriod; // projected total spending

  const burnRatePct = Math.min((dailyBurn / idealDailyBurn) * 100, 200);

  return (
    <Paper
      radius="lg"
      p="lg"
      style={{
        background:
          colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
      }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={600} size="lg">
            Monthly burn rate
          </Text>

          <Text fw={700} size="xl">
            €{dailyBurn.toFixed(2)}{' '}
            <Text span size="sm" c="dimmed">
              / day
            </Text>
          </Text>

          <Text size="sm" c="dimmed" mt="xs">
            Ideal: €{idealDailyBurn.toFixed(2)} / day
          </Text>

          <Text size="sm" mt="xs">
            Projected end-of-month:{' '}
            <Text span fw={600}>
              €{projectedTotal.toFixed(2)}
            </Text>
          </Text>
        </div>

        <div style={{ width: 140 }}>
          <Progress
            value={burnRatePct}
            radius="xl"
            size="xl"
            striped
            color={burnRatePct > 100 ? 'red.6' : 'green.6'}
          />
          <Text mt={8} size="sm" c={burnRatePct > 100 ? 'red.6' : 'green.6'}>
            {Math.round(burnRatePct)}%
          </Text>
        </div>
      </Group>
    </Paper>
  );
}
