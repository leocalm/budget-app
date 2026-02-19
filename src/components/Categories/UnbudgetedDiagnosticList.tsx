import { useTranslation } from 'react-i18next';
import { Text } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { formatCurrency } from '@/utils/currency';
import styles from './Categories.module.css';

export interface UnbudgetedDiagnosticItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
  spentValue: number;
  sharePercentage: number;
}

interface UnbudgetedDiagnosticListProps {
  rows: UnbudgetedDiagnosticItem[];
}

export function UnbudgetedDiagnosticList({ rows }: UnbudgetedDiagnosticListProps) {
  const { t, i18n } = useTranslation();
  const currency = useDisplayCurrency();

  const sortedRows = [...rows].sort((left, right) => right.spentValue - left.spentValue);

  if (sortedRows.length === 0) {
    return (
      <Text className={styles.unbudgetedEmpty} data-testid="unbudgeted-empty-state">
        {t('categories.diagnostics.empty.unbudgeted')}
      </Text>
    );
  }

  const format = (amountInCents: number) => formatCurrency(amountInCents, currency, i18n.language);

  return (
    <div className={styles.unbudgetedList}>
      {sortedRows.map((row) => (
        <article
          key={row.id}
          className={styles.unbudgetedRow}
          data-testid={`unbudgeted-row-${row.id}`}
        >
          <Text className={styles.unbudgetedName}>{row.name}</Text>
          <div className={styles.unbudgetedValues}>
            <Text className={styles.unbudgetedAmount} component="strong">
              {format(row.spentValue)}
            </Text>
            <Text className={styles.unbudgetedShare}>{`${row.sharePercentage.toFixed(1)}%`}</Text>
          </div>
        </article>
      ))}
    </div>
  );
}
