import { AreaChart, AreaChartSeries } from '@mantine/charts';
import { Paper, Text, useMantineColorScheme } from '@mantine/core';
import { AccountResponse } from '@/types/account';
import { BudgetPerDay } from '@/types/dashboard';

type BalanceLineChartCardProps = {
  data: BudgetPerDay[] | undefined;
  accounts: AccountResponse[] | undefined;
};

export function BalanceLineChartCard({ data, accounts }: BalanceLineChartCardProps) {
  const { colorScheme } = useMantineColorScheme();

  if (!data) {
    return (
      <Paper
        shadow="md"
        radius="lg"
        p="lg"
        style={{
          background:
            colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
        }}
        h={380}
      >
        Error
      </Paper>
    );
  }

  const series: AreaChartSeries[] = [];
  accounts?.forEach((account: AccountResponse) =>
    series.push({ name: account.name, color: account.color })
  );

  const dictData: Record<string, any> = {};
  for (const item of data) {
    const newItem = { date: item.date };

    if (!dictData[item.date]) {
      dictData[item.date] = newItem;
    }
    dictData[item.date][item.accountName] = item.balance / 100;
  }
  const parsedData = Object.values(dictData);

  return (
    <Paper
      shadow="md"
      radius="lg"
      p="lg"
      style={{
        background:
          colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
      }}
      h={380}
    >
      <Text fw={600} size="lg" mb="md">
        Balance Over Time
      </Text>

      <AreaChart
        h={300}
        data={parsedData}
        dataKey="date"
        withLegend
        series={series}
        gridAxis="x"
        curveType="monotone"
        valueFormatter={(val: number) =>
          new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
        }
        withDots={false}
        strokeWidth={2}
        fillOpacity={0.1}
        tickLine="none"
      >
        {/*<ReferenceLine y={0} stroke="transparent" ifOverflow="extendDomain" />*/}
      </AreaChart>
    </Paper>
  );
}
