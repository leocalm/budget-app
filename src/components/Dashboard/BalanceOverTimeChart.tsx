import { AreaChart } from '@mantine/charts';
import { Paper, Title } from '@mantine/core';

interface BudgetPerDay {
  date: string;
  balance: number;
}

interface BalanceOverTimeChartProps {
  data: BudgetPerDay[];
}

export function BalanceOverTimeChart({ data }: BalanceOverTimeChartProps) {
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
        valueFormatter={(value) => `€ ${value.toLocaleString()}`}
      />
    </Paper>
  );
}
