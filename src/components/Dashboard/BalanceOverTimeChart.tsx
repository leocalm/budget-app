import { useTranslation } from 'react-i18next';
import { AreaChart } from '@mantine/charts';
import { Paper, Title } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';

interface BudgetPerDay {
  date: string;
  balance: number;
}

interface BalanceOverTimeChartProps {
  data: BudgetPerDay[];
}

export function BalanceOverTimeChart({ data }: BalanceOverTimeChartProps) {
  const { i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  // Helper to format values
  const formatValue = (value: number) =>
    value.toLocaleString(i18n.language, {
      style: 'currency',
      currency: globalCurrency.currency,
      minimumFractionDigits: 0,
    });

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="xl">
        Balance Over Time
      </Title>
      <AreaChart
        h={300}
        data={data}
        dataKey="date"
        series={[{ name: 'balance', color: 'blue.6', label: 'Balance' }]}
        curveType="monotone"
        tickLine="y"
        gridAxis="xy"
        withYAxis={false}
        valueFormatter={(value) => formatValue(value)}
      />
    </Paper>
  );
}
