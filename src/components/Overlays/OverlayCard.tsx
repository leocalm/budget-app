import dayjs from 'dayjs';
import { IconCalendarEvent, IconClock, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Card, Group, Progress, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { Overlay } from '@/types/overlay';
import { formatCurrency } from '@/utils/currency';
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
    return 'violet';
  }

  if (status === 'upcoming') {
    return 'cyan';
  }

  return 'gray';
};

export function OverlayCard({ overlay, status, onEdit, onDelete, onView }: OverlayCardProps) {
  const { t, i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();
  const now = dayjs().startOf('day');
  const start = dayjs(overlay.startDate).startOf('day');
  const end = dayjs(overlay.endDate).startOf('day');

  const format = (cents: number) => formatCurrency(cents, globalCurrency, i18n.language);

  const icon = overlay.icon?.trim() || '🎯';
  const durationDays = Math.max(end.diff(start, 'day') + 1, 1);
  const spentAmount = overlay.spentAmount ?? 0;
  const totalCapAmount = overlay.totalCapAmount ?? null;
  const transactionCount = overlay.transactionCount ?? 0;

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
    <Card
      withBorder
      radius="lg"
      className={`${classes.card} ${status === 'active' ? classes.active : ''} ${isOverCap ? classes.overspent : ''} ${status === 'past' ? classes.past : ''}`}
    >
      {/* Zone 1: Header */}
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md" mb="sm">
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
              {dayjs(overlay.startDate).format('MMM D')} – {dayjs(overlay.endDate).format('MMM D')}{' '}
              · {t('overlays.card.duration', { count: durationDays })}
            </Text>
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

      {/* Zone 2: Progress (only when totalCapAmount exists) */}
      {totalCapAmount !== null && (
        <Stack gap={4} mb="sm">
          <Group justify="space-between" align="baseline">
            <Text className={classes.amount}>
              <CurrencyValue cents={spentAmount} />
            </Text>
            <Text size="xs" c="dimmed">
              {t('overlays.card.of', { cap: format(totalCapAmount) })}
            </Text>
          </Group>
          <Progress
            value={progressValue}
            color={isOverCap ? 'red' : 'violet'}
            size="sm"
            radius="xl"
          />
          <Text size="xs" c={isOverCap ? 'red' : 'dimmed'}>
            {isOverCap
              ? t('overlays.card.overBy', { amount: format(spentAmount - totalCapAmount) })
              : t('overlays.card.remaining', { amount: format(totalCapAmount - spentAmount) })}
          </Text>
        </Stack>
      )}

      {/* Zone 3: Footer */}
      <Group className={classes.footer} justify="space-between" align="center">
        <Group gap={6}>
          <IconClock size={14} />
          <Text size="sm" c="dimmed">
            {timingLabel}
          </Text>
        </Group>
        <Group gap="xs">
          <Badge variant="light" color={getStatusColor(status)} size="sm">
            {t(`overlays.status.${status}`)}
          </Badge>
          <Badge variant="light" size="sm">
            {t('overlays.card.transactions', { count: transactionCount })}
          </Badge>
          <Badge variant="outline" color="gray" size="sm">
            {inclusionModeLabel}
          </Badge>
        </Group>
      </Group>
    </Card>
  );
}
