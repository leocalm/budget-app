import React from 'react';
import { Sparkline } from '@mantine/charts';
import type { AccountResponse } from '@/types/account';
import styles from './Accounts.module.css';

interface BudgetPerDay {
  date: string;
  balance: number;
}

interface AccountCardProps {
  account: AccountResponse;
  balanceHistory: BudgetPerDay[];
  monthlySpent: number;
  transactionCount: number;
  onEdit: (account: AccountResponse) => void;
  onDelete: (id: string) => void;
  onViewDetails: (account: AccountResponse) => void;
}

const ACCOUNT_TYPE_META: Record<string, { icon: string; label: string }> = {
  CreditCard: { icon: '\uD83D\uDCB3', label: 'Credit Card' },
  Checking: { icon: '\uD83C\uDFE6', label: 'Checking' },
  Savings: { icon: '\uD83D\uDCB0', label: 'Savings' },
  Wallet: { icon: '\uD83D\uDCB3', label: 'Debit Card' },
  Allowance: { icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', label: 'Allowance' },
};

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  CreditCard: '#00d4ff',
  Checking: '#00ffa3',
  Savings: '#ffa940',
  Wallet: '#ff6b9d',
  Allowance: '#b47aff',
};

export function AccountCard({
  account,
  balanceHistory,
  monthlySpent,
  transactionCount,
  onEdit,
  onDelete,
  onViewDetails,
}: AccountCardProps) {
  const currentBalance = account.balance / 100;
  const startBalance = balanceHistory.length > 0 ? balanceHistory[0].balance / 100 : currentBalance;
  const balanceChange = currentBalance - startBalance;
  const isPositive = balanceChange >= 0;
  const isNegativeBalance = currentBalance < 0;

  const accentColor = account.color || ACCOUNT_TYPE_COLORS[account.accountType] || '#00d4ff';
  const typeMeta = ACCOUNT_TYPE_META[account.accountType] || {
    icon: '\uD83D\uDCB3',
    label: account.accountType,
  };

  const formatCurrency = (value: number) => {
    const abs = Math.abs(value);
    return abs.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const getBalanceColor = () => {
    if (isNegativeBalance) {
      return 'var(--accent-danger)';
    }
    if (currentBalance < 50) {
      return 'var(--text-secondary)';
    }
    return 'var(--accent-success)';
  };

  const balanceChangeClass = balanceChange === 0
    ? styles.balanceChangeNeutral
    : isPositive
      ? styles.balanceChangePositive
      : styles.balanceChangeNegative;

  const balanceChangeText = balanceChange === 0
    ? 'No change'
    : `${isPositive ? '\u2191' : '\u2193'} ${account.currency.symbol}${formatCurrency(Math.abs(balanceChange))} this month`;

  // Determine stats based on account type
  const isCreditCard = account.accountType === 'CreditCard';
  const hasSpendLimit = !!account.spendLimit;

  const stat1Label = isCreditCard && hasSpendLimit
    ? 'Credit Limit'
    : hasSpendLimit
      ? 'Spend Limit'
      : 'This Month';
  const stat1Value = isCreditCard && hasSpendLimit
    ? `${account.currency.symbol} ${formatCurrency(account.spendLimit! / 100)}`
    : hasSpendLimit
      ? `${account.currency.symbol} ${formatCurrency(account.spendLimit! / 100)}/mo`
      : monthlySpent !== 0
        ? `-${account.currency.symbol} ${formatCurrency(Math.abs(monthlySpent / 100))}`
        : `${account.currency.symbol} 0`;

  const stat2Label = isCreditCard && hasSpendLimit ? 'Available' : 'Transactions';
  const stat2Value = isCreditCard && hasSpendLimit
    ? `${account.currency.symbol} ${formatCurrency((account.spendLimit! - Math.abs(account.balance)) / 100)}`
    : String(transactionCount);

  return (
    <div
      className={styles.accountCard}
      style={{ '--card-accent-color': accentColor } as React.CSSProperties}
    >
      {/* Header */}
      <div className={styles.accountHeader}>
        <div className={styles.accountInfo}>
          <h3 className={styles.accountName}>
            {account.name}
            <span className={styles.accountType}>
              {typeMeta.icon} {typeMeta.label}
            </span>
          </h3>
        </div>
        <div className={styles.accountActions}>
          <button
            type="button"
            className={styles.actionIcon}
            title="Edit"
            onClick={() => onEdit(account)}
          >
            \u2699\uFE0F
          </button>
          <button
            type="button"
            className={styles.actionIcon}
            title="Delete"
            onClick={() => onDelete(account.id)}
          >
            \u22EF
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className={styles.balanceSection}>
        <div className={styles.balanceLabel}>Current Balance</div>
        <div className={styles.balanceAmount} style={{ color: getBalanceColor() }}>
          {isNegativeBalance ? '-' : ''}{account.currency.symbol} {formatCurrency(Math.abs(currentBalance))}
        </div>
        <span className={`${styles.balanceChange} ${balanceChangeClass}`}>
          {balanceChangeText}
        </span>
      </div>

      {/* Sparkline Chart */}
      <div className={styles.chartSection}>
        <div className={styles.chartContainer}>
          <Sparkline
            data={
              balanceHistory.length > 0
                ? balanceHistory.map((h) => h.balance / 100)
                : [currentBalance, currentBalance]
            }
            h={80}
            curveType="monotone"
            color={accentColor}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>{stat1Label}</div>
          <div
            className={styles.statValue}
            style={
              !isCreditCard && !hasSpendLimit && monthlySpent !== 0
                ? { color: 'var(--accent-danger)' }
                : undefined
            }
          >
            {stat1Value}
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>{stat2Label}</div>
          <div className={styles.statValue}>{stat2Value}</div>
        </div>
      </div>

      {/* Status */}
      <div className={styles.statusSection}>
        <div className={styles.statusIndicator} />
        <span className={styles.statusText}>Active</span>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button type="button" className={styles.quickActionBtn} onClick={() => onViewDetails(account)}>
          \uD83D\uDCCA View Details
        </button>
        <button type="button" className={styles.quickActionBtn} onClick={() => onViewDetails(account)}>
          {isCreditCard ? '\uD83D\uDCB3 Pay Bill' : '\uD83D\uDCB8 Transfer'}
        </button>
      </div>
    </div>
  );
}
