import React from 'react';
import styles from './Accounts.module.css';

interface AccountsSummaryProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  accountCount: number;
}

export function AccountsSummary({
  totalAssets,
  totalLiabilities,
  netWorth,
  accountCount,
}: AccountsSummaryProps) {
  const formatCurrency = (value: number) => {
    const abs = Math.abs(value / 100);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2 });
    return value < 0 ? `-\u20AC ${formatted}` : `\u20AC ${formatted}`;
  };

  return (
    <div className={styles.summaryGrid}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryLabel}>Total Net Worth</div>
        <div className={`${styles.summaryValue} ${styles.summaryValueGradient}`}>
          {formatCurrency(netWorth)}
        </div>
        <div className={styles.summaryMeta}>
          Across {accountCount} account{accountCount !== 1 ? 's' : ''}
        </div>
      </div>
      <div className={styles.summaryCard}>
        <div className={styles.summaryLabel}>Total Assets</div>
        <div className={`${styles.summaryValue} ${styles.summaryValuePositive}`}>
          {formatCurrency(totalAssets)}
        </div>
        <div className={styles.summaryMeta}>Cash &amp; savings</div>
      </div>
      <div className={styles.summaryCard}>
        <div className={styles.summaryLabel}>Total Liabilities</div>
        <div className={`${styles.summaryValue} ${styles.summaryValueNegative}`}>
          {formatCurrency(totalLiabilities)}
        </div>
        <div className={styles.summaryMeta}>Credit cards &amp; debt</div>
      </div>
    </div>
  );
}
