import { useTranslation } from 'react-i18next';
import { DonutChart } from '@mantine/charts';
import { Center, Stack, Text } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { formatCurrency } from '@/utils/currency';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface BudgetAllocationChartProps {
  data: ChartData[];
  totalBudget: number;
}

export function BudgetAllocationChart({ data, totalBudget }: BudgetAllocationChartProps) {
  const { i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();
  const format = (cents: number) => formatCurrency(cents, globalCurrency, i18n.language);

  if (data.length === 0) {
    return (
      <Center h={200}>
        <Text c="dimmed">No budget data available</Text>
      </Center>
    );
  }

  return (
    <div style={{ position: 'relative', height: 200, display: 'flex', justifyContent: 'center' }}>
      <DonutChart
        data={data}
        size={200}
        thickness={20}
        withTooltip
        tooltipDataSource="segment"
        valueFormatter={(value) => format(value)}
      />
      <Center style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Stack gap={0} align="center">
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Total
          </Text>
          <Text fw={700} size="xl">
            {format(totalBudget)}
          </Text>
        </Stack>
      </Center>
    </div>
  );
}
