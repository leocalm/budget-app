import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SimpleGrid, Text } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { formatCurrencyValue } from '@/utils/currency';

interface TransactionStatsProps {
  income: number;
  expenses: number;
  balance: number;
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  type: 'income' | 'expenses' | 'net';
}

const StatCard = ({ label, value, color, type }: StatCardProps) => {
  const { i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const formattedValue = formatCurrencyValue(
    Math.abs(value),
    globalCurrency.decimalPlaces,
    i18n.language
  );
  const prefix = type === 'net' && value < 0 ? '-' : '';

  return (
    <Box
      style={{
        background: 'var(--bg-card)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border-soft)',
      }}
    >
      <Text
        style={{
          fontSize: 'var(--type-diagnostic-metric-size)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-tertiary)',
          marginBottom: 'var(--spacing-s)',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 'var(--type-reflective-secondary-size)',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          color,
        }}
      >
        {prefix}
        {globalCurrency.symbol} {formattedValue}
      </Text>
    </Box>
  );
};

export function TransactionStats({ income, expenses, balance }: TransactionStatsProps) {
  const { t } = useTranslation();
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
      <StatCard
        label={t('transactions.stats.totalIncome')}
        value={income}
        color="var(--mantine-color-green-6)"
        type="income"
      />
      <StatCard
        label={t('transactions.stats.totalExpenses')}
        value={expenses}
        color="var(--mantine-color-red-6)"
        type="expenses"
      />
      <StatCard
        label={t('transactions.stats.netChange')}
        value={balance}
        color={balance < 0 ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-green-6)'}
        type="net"
      />
    </SimpleGrid>
  );
}
