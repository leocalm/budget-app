import { useTranslation } from 'react-i18next';
import { Group, Paper, Progress, Text } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { MonthlyBurnIn } from '@/types/dashboard';
import { convertCentsToDisplay, formatCurrencyValue } from '@/utils/currency';

type MonthlyBurnRateProps = {
  data: MonthlyBurnIn | undefined;
};

export function MonthlyBurnRate({ data }: MonthlyBurnRateProps) {
  const { i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const format = (value: number) => {
    const formatted = formatCurrencyValue(value, globalCurrency.decimalPlaces, i18n.language);
    return `${globalCurrency.symbol}${formatted}`;
  };

  if (!data) {
    return (
      <Paper
        radius="lg"
        p="lg"
        style={{
          background: 'var(--bg-card)',
        }}
      >
        Error
      </Paper>
    );
  }

  const currentDay = data.currentDay;
  const daysInPeriod = data.daysInPeriod;

  // Calculations should ideally be done in cents then converted for display, but here we follow existing logic
  // Original logic:
  // const totalBudget = convertCentsToDisplay(data.totalBudget);
  // const spentBudget = convertCentsToDisplay(data.spentBudget);
  // const dailyBurn = spentBudget / currentDay;
  // const idealDailyBurn = totalBudget / daysInPeriod;
  // const projectedTotal = dailyBurn * daysInPeriod;

  // Let's stick to the display values for calculations since that's what was there, just format the output
  const totalBudgetDisplay = convertCentsToDisplay(data.totalBudget);
  const spentBudgetDisplay = convertCentsToDisplay(data.spentBudget);

  const dailyBurn = spentBudgetDisplay / currentDay; // actual burn per day
  const idealDailyBurn = totalBudgetDisplay / daysInPeriod; // ideal to not overspend
  const projectedTotal = dailyBurn * daysInPeriod; // projected total spending

  const burnRatePct = Math.min((dailyBurn / idealDailyBurn) * 100, 200);

  return (
    <Paper
      radius="lg"
      p="lg"
      style={{
        background: 'var(--bg-card)',
      }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={600} size="lg">
            Monthly burn rate
          </Text>

          <Text fw={700} size="xl">
            {format(dailyBurn * 100)}{' '}
            <Text span size="sm" c="dimmed">
              / day
            </Text>
          </Text>

          <Text size="sm" c="dimmed" mt="xs">
            Ideal: {format(idealDailyBurn * 100)} / day
          </Text>

          <Text size="sm" mt="xs">
            Projected end-of-month:{' '}
            <Text span fw={600}>
              {format(projectedTotal * 100)}
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
