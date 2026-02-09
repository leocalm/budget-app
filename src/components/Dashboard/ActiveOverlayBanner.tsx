import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { IconLayersIntersect, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ActionIcon, Badge, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import { useActiveOverlays } from '@/hooks/useOverlays';
import { formatCurrencyValue } from '@/utils/currency';
import classes from './ActiveOverlayBanner.module.css';

export function ActiveOverlayBanner() {
  const { t } = useTranslation();
  const { data: activeOverlays = [] } = useActiveOverlays();
  const [dismissedOverlayId, setDismissedOverlayId] = useState<string | null>(null);

  const visibleOverlays = useMemo(
    () => activeOverlays.filter((overlay) => overlay.id !== dismissedOverlayId),
    [activeOverlays, dismissedOverlayId]
  );

  const primaryOverlay = visibleOverlays[0];

  if (!primaryOverlay) {
    return null;
  }

  const totalCap = primaryOverlay.totalCapAmount ?? null;
  const spent = primaryOverlay.spentAmount ?? 0;
  const daysLeft = Math.max(
    dayjs(primaryOverlay.endDate).diff(dayjs().startOf('day'), 'day') + 1,
    0
  );
  const hasMultiple = visibleOverlays.length > 1;

  const remainingMessage =
    totalCap && totalCap > 0
      ? spent <= totalCap
        ? t('dashboard.overlayBanner.remaining', {
            amount: `€${formatCurrencyValue(totalCap - spent)}`,
            days: daysLeft,
          })
        : t('dashboard.overlayBanner.over', {
            amount: `€${formatCurrencyValue(spent - totalCap)}`,
            days: daysLeft,
          })
      : t('dashboard.overlayBanner.noCap', { days: daysLeft });

  const progressValue =
    totalCap && totalCap > 0 ? Math.min(100, Math.max(0, Math.round((spent / totalCap) * 100))) : 0;

  return (
    <Paper
      component={Link}
      to="/overlays"
      withBorder
      radius="lg"
      p="md"
      className={classes.banner}
      data-testid="dashboard-overlay-banner"
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={2} className={classes.mainContent}>
          <Group gap="xs" wrap="nowrap">
            <IconLayersIntersect size={16} />
            <Text fw={700} className={classes.title}>
              {primaryOverlay.icon?.trim() ? `${primaryOverlay.icon.trim()} ` : ''}
              {primaryOverlay.name}
            </Text>
            {hasMultiple && (
              <Badge variant="filled" color="cyan" size="xs">
                {t('dashboard.overlayBanner.moreCount', { count: visibleOverlays.length - 1 })}
              </Badge>
            )}
          </Group>

          <Text size="sm" c="dimmed">
            {remainingMessage}
          </Text>

          {totalCap && totalCap > 0 && (
            <Progress
              value={progressValue}
              color={spent > totalCap ? 'red' : 'cyan'}
              size="sm"
              radius="xl"
            />
          )}
        </Stack>

        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={(event) => {
            event.preventDefault();
            setDismissedOverlayId(primaryOverlay.id);
          }}
          aria-label={t('dashboard.overlayBanner.dismiss')}
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
