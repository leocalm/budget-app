import React, { useMemo } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { ApiError } from '@/api/errors';
import { PeriodHeaderControl } from '@/components/BudgetPeriodSelector';
import { ActiveOverlayBanner } from '@/components/Dashboard/ActiveOverlayBanner';
import { BalanceLineChartCard } from '@/components/Dashboard/BalanceLineChartCard';
import { BudgetStabilityCard } from '@/components/Dashboard/BudgetStabilityCard';
import { CurrentPeriodCard } from '@/components/Dashboard/CurrentPeriodCard';
import { NetPositionCard } from '@/components/Dashboard/NetPositionCard';
import { RecentTransactionsCard } from '@/components/Dashboard/RecentTransactionsCard';
import { StatCard } from '@/components/Dashboard/StatCard';
import { TopCategoriesChart } from '@/components/Dashboard/TopCategoriesChart';
import { UI } from '@/constants';
import { useAccounts } from '@/hooks/useAccounts';
import { useCurrentBudgetPeriod } from '@/hooks/useBudget';
import {
  useBudgetPerDay,
  useBudgetStability,
  useMonthlyBurnIn,
  useMonthProgress,
  useNetPosition,
  useRecentTransactions,
  useSpentPerCategory,
} from '@/hooks/useDashboard';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { SpentPerCategory } from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import styles from './Dashboard.module.css';

interface DashboardProps {
  selectedPeriodId: string | null;
}

interface LockedDashboardCardProps {
  title: string;
  status: string;
  requirement: string;
  configureLabel: string;
}

const LockedDashboardCard = ({
  title,
  status,
  requirement,
  configureLabel,
}: LockedDashboardCardProps) => {
  const { t } = useTranslation();

  return (
    <Paper className={styles.lockedCard} radius="lg" p="xl" withBorder>
      <Stack gap="sm" className={styles.lockedCardContent}>
        <Text fw={600} size="lg">
          {title}
        </Text>
        <Text size="xs" className={styles.lockedStatus}>
          {t('dashboard.locked.statusLabel', { status })}
        </Text>
        <Text size="sm" c="dimmed">
          {requirement}
        </Text>
        <Text component={Link} to="/periods" size="sm" className={styles.lockedConfigureLink}>
          {configureLabel}
        </Text>
      </Stack>
    </Paper>
  );
};

export const Dashboard = ({ selectedPeriodId }: DashboardProps) => {
  const { t, i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const isPeriodMissing = selectedPeriodId === null;
  const {
    data: currentPeriod,
    error: currentPeriodError,
    isFetched: isCurrentPeriodFetched,
  } = useCurrentBudgetPeriod();
  const hasNoActivePeriod =
    isCurrentPeriodFetched &&
    !currentPeriod &&
    (currentPeriodError instanceof ApiError ? currentPeriodError.isNotFound : true);
  const isLocked = isPeriodMissing || hasNoActivePeriod;
  const lockedStatus = isPeriodMissing
    ? t('dashboard.locked.status.notConfigured')
    : t('dashboard.locked.status.noActivePeriod');
  const lockedRequirement = isPeriodMissing
    ? t('dashboard.locked.requirement.notConfigured')
    : t('dashboard.locked.requirement.noActivePeriod');
  const lockedConfigureLabel = t('dashboard.locked.configure');

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
  const {
    data: netPosition,
    isLoading: isNetPositionLoading,
    isError: isNetPositionError,
    refetch: refetchNetPosition,
  } = useNetPosition(selectedPeriodId);
  const {
    data: budgetStability,
    isLoading: isBudgetStabilityLoading,
    isError: isBudgetStabilityError,
    refetch: refetchBudgetStability,
  } = useBudgetStability({ enabled: !isPeriodMissing });
  const { data: accounts } = useAccounts(selectedPeriodId);

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

  const totalAssets = 0;
  const daysPassedPercentage = monthProgress?.daysPassedPercentage || 0;
  const daysUntilReset = monthProgress?.remainingDays || 0;
  const budgetLimit = monthlyBurnIn?.totalBudget || 0;
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

  if (isLocked) {
    return (
      <Box className={styles.dashboardRoot}>
        <Stack gap="xl" component="div">
          <Group justify="space-between" align="center" pb="md" className={styles.dashboardHeader}>
            <Title order={1} className={`${styles.dashboardTitle} brand-text brand-glow`}>
              {t('dashboard.title')}
            </Title>
            <PeriodHeaderControl />
          </Group>

          <div className={styles.statsGrid}>
            <LockedDashboardCard
              title={t('dashboard.stats.remainingBudget.label')}
              status={lockedStatus}
              requirement={lockedRequirement}
              configureLabel={lockedConfigureLabel}
            />
            <LockedDashboardCard
              title={t('dashboard.stats.totalAssets.label')}
              status={lockedStatus}
              requirement={lockedRequirement}
              configureLabel={lockedConfigureLabel}
            />
            <LockedDashboardCard
              title={t('dashboard.stats.avgDailySpend.label')}
              status={lockedStatus}
              requirement={lockedRequirement}
              configureLabel={lockedConfigureLabel}
            />
            <LockedDashboardCard
              title={t('dashboard.stats.monthProgress.label')}
              status={lockedStatus}
              requirement={lockedRequirement}
              configureLabel={lockedConfigureLabel}
            />
          </div>

          <div className={styles.chartsSection}>
            <LockedDashboardCard
              title={t('dashboard.charts.balanceOverTime.title')}
              status={lockedStatus}
              requirement={lockedRequirement}
              configureLabel={lockedConfigureLabel}
            />
            <LockedDashboardCard
              title={t('dashboard.charts.topCategories.title')}
              status={lockedStatus}
              requirement={lockedRequirement}
              configureLabel={lockedConfigureLabel}
            />
          </div>

          <LockedDashboardCard
            title={t('dashboard.recentActivity.title')}
            status={lockedStatus}
            requirement={lockedRequirement}
            configureLabel={lockedConfigureLabel}
          />
        </Stack>
      </Box>
    );
  }

  return (
    <Box className={styles.dashboardRoot}>
      <Stack gap="xl" component="div">
        {/* Dashboard Header */}
        <Group justify="space-between" align="center" pb="md" className={styles.dashboardHeader}>
          <Title order={1} className={`${styles.dashboardTitle} brand-text brand-glow`}>
            {t('dashboard.title')}
          </Title>
          <PeriodHeaderControl />
        </Group>

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
          {/* Remaining Budget - Featured Card */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>💰</span>}
            label={t('dashboard.stats.remainingBudget.label')}
            value={format(remainingBudget)}
            meta={t('dashboard.stats.remainingBudget.meta', { limit: format(budgetLimit) })}
            trend={{ direction: 'down', value: '12%', positive: false }}
            featured
            loading={isMonthlyBurnInLoading}
          />

          {/* Total Assets */}
          <StatCard
            icon={() => <span style={{ fontSize: 18 }}>💳</span>}
            label={t('dashboard.stats.totalAssets.label')}
            value={format(totalAssets)}
            trend={{ direction: 'up', value: '8%', positive: true }}
            loading={false}
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

        <NetPositionCard
          data={netPosition}
          isLoading={isNetPositionLoading}
          isError={isNetPositionError}
          onRetry={() => {
            void refetchNetPosition();
          }}
          currency={globalCurrency}
          locale={i18n.language}
        />

        {/* Charts Section */}
        <div className={styles.chartsSection}>
          {/* Balance Line Chart */}
          <BalanceLineChartCard
            data={budgetPerDay || []}
            accounts={accounts || []}
            isLoading={isBudgetPerDayLoading}
          />

          {/* Top Categories Chart */}
          <Stack gap="md">
            <BudgetStabilityCard
              data={budgetStability}
              isLoading={isBudgetStabilityLoading}
              isError={isBudgetStabilityError}
              onRetry={() => {
                void refetchBudgetStability();
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
              <Group justify="space-between" mb="xl">
                <Text fw={600} size="lg">
                  {t('dashboard.charts.topCategories.title')}
                </Text>
              </Group>

              <TopCategoriesChart data={topCategories} isLoading={isSpentPerCategoryLoading} />
            </Paper>
          </Stack>
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
