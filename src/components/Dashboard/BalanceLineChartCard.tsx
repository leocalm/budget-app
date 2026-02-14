import { useTranslation } from 'react-i18next';
import { AreaChart, AreaChartSeries } from '@mantine/charts';
import { Group, Paper, Stack, Text } from '@mantine/core';
import { ChartSkeleton, EmptyState } from '@/components/Utils';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { AccountResponse } from '@/types/account';
import { BudgetPerDay } from '@/types/dashboard';
import { convertCentsToDisplay } from '@/utils/currency';
import styles from './Dashboard.module.css';

type BalanceLineChartCardProps = {
  data: BudgetPerDay[] | undefined;
  accounts: AccountResponse[] | undefined;
  isLoading?: boolean;
};

export function BalanceLineChartCard({ data, accounts, isLoading }: BalanceLineChartCardProps) {
  const { t, i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const format = (displayValue: number) => {
    // The chart data is already in display units (converted in dictData loop)
    // So we just need to format the number with the symbol
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: globalCurrency.currency,
      minimumFractionDigits: globalCurrency.decimalPlaces,
    }).format(displayValue);
  };

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
          background: 'var(--bg-card)',
          borderColor: 'var(--border-medium)',
        }}
      >
        <Stack gap="md">
          <ChartSkeleton size="lg" />
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
          background: 'var(--bg-card)',
          borderColor: 'var(--border-medium)',
        }}
      >
        <Group justify="center" h="100%">
          <EmptyState
            variant="compact"
            icon="📈"
            title={t('dashboard.charts.balanceOverTime.noData')}
            message={t('states.empty.charts.message')}
          />
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
    dictData[item.date][item.accountName] = convertCentsToDisplay(item.balance);
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
        background: 'var(--bg-card)',
        borderColor: 'var(--border-medium)',
      }}
    >
      <Group justify="space-between" mb="xl">
        <Text fw={600} size="lg">
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
        valueFormatter={(val: number) => format(val)}
        withDots={false}
        strokeWidth={2}
        fillOpacity={0.1}
        tickLine="none"
      />
    </Paper>
  );
}
