import React, { useMemo } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ApiError } from '@/api/errors';
import { PeriodHeaderControl } from '@/components/BudgetPeriodSelector';
import { ActiveOverlayBanner } from '@/components/Dashboard/ActiveOverlayBanner';
import { BalanceLineChartCard } from '@/components/Dashboard/BalanceLineChartCard';
import { RecentTransactionsCard } from '@/components/Dashboard/RecentTransactionsCard';
import { StatCard } from '@/components/Dashboard/StatCard';
import { TopCategoriesChart } from '@/components/Dashboard/TopCategoriesChart';
import {
  CardSkeleton,
  ChartSkeleton,
  StateRenderer,
  TransactionListSkeleton,
} from '@/components/Utils';
import { UI } from '@/constants';
import { useAccounts } from '@/hooks/useAccounts';
import { useCurrentBudgetPeriod } from '@/hooks/useBudget';
import {
  useBudgetPerDay,
  useMonthlyBurnIn,
  useMonthProgress,
  useRecentTransactions,
  useSpentPerCategory,
  useTotalAssets,
} from '@/hooks/useDashboard';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { SpentPerCategory } from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import styles from './Dashboard.module.css';

interface DashboardProps {
  selectedPeriodId: string | null;
}

export const Dashboard = ({ selectedPeriodId }: DashboardProps) => {
  const { t, i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const isPeriodMissing = selectedPeriodId === null;
  const {
    data: currentPeriod,
    error: currentPeriodError,
    isFetched: isCurrentPeriodFetched,
    refetch: refetchCurrentPeriod,
  } = useCurrentBudgetPeriod();
  const hasNoActivePeriod =
    isCurrentPeriodFetched &&
    !currentPeriod &&
    (currentPeriodError instanceof ApiError ? currentPeriodError.isNotFound : true);

  const {
    data: spentPerCategory,
    isLoading: isSpentPerCategoryLoading,
    isError: isSpentPerCategoryError,
    refetch: refetchSpentPerCategory,
  } = useSpentPerCategory(selectedPeriodId);
  const {
    data: monthlyBurnIn,
    isLoading: isMonthlyBurnInLoading,
    isError: isMonthlyBurnInError,
    refetch: refetchMonthlyBurnIn,
  } = useMonthlyBurnIn(selectedPeriodId);
  const {
    data: monthProgress,
    isLoading: isMonthProgressLoading,
    isError: isMonthProgressError,
    refetch: refetchMonthProgress,
  } = useMonthProgress(selectedPeriodId);
  const {
    data: budgetPerDay,
    isLoading: isBudgetPerDayLoading,
    isError: isBudgetPerDayError,
    refetch: refetchBudgetPerDay,
  } = useBudgetPerDay(selectedPeriodId);
  const {
    data: recentTransactions,
    isLoading: isRecentTransactionsLoading,
    isError: isRecentTransactionsError,
    refetch: refetchRecentTransactions,
  } = useRecentTransactions(selectedPeriodId);
  const {
    data: totalAsset,
    isLoading: isTotalAssetLoading,
    isError: isTotalAssetError,
    refetch: refetchTotalAssets,
  } = useTotalAssets();
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    refetch: refetchAccounts,
  } = useAccounts(selectedPeriodId);

  // Calculate derived values from dashboard data
  const remainingBudget = useMemo(() => {
    if (!monthlyBurnIn) {
      return 0;
    }
    return monthlyBurnIn.totalBudget - monthlyBurnIn.spentBudget;
  }, [monthlyBurnIn]);

  const avgDailySpend = useMemo(() => {
    if (!monthlyBurnIn || monthlyBurnIn.currentDay === 0) {
      return 0;
    }
    return monthlyBurnIn.spentBudget / monthlyBurnIn.currentDay;
  }, [monthlyBurnIn]);

  const totalAssets = totalAsset?.totalAssets || 0;
  const daysPassedPercentage = monthProgress?.daysPassedPercentage || 0;
  const daysUntilReset = monthProgress?.remainingDays || 0;
  const budgetLimit = monthlyBurnIn?.totalBudget || 0;

  // Format currency using global settings
  const format = (cents: number): string => formatCurrency(cents, globalCurrency, i18n.language);

  // Get top 5 categories
  const topCategories: SpentPerCategory[] = useMemo(() => {
    if (!spentPerCategory) {
      return [];
    }
    return spentPerCategory.slice(0, UI.DASHBOARD_TOP_CATEGORIES);
  }, [spentPerCategory]);

  const isDashboardLocked = isPeriodMissing || hasNoActivePeriod;
  const isDashboardError =
    !isDashboardLocked &&
    (isMonthlyBurnInError ||
      isMonthProgressError ||
      isTotalAssetError ||
      isRecentTransactionsError ||
      isBudgetPerDayError ||
      isSpentPerCategoryError ||
      isAccountsError);

  const isDashboardLoading =
    !isDashboardLocked &&
    !isDashboardError &&
    (isMonthlyBurnInLoading ||
      isMonthProgressLoading ||
      isTotalAssetLoading ||
      isRecentTransactionsLoading ||
      isBudgetPerDayLoading ||
      isSpentPerCategoryLoading ||
      isAccountsLoading);

  return (
    <Box
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
      }}
    >
      <Stack gap="xl" component="div">
        {/* Dashboard Header */}
        <Group justify="space-between" align="center" pb="md" className={styles.dashboardHeader}>
          <Title order={1} className={`${styles.dashboardTitle} brand-text brand-glow`}>
            {t('dashboard.title')}
          </Title>
          <PeriodHeaderControl />
        </Group>

        <StateRenderer
          variant="page"
          isLocked={isDashboardLocked}
          lockMessage={t('dashboard.noPeriod.message')}
          lockAction={{ label: t('states.locked.configure'), to: '/periods' }}
          hasError={isDashboardError}
          errorMessage={t('states.error.loadFailed.message')}
          onRetry={() => {
            void Promise.all([
              refetchCurrentPeriod(),
              refetchMonthlyBurnIn(),
              refetchMonthProgress(),
              refetchTotalAssets(),
              refetchRecentTransactions(),
              refetchBudgetPerDay(),
              refetchSpentPerCategory(),
              refetchAccounts(),
            ]);
          }}
          isLoading={isDashboardLoading}
          loadingSkeleton={
            <Stack gap="xl" w="100%">
              <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
                {[0, 1, 2, 3].map((item) => (
                  <CardSkeleton key={item} />
                ))}
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                <ChartSkeleton size="lg" />
                <ChartSkeleton size="lg" />
              </SimpleGrid>
              <TransactionListSkeleton count={4} />
            </Stack>
          }
          isEmpty={false}
        >
          <>
            <ActiveOverlayBanner />

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <StatCard
                icon={() => <span style={{ fontSize: 18 }}>💰</span>}
                label={t('dashboard.stats.remainingBudget.label')}
                value={format(remainingBudget)}
                meta={t('dashboard.stats.remainingBudget.meta', { limit: format(budgetLimit) })}
                trend={{ direction: 'down', value: '12%', positive: false }}
                featured
                loading={isMonthlyBurnInLoading}
              />

              <StatCard
                icon={() => <span style={{ fontSize: 18 }}>💳</span>}
                label={t('dashboard.stats.totalAssets.label')}
                value={format(totalAssets)}
                trend={{ direction: 'up', value: '8%', positive: true }}
                loading={isTotalAssetLoading}
              />

              <StatCard
                icon={() => <span style={{ fontSize: 18 }}>📊</span>}
                label={t('dashboard.stats.avgDailySpend.label')}
                value={format(avgDailySpend)}
                meta={t('dashboard.stats.avgDailySpend.meta')}
                loading={isMonthlyBurnInLoading}
              />

              <StatCard
                icon={() => <span style={{ fontSize: 18 }}>📈</span>}
                label={t('dashboard.stats.monthProgress.label')}
                value={`${Math.round(daysPassedPercentage)}%`}
                meta={
                  daysUntilReset === 1
                    ? t('dashboard.stats.monthProgress.metaSingular', { days: daysUntilReset })
                    : t('dashboard.stats.monthProgress.meta', { days: daysUntilReset })
                }
                loading={isMonthProgressLoading}
              />
            </div>

            {/* Charts Section */}
            <div className={styles.chartsSection}>
              <BalanceLineChartCard
                data={budgetPerDay}
                accounts={accounts}
                isLoading={isBudgetPerDayLoading || isAccountsLoading}
                isError={isBudgetPerDayError || isAccountsError}
                onRetry={() => {
                  void Promise.all([refetchBudgetPerDay(), refetchAccounts()]);
                }}
              />

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
                <TopCategoriesChart
                  title={t('dashboard.charts.topCategories.title')}
                  data={topCategories}
                  isLoading={isSpentPerCategoryLoading}
                  isError={isSpentPerCategoryError}
                  onRetry={() => {
                    void refetchSpentPerCategory();
                  }}
                />
              </Paper>
            </div>

            {/* Recent Activity */}
            <Paper
              shadow="md"
              radius="lg"
              p="xl"
              withBorder
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-medium)',
              }}
            >
              <Group justify="space-between" mb="md">
                <Text fw={600} size="lg">
                  {t('dashboard.recentActivity.title')}
                </Text>
                <Button
                  component={Link}
                  to="/transactions"
                  variant="subtle"
                  size="xs"
                  rightSection={<IconArrowRight size={14} />}
                  className={styles.viewAllBtn}
                >
                  {t('dashboard.recentActivity.viewAll')}
                </Button>
              </Group>

              <RecentTransactionsCard
                data={recentTransactions || []}
                isLoading={isRecentTransactionsLoading}
                isError={isRecentTransactionsError}
                onRetry={() => {
                  void refetchRecentTransactions();
                }}
              />
            </Paper>
          </>
        </StateRenderer>
      </Stack>
    </Box>
  );
};
