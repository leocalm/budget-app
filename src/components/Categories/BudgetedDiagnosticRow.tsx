import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@mantine/core';
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
  icon: _icon,
  color: _color,
  budgetedValue,
  spentValue,
  varianceValue,
  progressPercentage,
  stabilityHistory,
}: BudgetedDiagnosticRowProps) {
  const { t, i18n } = useTranslation();
  const currency = useDisplayCurrency();

  const normalizedProgress = normalizePercentage(progressPercentage);
  const baseProgressWidth = `${Math.min(normalizedProgress, 100)}%`;
  const overflowProgressWidth =
    normalizedProgress <= 100
      ? '0px'
      : `${Math.min(((normalizedProgress - 100) / 100) * PROGRESS_OVERFLOW_CAP_PX, PROGRESS_OVERFLOW_CAP_PX)}px`;
  const usagePercentageLabel = `${normalizedProgress.toFixed(1)}%`;

  const format = (amountInCents: number) => formatCurrency(amountInCents, currency, i18n.language);

  return (
    <article className={styles.diagnosticRow} data-testid={`budgeted-row-${id}`}>
      <div className={styles.diagnosticMain}>
        <div>
          <Text className={styles.diagnosticName}>{name}</Text>

          <div className={styles.diagnosticProgressWrap}>
            <div className={styles.diagnosticProgressRail}>
              <div className={styles.diagnosticProgressTrack}>
                <div
                  className={styles.diagnosticProgressFill}
                  style={{ width: baseProgressWidth }}
                />
              </div>
              <div className={styles.diagnosticProgressOverflow}>
                <div
                  className={styles.diagnosticProgressFill}
                  style={
                    {
                      width: overflowProgressWidth,
                      maxWidth: `${PROGRESS_OVERFLOW_CAP_PX}px`,
                    } as CSSProperties
                  }
                />
              </div>
            </div>
          </div>

          <Text className={styles.diagnosticProjection}>
            {t('categories.diagnostics.labels.actual')}: {format(spentValue)}
          </Text>
          <CategoryStabilityDots history={stabilityHistory} />
        </div>

        <div className={styles.diagnosticMetrics}>
          <div className={styles.diagnosticMetricRow}>
            <Text className={styles.diagnosticMetricLabel}>
              {t('categories.diagnostics.labels.budgeted')}
            </Text>
            <Text className={styles.diagnosticMetricValue} component="strong">
              {format(budgetedValue)}
            </Text>
          </div>
          <div className={styles.diagnosticMetricRow}>
            <Text className={styles.diagnosticMetricLabel}>
              {t('categories.diagnostics.labels.actual')}
            </Text>
            <Text className={styles.diagnosticMetricValue} component="strong">
              {format(spentValue)}
            </Text>
          </div>
          <div className={styles.diagnosticMetricRow}>
            <Text className={styles.diagnosticMetricLabel}>
              {t('categories.diagnostics.labels.variance')}
            </Text>
            <Text className={styles.diagnosticVarianceValue} component="strong">
              {format(varianceValue)}
            </Text>
          </div>
          <div className={styles.diagnosticMetricRow}>
            <Text className={styles.diagnosticMetricLabel}>
              {t('categories.diagnostics.labels.used')}
            </Text>
            <Text className={styles.diagnosticMetricValue} component="strong">
              {usagePercentageLabel}
            </Text>
          </div>
        </div>
      </div>
    </article>
  );
}
