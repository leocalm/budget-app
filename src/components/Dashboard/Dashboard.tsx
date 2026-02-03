import React, { useMemo } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { BalanceLineChartCard } from '@/components/Dashboard/BalanceLineChartCard';
import { RecentTransactionsCard } from '@/components/Dashboard/RecentTransactionsCard';
import { StatCard } from '@/components/Dashboard/StatCard';
import { TopCategoriesChart } from '@/components/Dashboard/TopCategoriesChart';
import { useAccounts } from '@/hooks/useAccounts';
import { useDashboardData } from '@/hooks/useDashboard';
import { SpentPerCategory } from '@/types/dashboard';
import { convertCentsToDisplay } from '@/utils/currency';
import styles from './Dashboard.module.css';

interface DashboardProps {
  selectedPeriodId: string | null;
}

export const Dashboard = ({ selectedPeriodId }: DashboardProps) => {
  const { t } = useTranslation();
  const { data: dashboardData, isLoading } = useDashboardData(selectedPeriodId);
  const { data: accounts } = useAccounts();

  // Calculate derived values from dashboard data
  const remainingBudget = useMemo(() => {
    if (!dashboardData?.monthlyBurnIn) {
      return 0;
    }
    return convertCentsToDisplay(
      dashboardData.monthlyBurnIn.totalBudget - dashboardData.monthlyBurnIn.spentBudget
    );
  }, [dashboardData?.monthlyBurnIn]);

  const avgDailySpend = useMemo(() => {
    if (!dashboardData?.monthlyBurnIn || dashboardData.monthlyBurnIn.currentDay === 0) {
      return 0;
    }
    return (
      convertCentsToDisplay(dashboardData.monthlyBurnIn.spentBudget) /
      dashboardData.monthlyBurnIn.currentDay
    );
  }, [dashboardData?.monthlyBurnIn]);

  const totalAssets = convertCentsToDisplay(dashboardData?.totalAsset || 0);
  const monthProgress = dashboardData?.monthProgress?.daysPassedPercentage || 0;
  const daysUntilReset = dashboardData?.monthProgress?.remainingDays || 0;
  const budgetLimit = convertCentsToDisplay(dashboardData?.monthlyBurnIn?.totalBudget || 0);

  // Format currency - € on left side
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

  // Get top 5 categories
  const topCategories: SpentPerCategory[] = useMemo(() => {
    if (!dashboardData?.spentPerCategory) {
      return [];
    }
    return dashboardData.spentPerCategory.slice(0, 5);
  }, [dashboardData?.spentPerCategory]);

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
        </Group>

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
            loading={isLoading}
          />

          {/* Total Assets */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>💳</span>}
            label={t('dashboard.stats.totalAssets.label')}
            value={formatCurrency(totalAssets)}
            trend={{ direction: 'up', value: '8%', positive: true }}
            loading={isLoading}
          />

          {/* Avg Daily Spend */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>📊</span>}
            label={t('dashboard.stats.avgDailySpend.label')}
            value={formatCurrency(avgDailySpend)}
            meta={t('dashboard.stats.avgDailySpend.meta')}
            loading={isLoading}
          />

          {/* Month Progress */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>📈</span>}
            label={t('dashboard.stats.monthProgress.label')}
            value={`${Math.round(monthProgress)}%`}
            meta={
              daysUntilReset === 1
                ? t('dashboard.stats.monthProgress.metaSingular', { days: daysUntilReset })
                : t('dashboard.stats.monthProgress.meta', { days: daysUntilReset })
            }
            loading={isLoading}
          />
        </div>

        {/* Charts Section */}
        <div className={styles.chartsSection}>
          {/* Balance Line Chart */}
          <BalanceLineChartCard
            data={dashboardData?.budgetPerDay || []}
            accounts={accounts || []}
            isLoading={isLoading}
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

            <TopCategoriesChart data={topCategories} isLoading={isLoading} />
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

          <RecentTransactionsCard data={dashboardData?.recentTransactions || []} />
        </Paper>
      </Stack>
    </Box>
  );
};
