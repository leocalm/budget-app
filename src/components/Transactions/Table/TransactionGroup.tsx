import React from 'react';
import { Table, Text } from '@mantine/core';
import { TransactionResponse } from '@/types/transaction';
import { TransactionRow } from './TransactionRow';

export interface TransactionGroupProps {
  date: string;
  transactions: TransactionResponse[];
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (id: string) => void;
  onClick?: (transaction: TransactionResponse) => void;
  baseAnimationDelay?: number;
}

// Format date as "January 16, 2026 • Thursday"
const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    weekday: 'long',
  };
  const formatted = date.toLocaleDateString('en-US', options);
  // Convert "Thursday, January 16, 2026" to "January 16, 2026 • Thursday"
  const parts = formatted.split(', ');
  if (parts.length === 3) {
    return `${parts[1]}, ${parts[2]} • ${parts[0]}`;
  }
  return formatted;
};

export const TransactionGroup = ({
  date,
  transactions,
  onEdit,
  onDelete,
  onClick,
  baseAnimationDelay = 0,
}: TransactionGroupProps) => {
  return (
    <>
      {/* Date Header */}
      <Table.Tr
        style={{
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <Table.Td colSpan={6} style={{ padding: '16px 16px' }}>
          <Text
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap',
            }}
          >
            {formatDateHeader(date)}
          </Text>
        </Table.Td>
      </Table.Tr>

      {/* Transaction Rows */}
      {transactions.map((transaction, index) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          animationDelay={baseAnimationDelay + index * 0.05}
        />
      ))}
    </>
  );
};

// Utility function to group transactions by date
export const groupTransactionsByDate = (
  transactions: TransactionResponse[]
): Map<string, TransactionResponse[]> => {
  const groups = new Map<string, TransactionResponse[]>();

  // Sort transactions by date (newest first)
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  for (const transaction of sorted) {
    const date = transaction.occurredAt.split('T')[0]; // Get YYYY-MM-DD part
    const existing = groups.get(date) || [];
    groups.set(date, [...existing, transaction]);
  }

  return groups;
};
