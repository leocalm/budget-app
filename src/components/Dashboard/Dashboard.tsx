import { useTranslation } from 'react-i18next';
import { Box, Grid, Stack, Text, Title } from '@mantine/core';
import { ActiveOverlayBanner } from '@/components/Dashboard/ActiveOverlayBanner';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { CARD_REGISTRY } from './cardRegistry';
import styles from './Dashboard.module.css';

interface DashboardProps {
  selectedPeriodId: string | null;
  isResolvingPeriod?: boolean;
}

export const Dashboard = ({ selectedPeriodId, isResolvingPeriod = false }: DashboardProps) => {
  const { t } = useTranslation();
  const { data: layout } = useDashboardLayout();

  const effectivePeriodId = isResolvingPeriod ? null : selectedPeriodId;

  const enabledCards = layout
    ?.filter((card) => card.enabled)
    .sort((a, b) => a.position - b.position);

  return (
    <Box className={styles.dashboardRoot}>
      <Stack gap="xl" component="div">
        <Stack gap="xs" className={styles.dashboardHeader}>
          <Title order={1} className={`${styles.dashboardTitle} brand-text brand-glow`}>
            {t('dashboard.title')}
          </Title>
          <Text className={styles.dashboardSubtitle}>{t('dashboard.subtitle')}</Text>
        </Stack>

        <ActiveOverlayBanner />

        {enabledCards && (
          <Grid gutter="xl">
            {enabledCards.map((card) => {
              const def = CARD_REGISTRY[card.cardType];
              if (!def) {
                return null;
              }
              const Component = def.component;
              const span = card.size === 'full' ? 12 : { base: 12, md: 6 };
              return (
                <Grid.Col key={card.id} span={span}>
                  <Component
                    selectedPeriodId={effectivePeriodId}
                    entityId={card.entityId ?? undefined}
                    size={card.size}
                  />
                </Grid.Col>
              );
            })}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};
