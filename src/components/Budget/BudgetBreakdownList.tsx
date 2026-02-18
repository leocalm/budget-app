import { useTranslation } from 'react-i18next';
import { Stack } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
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
          <div
            className={styles.breakdownDot}
            style={{ backgroundColor: 'var(--accent-primary)' }}
          />
          <div className={styles.breakdownLabel}>{t('budget.overview.totalBudget')}</div>
        </div>
        <div className={styles.breakdownValue}>
          <CurrencyValue cents={totalBudget} />
        </div>
      </div>

      <div className={styles.breakdownItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div
            className={styles.breakdownDot}
            style={{ backgroundColor: 'var(--accent-secondary)' }}
          />
          <div className={styles.breakdownLabel}>{t('budget.overview.allocated')}</div>
        </div>
        <div className={styles.breakdownValue}>
          <CurrencyValue cents={totalBudget} />
        </div>
      </div>

      <div className={styles.breakdownItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div
            className={styles.breakdownDot}
            style={{ backgroundColor: 'var(--text-secondary)' }}
          />
          <div className={styles.breakdownLabel}>{t('budget.overview.spent')}</div>
        </div>
        <div className={styles.breakdownValue}>
          <CurrencyValue cents={totalSpent} />
        </div>
      </div>

      <div className={styles.breakdownItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div
            className={styles.breakdownDot}
            style={{
              backgroundColor: remaining >= 0 ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          />
          <div className={styles.breakdownLabel}>
            {remaining >= 0 ? t('budget.overview.remaining') : t('budget.overview.overBudget')}
          </div>
        </div>
        <div className={styles.breakdownValue}>
          <CurrencyValue cents={remaining >= 0 ? remaining : overBudget} />
        </div>
      </div>

      {unbudgetedCount > 0 && (
        <div className={styles.breakdownItem}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div
              className={styles.breakdownDot}
              style={{ backgroundColor: 'var(--accent-secondary)' }}
            />
            <div className={styles.breakdownLabel}>
              {t('budget.overview.unbudgeted', { count: unbudgetedCount })}
            </div>
          </div>
        </div>
      )}
    </Stack>
  );
}
