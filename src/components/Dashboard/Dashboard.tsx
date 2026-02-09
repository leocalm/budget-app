import React, { useMemo } from 'react';
import { IconAlertTriangle, IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Alert, Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { PeriodHeaderControl } from '@/components/BudgetPeriodSelector';
import { ActiveOverlayBanner } from '@/components/Dashboard/ActiveOverlayBanner';
import { BalanceLineChartCard } from '@/components/Dashboard/BalanceLineChartCard';
import { RecentTransactionsCard } from '@/components/Dashboard/RecentTransactionsCard';
import { StatCard } from '@/components/Dashboard/StatCard';
import { TopCategoriesChart } from '@/components/Dashboard/TopCategoriesChart';
import { UI } from '@/constants';
import { useAccounts } from '@/hooks/useAccounts';
import {
  useBudgetPerDay,
  useMonthlyBurnIn,
  useMonthProgress,
  useRecentTransactions,
  useSpentPerCategory,
  useTotalAssets,
} from '@/hooks/useDashboard';
import { SpentPerCategory } from '@/types/dashboard';
import { convertCentsToDisplay } from '@/utils/currency';
import styles from './Dashboard.module.css';

interface DashboardProps {
  selectedPeriodId: string | null;
}

export const Dashboard = ({ selectedPeriodId }: DashboardProps) => {
  const { t } = useTranslation();

  const isPeriodMissing = selectedPeriodId === null;

  const { data: spentPerCategory, isLoading: isSpentPerCategoryLoading } =
    useSpentPerCategory(selectedPeriodId);
  const { data: monthlyBurnIn, isLoading: isMonthlyBurnInLoading } =
    useMonthlyBurnIn(selectedPeriodId);
  const { data: monthProgress, isLoading: isMonthProgressLoading } =
    useMonthProgress(selectedPeriodId);
  const { data: budgetPerDay, isLoading: isBudgetPerDayLoading } =
    useBudgetPerDay(selectedPeriodId);
  const { data: recentTransactions } = useRecentTransactions(selectedPeriodId);
  const { data: totalAsset, isLoading: isTotalAssetLoading } = useTotalAssets();
  const { data: accounts } = useAccounts(selectedPeriodId);

  // Calculate derived values from dashboard data
  const remainingBudget = useMemo(() => {
    if (!monthlyBurnIn) {
      return 0;
    }
    return convertCentsToDisplay(monthlyBurnIn.totalBudget - monthlyBurnIn.spentBudget);
  }, [monthlyBurnIn]);

  const avgDailySpend = useMemo(() => {
    if (!monthlyBurnIn || monthlyBurnIn.currentDay === 0) {
      return 0;
    }
    return convertCentsToDisplay(monthlyBurnIn.spentBudget) / monthlyBurnIn.currentDay;
  }, [monthlyBurnIn]);

  const totalAssets = convertCentsToDisplay(totalAsset?.totalAssets || 0);
  const daysPassedPercentage = monthProgress?.daysPassedPercentage || 0;
  const daysUntilReset = monthProgress?.remainingDays || 0;
  const budgetLimit = convertCentsToDisplay(monthlyBurnIn?.totalBudget || 0);

  // Format currency - € on left side
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

  // Get top 5 categories
  const topCategories: SpentPerCategory[] = useMemo(() => {
    if (!spentPerCategory) {
      return [];
    }
    return spentPerCategory.slice(0, UI.DASHBOARD_TOP_CATEGORIES);
  }, [spentPerCategory]);

  if (isPeriodMissing) {
    return (
      <Box className={styles.noPeriodContainer}>
        <Alert
          color="orange"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title={t('dashboard.noPeriod.title')}
          className={styles.noPeriodAlert}
        >
          <Stack gap="md" mt="xs">
            <Text size="sm">{t('dashboard.noPeriod.message')}</Text>
            <Button component={Link} to="/periods" color="orange" variant="filled" size="sm">
              {t('dashboard.noPeriod.cta')}
            </Button>
          </Stack>
        </Alert>
      </Box>
    );
  }

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
          <Title order={1} className={styles.dashboardTitle}>
            Financial Dashboard
          </Title>
          <PeriodHeaderControl />
        </Group>

        <ActiveOverlayBanner />

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {/* Remaining Budget - Featured Card */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>💰</span>}
            label={t('dashboard.stats.remainingBudget.label')}
            value={formatCurrency(remainingBudget)}
            meta={t('dashboard.stats.remainingBudget.meta', { limit: formatCurrency(budgetLimit) })}
            trend={{ direction: 'down', value: '12%', positive: false }}
            featured
            loading={isMonthlyBurnInLoading}
          />

          {/* Total Assets */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>💳</span>}
            label={t('dashboard.stats.totalAssets.label')}
            value={formatCurrency(totalAssets)}
            trend={{ direction: 'up', value: '8%', positive: true }}
            loading={isTotalAssetLoading}
          />

          {/* Avg Daily Spend */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>📊</span>}
            label={t('dashboard.stats.avgDailySpend.label')}
            value={formatCurrency(avgDailySpend)}
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
