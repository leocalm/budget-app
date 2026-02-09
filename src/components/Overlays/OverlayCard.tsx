import dayjs from 'dayjs';
import {
  IconCalendarEvent,
  IconEdit,
  IconEye,
  IconTrash,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import { Overlay } from '@/types/overlay';
import { formatCurrencyValue } from '@/utils/currency';
import classes from './OverlayCard.module.css';

export type OverlayCardStatus = 'active' | 'upcoming' | 'past';

interface OverlayCardProps {
  overlay: Overlay;
  status: OverlayCardStatus;
  onEdit?: (overlay: Overlay) => void;
  onDelete?: (overlay: Overlay) => void;
  onView?: (overlay: Overlay) => void;
}

const getStatusColor = (status: OverlayCardStatus): string => {
  if (status === 'active') {
    return 'green';
  }

  if (status === 'upcoming') {
    return 'cyan';
  }

  return 'gray';
};

export function OverlayCard({ overlay, status, onEdit, onDelete, onView }: OverlayCardProps) {
  const { t } = useTranslation();
  const now = dayjs().startOf('day');
  const start = dayjs(overlay.startDate).startOf('day');
  const end = dayjs(overlay.endDate).startOf('day');

  const icon = overlay.icon?.trim() || '🎯';
  const durationDays = Math.max(end.diff(start, 'day') + 1, 1);
  const spentAmount = overlay.spentAmount ?? 0;
  const totalCapAmount = overlay.totalCapAmount ?? null;
  const transactionCount = overlay.transactionCount ?? 0;
  const categoryCapsCount = overlay.categoryCaps?.length ?? 0;

  const spentPercentage =
    totalCapAmount && totalCapAmount > 0 ? Math.round((spentAmount / totalCapAmount) * 100) : 0;
  const progressValue = Math.min(100, Math.max(0, spentPercentage));
  const isOverCap = Boolean(totalCapAmount && spentAmount > totalCapAmount);

  const timingLabel =
    status === 'active'
      ? t('overlays.card.daysRemaining', { count: Math.max(end.diff(now, 'day') + 1, 0) })
      : status === 'upcoming'
        ? t('overlays.card.startsIn', { count: Math.max(start.diff(now, 'day'), 0) })
        : t('overlays.card.endedAgo', { count: Math.max(now.diff(end, 'day'), 0) });

  const inclusionModeLabel = t(`overlays.modes.${overlay.inclusionMode}`);

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className={`${classes.card} ${status === 'active' ? classes.active : ''} ${isOverCap ? classes.overspent : ''}`}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Stack gap={4} className={classes.mainInfo}>
          <Group gap="xs" wrap="nowrap">
            <Text className={classes.icon} aria-hidden="true">
              {icon}
            </Text>
            <Text fw={700} className={classes.name}>
              {overlay.name}
            </Text>
          </Group>

          <Group gap="xs" c="dimmed" className={classes.metaRow}>
            <IconCalendarEvent size={14} />
            <Text size="sm">
              {dayjs(overlay.startDate).format('MMM D')} - {dayjs(overlay.endDate).format('MMM D')}{' '}
              • {t('overlays.card.duration', { count: durationDays })}
            </Text>
          </Group>

          <Group gap="xs">
            <Badge variant="light" color={getStatusColor(status)}>
              {t(`overlays.status.${status}`)}
            </Badge>
            <Badge variant="outline" color="gray">
              {inclusionModeLabel}
            </Badge>
          </Group>
        </Stack>

        <Group gap={6} wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => onView?.(overlay)}
            aria-label={t('overlays.actions.view')}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => onEdit?.(overlay)}
            aria-label={t('overlays.actions.edit')}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onDelete?.(overlay)}
            aria-label={t('overlays.actions.delete')}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Stack mt="md" gap="xs">
        {totalCapAmount ? (
          <>
            <Group justify="space-between" align="center">
              <Text className={classes.amount}>
                €{formatCurrencyValue(spentAmount)} / €{formatCurrencyValue(totalCapAmount)}
              </Text>
              <Group gap={4} c={isOverCap ? 'red' : 'dimmed'}>
                <IconTrendingUp size={14} />
                <Text size="sm">{timingLabel}</Text>
              </Group>
            </Group>
            <Progress
              value={progressValue}
              color={isOverCap ? 'red' : 'cyan'}
              size="sm"
              radius="xl"
            />
            <Text size="xs" c={isOverCap ? 'red' : 'dimmed'}>
              {isOverCap
                ? t('overlays.card.overBy', {
                    amount: `€${formatCurrencyValue(spentAmount - totalCapAmount)}`,
                  })
                : t('overlays.card.remaining', {
                    amount: `€${formatCurrencyValue(totalCapAmount - spentAmount)}`,
                  })}
            </Text>
          </>
        ) : (
          <Text size="sm" c="dimmed">
            {timingLabel}
          </Text>
        )}

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('overlays.card.transactions', { count: transactionCount })}
          </Text>
          <Text size="sm" c="dimmed">
            {t('overlays.card.categoryCaps', { count: categoryCapsCount })}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
