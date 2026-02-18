import React, { useMemo } from 'react';
import { IconAlertTriangle, IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Alert, Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { ApiError } from '@/api/errors';
import { PeriodHeaderControl } from '@/components/BudgetPeriodSelector';
import { ActiveOverlayBanner } from '@/components/Dashboard/ActiveOverlayBanner';
import { BalanceLineChartCard } from '@/components/Dashboard/BalanceLineChartCard';
import { CurrentPeriodCard } from '@/components/Dashboard/CurrentPeriodCard';
import { RecentTransactionsCard } from '@/components/Dashboard/RecentTransactionsCard';
import { StatCard } from '@/components/Dashboard/StatCard';
import { TopCategoriesChart } from '@/components/Dashboard/TopCategoriesChart';
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

  const {
    data: currentPeriod,
    error: currentPeriodError,
    isFetched: isCurrentPeriodFetched,
  } = useCurrentBudgetPeriod();
  const hasNoActivePeriod =
    isCurrentPeriodFetched &&
    !currentPeriod &&
    (currentPeriodError instanceof ApiError ? currentPeriodError.isNotFound : true);

  const { data: spentPerCategory, isLoading: isSpentPerCategoryLoading } =
    useSpentPerCategory(selectedPeriodId);
  const {
    data: monthlyBurnIn,
    isLoading: isMonthlyBurnInLoading,
    error: monthlyBurnInError,
    refetch: refetchMonthlyBurnIn,
  } = useMonthlyBurnIn(selectedPeriodId);
  const {
    data: monthProgress,
    isLoading: isMonthProgressLoading,
    error: monthProgressError,
    refetch: refetchMonthProgress,
  } = useMonthProgress(selectedPeriodId);
  const { data: budgetPerDay, isLoading: isBudgetPerDayLoading } =
    useBudgetPerDay(selectedPeriodId);
  const { data: recentTransactions } = useRecentTransactions(selectedPeriodId);
  const { data: totalAsset, isLoading: isTotalAssetLoading } = useTotalAssets();
  const { data: accounts } = useAccounts(selectedPeriodId);

  const avgDailySpend = useMemo(() => {
    if (!monthlyBurnIn || monthlyBurnIn.currentDay === 0) {
      return 0;
    }
    return monthlyBurnIn.spentBudget / monthlyBurnIn.currentDay;
  }, [monthlyBurnIn]);

  const totalAssets = totalAsset?.totalAssets || 0;
  const daysPassedPercentage = monthProgress?.daysPassedPercentage || 0;
  const daysUntilReset = monthProgress?.remainingDays || 0;
  const hasCurrentPeriodError = Boolean(monthlyBurnInError || monthProgressError);
  const isCurrentPeriodLoading =
    selectedPeriodId !== null &&
    !hasCurrentPeriodError &&
    (isMonthlyBurnInLoading || isMonthProgressLoading || !monthlyBurnIn || !monthProgress);

  const retryCurrentPeriod = () => {
    void Promise.all([refetchMonthlyBurnIn(), refetchMonthProgress()]);
  };

  // Format currency using global settings
  const format = (cents: number): string => formatCurrency(cents, globalCurrency, i18n.language);

  // Get top 5 categories
  const topCategories: SpentPerCategory[] = useMemo(() => {
    if (!spentPerCategory) {
      return [];
    }
    return spentPerCategory.slice(0, UI.DASHBOARD_TOP_CATEGORIES);
  }, [spentPerCategory]);

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

        {hasNoActivePeriod && (
          <Alert
            color="orange"
            variant="light"
            icon={<IconAlertTriangle size={18} />}
            title={t('dashboard.noPeriod.title')}
          >
            <Stack gap="md" mt="xs">
              <Text size="sm">{t('dashboard.noPeriod.message')}</Text>
              <Button component={Link} to="/periods" color="orange" variant="filled" size="sm">
                {t('dashboard.noPeriod.cta')}
              </Button>
            </Stack>
          </Alert>
        )}

        <ActiveOverlayBanner />

        <CurrentPeriodCard
          selectedPeriodId={selectedPeriodId}
          monthlyBurnIn={monthlyBurnIn}
          monthProgress={monthProgress}
          isLoading={isCurrentPeriodLoading}
          isError={hasCurrentPeriodError}
          onRetry={retryCurrentPeriod}
        />

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {/* Total Assets */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>💳</span>}
            label={t('dashboard.stats.totalAssets.label')}
            value={format(totalAssets)}
            trend={{ direction: 'up', value: '8%', positive: true }}
            loading={isTotalAssetLoading}
          />

          {/* Avg Daily Spend */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>📊</span>}
            label={t('dashboard.stats.avgDailySpend.label')}
            value={format(avgDailySpend)}
            meta={t('dashboard.stats.avgDailySpend.meta')}
            loading={isMonthlyBurnInLoading}
          />

          {/* Month Progress */}
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
          {/* Balance Line Chart */}
          <BalanceLineChartCard
            data={budgetPerDay || []}
            accounts={accounts || []}
            isLoading={isBudgetPerDayLoading}
          />

          {/* Top Categories Chart */}
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
                {t('dashboard.charts.topCategories.title')}
              </Text>
            </Group>

            <TopCategoriesChart data={topCategories} isLoading={isSpentPerCategoryLoading} />
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

          <RecentTransactionsCard data={recentTransactions || []} />
        </Paper>
      </Stack>
    </Box>
  );
};
