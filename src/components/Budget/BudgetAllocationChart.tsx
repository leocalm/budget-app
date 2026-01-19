import { DonutChart } from '@mantine/charts';
import { Center, Stack, Text } from '@mantine/core';

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
        valueFormatter={(value) =>
          `€${(value / 100).toLocaleString('de-DE', { minimumFractionDigits: 0 })}`
        }
      />
      <Center style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Stack gap={0} align="center">
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Total
          </Text>
          <Text fw={700} size="xl">
            €{(totalBudget / 100).toLocaleString('de-DE', { minimumFractionDigits: 0 })}
          </Text>
        </Stack>
      </Center>
    </div>
  );
}
