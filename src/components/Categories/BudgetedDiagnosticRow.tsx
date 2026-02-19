import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Text } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { formatCurrency } from '@/utils/currency';
import { CategoryStabilityDots } from './CategoryStabilityDots';
import styles from './Categories.module.css';

const PROGRESS_OVERFLOW_CAP_PX = 40;

export interface BudgetedDiagnosticRowProps {
  id: string;
  name: string;
  icon: string;
  color?: string;
  budgetedValue: number;
  spentValue: number;
  varianceValue: number;
  progressPercentage: number;
  stabilityHistory: boolean[];
  onEdit?: () => void;
}

function normalizePercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

export function BudgetedDiagnosticRow({
  id,
  name,
  icon,
  color,
  budgetedValue,
  spentValue,
  varianceValue,
  progressPercentage,
  stabilityHistory,
  onEdit,
}: BudgetedDiagnosticRowProps) {
  const { t, i18n } = useTranslation();
  const currency = useDisplayCurrency();

  const normalizedProgress = normalizePercentage(progressPercentage);
  const progressFillWidth =
    normalizedProgress <= 100
      ? `${normalizedProgress}%`
      : `calc(100% + ${Math.min(((normalizedProgress - 100) / 100) * PROGRESS_OVERFLOW_CAP_PX, PROGRESS_OVERFLOW_CAP_PX)}px)`;

  const format = (amountInCents: number) => formatCurrency(amountInCents, currency, i18n.language);

  return (
    <article className={styles.diagnosticRow} data-testid={`budgeted-row-${id}`}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <div className={styles.diagnosticIdentity}>
          <span
            className={styles.diagnosticIcon}
            style={color ? ({ '--diagnostic-row-color': color } as CSSProperties) : undefined}
            aria-hidden="true"
          >
            {icon}
          </span>
          <Text className={styles.diagnosticName}>{name}</Text>
        </div>

        <div className={styles.diagnosticValues}>
          <div className={styles.diagnosticMetric}>
            <Text className={styles.diagnosticMetricLabel}>
              {t('categories.diagnostics.labels.budgeted')}
            </Text>
            <Text className={styles.diagnosticMetricValue}>{format(budgetedValue)}</Text>
          </div>
          <div className={styles.diagnosticMetric}>
            <Text className={styles.diagnosticMetricLabel}>
              {t('categories.diagnostics.labels.actual')}
            </Text>
            <Text className={styles.diagnosticMetricValue}>{format(spentValue)}</Text>
          </div>
          <div className={styles.diagnosticMetric}>
            <Text className={styles.diagnosticMetricLabel}>
              {t('categories.diagnostics.labels.variance')}
            </Text>
            <Text className={styles.diagnosticVarianceValue}>{format(varianceValue)}</Text>
          </div>
          {onEdit ? (
            <Button
              variant="subtle"
              size="xs"
              onClick={onEdit}
              title={t('categories.card.actions.edit')}
            >
              {t('categories.card.actions.edit')}
            </Button>
          ) : null}
        </div>
      </Group>

      <div className={styles.diagnosticProgressWrap}>
        <div className={styles.diagnosticProgressTrack}>
          <div className={styles.diagnosticProgressMarker} aria-hidden="true" />
          <div className={styles.diagnosticProgressFill} style={{ width: progressFillWidth }} />
        </div>
      </div>

      <CategoryStabilityDots history={stabilityHistory} />
    </article>
  );
}
