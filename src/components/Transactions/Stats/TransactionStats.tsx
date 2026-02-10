import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SimpleGrid, Text } from '@mantine/core';
import { convertCentsToDisplay } from '@/utils/currency';

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
  const displayValue = Math.abs(convertCentsToDisplay(value));
  const prefix = type === 'net' && value < 0 ? '-' : '';

  return (
    <Box
      style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
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
        {prefix}€ {displayValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
        color="#00ffa3"
        type="income"
      />
      <StatCard
        label={t('transactions.stats.totalExpenses')}
        value={expenses}
        color="#ff6b9d"
        type="expenses"
      />
      <StatCard
        label={t('transactions.stats.netChange')}
        value={balance}
        color="#00d4ff"
        type="net"
      />
    </SimpleGrid>
  );
}
