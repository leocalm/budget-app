import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Menu, Progress, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { ConfirmDeleteModal } from '@/components/v2/ConfirmDeleteModal';
import { periodBadgeText, periodDateRange, periodProgress } from '../PeriodSelector/periodUtils';
import classes from './Periods.module.css';

type PeriodResponse = components['schemas']['PeriodResponse'];

interface PeriodCardProps {
  period: PeriodResponse;
  scheduleActive: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

export function PeriodCard({
  period,
  scheduleActive,
  onEdit,
  onDelete,
  onSelect,
}: PeriodCardProps) {
  const { t } = useTranslation('v2');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const isCurrent = period.status === 'active';
  const badgeText = periodBadgeText(period, t);
  const dateRange = periodDateRange(period);
  const progress = periodProgress(period);

  return (
    <div
      className={isCurrent ? classes.periodCardCurrent : classes.periodCard}
      data-testid={`period-card-${period.id}`}
      onClick={() => onSelect(period.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(period.id);
        }
      }}
    >
      {/* Period info */}
      <div className={classes.periodInfo}>
        <div className={classes.periodNameRow}>
          <Text fz="md" fw={600} truncate>
            {period.name}
          </Text>
          {scheduleActive && (
            <Badge size="xs" variant="light" color="var(--v2-primary)">
              Auto
            </Badge>
          )}
        </div>
        <Text fz="xs" c="dimmed">
          {dateRange} · {t('periods.days', { count: period.length })}
        </Text>
        {isCurrent && (
          <Progress
            value={progress}
            size={4}
            radius="xl"
            color="var(--v2-primary)"
            className={classes.progressBar}
          />
        )}
      </div>

      {/* Stats — only the active period is enriched under the encrypted
          API (iOS Phase 4a parity). Past/upcoming cards would show bare
          zeroes here, so hide the whole block instead of displaying
          misleading totals. */}
      {isCurrent && (
        <div className={classes.periodStats}>
          <div className={classes.periodStat}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              {t('periods.spend')}
            </Text>
            <Text fz="sm" fw={500} ff="var(--mantine-font-family-monospace)">
              {period.totalSpent > 0 ? <CurrencyValue cents={period.totalSpent} /> : '—'}
            </Text>
          </div>
          <div className={classes.periodStat}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              {t('periods.budget')}
            </Text>
            <Text fz="sm" fw={500} ff="var(--mantine-font-family-monospace)">
              {period.totalBudgeted > 0 ? <CurrencyValue cents={period.totalBudgeted} /> : '—'}
            </Text>
          </div>
          <div className={classes.periodStat}>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
              {t('periods.txns')}
            </Text>
            <Text fz="sm" fw={500} ff="var(--mantine-font-family-monospace)">
              {period.numberOfTransactions}
            </Text>
          </div>
        </div>
      )}

      {/* Badge */}
      <div className={classes.periodBadge}>
        {badgeText && (
          <Text fz="xs" c="dimmed" ff="var(--mantine-font-family-monospace)">
            {badgeText}
          </Text>
        )}
      </div>

      {/* Kebab menu */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={classes.kebabCell}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={t('periods.periodActions')}
            >
              <Text fz="lg" lh={1}>
                ⋮
              </Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => onEdit(period.id)}>{t('common.edit')}</Menu.Item>
            <Menu.Item color="red" onClick={() => setDeleteConfirmOpen(true)}>
              {t('common.delete')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <ConfirmDeleteModal
          opened={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={() => {
            setDeleteConfirmOpen(false);
            onDelete(period.id);
          }}
          entityName={period.name}
        />
      </div>
    </div>
  );
}
