import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Box, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { ApiError } from '@/api/errors';
import { ActiveOverlayBanner } from '@/components/Dashboard/ActiveOverlayBanner';
import { BudgetStabilityCard } from '@/components/Dashboard/BudgetStabilityCard';
import { CurrentPeriodCard } from '@/components/Dashboard/CurrentPeriodCard';
import { NetPositionCard } from '@/components/Dashboard/NetPositionCard';
import { useCurrentBudgetPeriod } from '@/hooks/useBudget';
import {
  useBudgetStability,
  useMonthlyBurnIn,
  useMonthProgress,
  useNetPosition,
} from '@/hooks/useDashboard';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
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

  const hasCurrentPeriodError = Boolean(monthlyBurnInError || monthProgressError);
  const isCurrentPeriodLoading =
    selectedPeriodId !== null &&
    !hasCurrentPeriodError &&
    (isMonthlyBurnInLoading || isMonthProgressLoading || !monthlyBurnIn || !monthProgress);

  const retryCurrentPeriod = () => {
    void Promise.all([refetchMonthlyBurnIn(), refetchMonthProgress()]);
  };

  if (isLocked) {
    return (
      <Box className={styles.dashboardRoot}>
        <Stack gap="xl" component="div">
          <Group justify="space-between" align="center" pb="md" className={styles.dashboardHeader}>
            <Title order={1} className={`${styles.dashboardTitle} brand-text brand-glow`}>
              {t('dashboard.title')}
            </Title>
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
        <Stack gap="xs" className={styles.dashboardHeader}>
          <Title order={1} className={`${styles.dashboardTitle} brand-text brand-glow`}>
            {t('dashboard.title')}
          </Title>
          <Text className={styles.dashboardSubtitle}>{t('dashboard.subtitle')}</Text>
        </Stack>

        <ActiveOverlayBanner />

        <CurrentPeriodCard
          selectedPeriodId={selectedPeriodId}
          monthlyBurnIn={monthlyBurnIn}
          monthProgress={monthProgress}
          isLoading={isCurrentPeriodLoading}
          isError={hasCurrentPeriodError}
          onRetry={retryCurrentPeriod}
        />

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <BudgetStabilityCard
              data={budgetStability}
              isLoading={isBudgetStabilityLoading}
              isError={isBudgetStabilityError}
              onRetry={() => {
                void refetchBudgetStability();
              }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
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
          </Grid.Col>
        </Grid>
      </Stack>
    </Box>
  );
};
