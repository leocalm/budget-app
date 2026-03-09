import { useTranslation } from 'react-i18next';
import { Box, Grid, Stack, Text, Title } from '@mantine/core';
import { ActiveOverlayBanner } from '@/components/Dashboard/ActiveOverlayBanner';
import { BudgetStabilityCard } from '@/components/Dashboard/BudgetStabilityCard';
import { CurrentPeriodCard } from '@/components/Dashboard/CurrentPeriodCard';
import { NetPositionCard } from '@/components/Dashboard/NetPositionCard';
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
  isResolvingPeriod?: boolean;
}

export const Dashboard = ({ selectedPeriodId, isResolvingPeriod = false }: DashboardProps) => {
  const { t, i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const isPeriodMissing = isResolvingPeriod || selectedPeriodId === null;

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
    isResolvingPeriod ||
    (selectedPeriodId !== null &&
      !hasCurrentPeriodError &&
      (isMonthlyBurnInLoading || isMonthProgressLoading || !monthlyBurnIn || !monthProgress));

  const retryCurrentPeriod = () => {
    void Promise.all([refetchMonthlyBurnIn(), refetchMonthProgress()]);
  };

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
