import React, { useMemo } from 'react';
import { Box, Text, TextInput } from '@mantine/core';
import { TransactionResponse } from '@/types/transaction';
import { groupTransactionsByDate, TransactionGroup } from './TransactionGroup';

export interface TransactionsSectionProps {
  transactions: TransactionResponse[];
  period?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (id: string) => void;
  onClick?: (transaction: TransactionResponse) => void;
}

export const TransactionsSection = ({
  transactions,
  period = 'this period',
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onClick,
}: TransactionsSectionProps) => {
  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  // Calculate cumulative animation delay
  let cumulativeDelay = 0.1;

  return (
    <Box
      style={{
        background: '#151b26',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: '32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <Text
          style={{
            fontSize: '15px',
            color: '#8892a6',
          }}
        >
          Showing{' '}
          <Text
            component="span"
            style={{
              color: '#00d4ff',
              fontWeight: 700,
            }}
          >
            {transactions.length} transactions
          </Text>{' '}
          in {period}
        </Text>

        {/* Search Box */}
        <Box
          style={{
            position: 'relative',
          }}
        >
          <TextInput
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            leftSection={<span style={{ color: '#5a6272' }}>🔍</span>}
            styles={{
              input: {
                width: '300px',
                padding: '10px 16px 10px 40px',
                background: '#1e2433',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                '&:focus': {
                  borderColor: '#00d4ff',
                  boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
                },
                '&::placeholder': {
                  color: '#5a6272',
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Transaction Groups */}
      <Box>
        {Array.from(groupedTransactions.entries()).map(([date, groupTransactions]) => {
          const currentDelay = cumulativeDelay;
          cumulativeDelay += groupTransactions.length * 0.05;

          return (
            <TransactionGroup
              key={date}
              date={date}
              transactions={groupTransactions}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onClick}
              baseAnimationDelay={currentDelay}
            />
          );
        })}

        {/* Empty State */}
        {transactions.length === 0 && (
          <Box
            style={{
              padding: '64px 32px',
              textAlign: 'center',
            }}
          >
            <Text style={{ fontSize: '48px', opacity: 0.5, marginBottom: '16px' }}>💳</Text>
            <Text style={{ fontSize: '16px', fontWeight: 600, color: '#8892a6', marginBottom: '8px' }}>
              No transactions found
            </Text>
            <Text style={{ fontSize: '14px', color: '#5a6272' }}>
              Try adjusting your filters or add a new transaction
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
