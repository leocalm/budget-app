import { useTranslation } from 'react-i18next';
import { AreaChart, AreaChartSeries } from '@mantine/charts';
import { Group, Paper, Stack, Text } from '@mantine/core';
import { ChartSkeleton, StateRenderer } from '@/components/Utils';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { AccountResponse } from '@/types/account';
import { BudgetPerDay } from '@/types/dashboard';
import { convertCentsToDisplay } from '@/utils/currency';
import styles from './Dashboard.module.css';

type BalanceLineChartCardProps = {
  isLocked?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  data: BudgetPerDay[] | undefined;
  accounts: AccountResponse[] | undefined;
  isLoading?: boolean;
};

export function BalanceLineChartCard({
  isLocked = false,
  isError = false,
  onRetry,
  data,
  accounts,
  isLoading,
}: BalanceLineChartCardProps) {
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

  const series: AreaChartSeries[] = [];
  accounts?.forEach((account: AccountResponse) =>
    series.push({ name: account.name, color: account.color })
  );

  const dictData: Record<string, any> = {};
  for (const item of data || []) {
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
      <StateRenderer
        variant="card"
        isLocked={isLocked}
        lockMessage={t('states.locked.message.periodRequired')}
        lockAction={{ label: t('states.locked.configure'), to: '/periods' }}
        hasError={isError}
        errorMessage={t('states.error.loadFailed.message')}
        onRetry={onRetry}
        isLoading={Boolean(isLoading)}
        loadingSkeleton={
          <Stack gap="md" w="100%">
            <ChartSkeleton size="lg" />
          </Stack>
        }
        isEmpty={!data || data.length === 0}
        emptyItemsLabel={t('states.contract.items.balanceHistory')}
        emptyMessage={t('states.empty.charts.message')}
      >
        <Stack gap="xl">
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
        </Stack>
      </StateRenderer>
    </Paper>
  );
}
