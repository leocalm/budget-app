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
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-medium)',
      }}
    >
      <Text
        style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-tertiary)',
          marginBottom: '8px',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: '24px',
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
        color="var(--accent-success)"
        type="income"
      />
      <StatCard
        label={t('transactions.stats.totalExpenses')}
        value={expenses}
        color="var(--accent-danger)"
        type="expenses"
      />
      <StatCard
        label={t('transactions.stats.netChange')}
        value={balance}
        color="var(--accent-primary)"
        type="net"
      />
    </SimpleGrid>
  );
}
