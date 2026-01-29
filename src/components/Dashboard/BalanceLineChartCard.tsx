import { useTranslation } from 'react-i18next';
import { AreaChart, AreaChartSeries } from '@mantine/charts';
import { Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { AccountResponse } from '@/types/account';
import { BudgetPerDay } from '@/types/dashboard';
import styles from './Dashboard.module.css';

type BalanceLineChartCardProps = {
  data: BudgetPerDay[] | undefined;
  accounts: AccountResponse[] | undefined;
  isLoading?: boolean;
};

export function BalanceLineChartCard({ data, accounts, isLoading }: BalanceLineChartCardProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Paper
        className={styles.chartCard}
        shadow="md"
        radius="lg"
        p="xl"
        withBorder
        h={400}
        style={{
          background: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-4)',
        }}
      >
        <Stack gap="md">
          <Skeleton height={24} width={200} />
          <Skeleton height={300} />
        </Stack>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper
        className={styles.chartCard}
        shadow="md"
        radius="lg"
        p="xl"
        withBorder
        h={400}
        style={{
          background: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-4)',
        }}
      >
        <Group justify="center" h="100%">
          <Text c="dimmed">
            {t('dashboard.charts.balanceOverTime.noData') || 'No data available'}
          </Text>
        </Group>
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
      className={styles.chartCard}
      shadow="md"
      radius="lg"
      p="xl"
      withBorder
      style={{
        background: 'var(--mantine-color-dark-7)',
        borderColor: 'var(--mantine-color-dark-4)',
      }}
    >
      <Group justify="space-between" mb="xl">
        <Text fw={600} size="lg" c="white">
          {t('dashboard.charts.balanceOverTime.title')}
        </Text>
        {accounts && accounts.length > 0 && (
          <Group gap="md">
            {accounts.map((account) => (
              <Group key={account.id} gap={8} styles={{ root: { fontSize: 12 } }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: account.color,
                  }}
                />
                <Text size="xs" c="var(--mantine-color-dimmed)">
                  {account.name}
                </Text>
              </Group>
            ))}
          </Group>
        )}
      </Group>

      <AreaChart
        h={280}
        data={parsedData}
        dataKey="date"
        withLegend={false}
        series={series}
        gridAxis="x"
        curveType="monotone"
        valueFormatter={(val: number) =>
          new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(val)
        }
        withDots={false}
        strokeWidth={2}
        fillOpacity={0.1}
        tickLine="none"
      />
    </Paper>
  );
}
