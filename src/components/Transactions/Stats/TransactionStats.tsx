import React from 'react';
import { Box, SimpleGrid, Text } from '@mantine/core';

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
  const displayValue = Math.abs(value / 100);
  const prefix = type === 'net' && value < 0 ? '-' : '';

  return (
    <Box
      style={{
        background: '#151b26',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <Text
        style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#5a6272',
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
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
      <StatCard label="Total Income" value={income} color="#00ffa3" type="income" />
      <StatCard label="Total Expenses" value={expenses} color="#ff6b9d" type="expenses" />
      <StatCard label="Net Change" value={balance} color="#00d4ff" type="net" />
    </SimpleGrid>
  );
}
