import { useTranslation } from 'react-i18next';
import { Stack } from '@mantine/core';
import { formatCurrencyValue } from '@/utils/currency';
import styles from './Budget.module.css';

interface BudgetBreakdownListProps {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  overBudget: number;
  unbudgetedCount: number;
}

export function BudgetBreakdownList({
  totalBudget,
  totalSpent,
  remaining,
  overBudget,
  unbudgetedCount,
}: BudgetBreakdownListProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="sm">
      <div className={styles.breakdownItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div className={styles.breakdownDot} style={{ backgroundColor: '#00d4ff' }} />
          <div className={styles.breakdownLabel}>{t('budget.overview.totalBudget')}</div>
        </div>
        <div className={styles.breakdownValue}>€{formatCurrencyValue(totalBudget)}</div>
      </div>

      <div className={styles.breakdownItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div className={styles.breakdownDot} style={{ backgroundColor: '#845ef7' }} />
          <div className={styles.breakdownLabel}>{t('budget.overview.allocated')}</div>
        </div>
        <div className={styles.breakdownValue}>€{formatCurrencyValue(totalBudget)}</div>
      </div>

      <div className={styles.breakdownItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div className={styles.breakdownDot} style={{ backgroundColor: '#ff6b6b' }} />
          <div className={styles.breakdownLabel}>{t('budget.overview.spent')}</div>
        </div>
        <div className={styles.breakdownValue}>€{formatCurrencyValue(totalSpent)}</div>
      </div>

      <div className={styles.breakdownItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div
            className={styles.breakdownDot}
            style={{ backgroundColor: remaining >= 0 ? '#51cf66' : '#ff6b6b' }}
          />
          <div className={styles.breakdownLabel}>
            {remaining >= 0 ? t('budget.overview.remaining') : t('budget.overview.overBudget')}
          </div>
        </div>
        <div className={styles.breakdownValue}>
          €{formatCurrencyValue(remaining >= 0 ? remaining : overBudget)}
        </div>
      </div>

      {unbudgetedCount > 0 && (
        <div className={styles.breakdownItem}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div className={styles.breakdownDot} style={{ backgroundColor: '#ffd43b' }} />
            <div className={styles.breakdownLabel}>
              {t('budget.overview.unbudgeted', { count: unbudgetedCount })}
            </div>
          </div>
        </div>
      )}
    </Stack>
  );
}
