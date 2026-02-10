import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Table, Text, TextInput, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { TransactionResponse } from '@/types/transaction';
import { MobileTransactionCardWithActions } from '../List/MobileTransactionCardWithActions';
import { groupTransactionsByDate, TransactionGroup } from './TransactionGroup';

export interface TransactionsSectionProps {
  transactions: TransactionResponse[];
  period?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (id: string) => void;
  onClick?: (transaction: TransactionResponse) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export const TransactionsSection = ({
  transactions,
  period,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onClick,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: TransactionsSectionProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  useEffect(() => {
    if (!hasMore || isLoadingMore || !onLoadMore) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, transactions.length]);

  // Calculate cumulative animation delay
  let cumulativeDelay = 0.1;

  return (
    <Box
      style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: '32px',
          borderBottom: '1px solid var(--border-subtle)',
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
            color: 'var(--text-secondary)',
          }}
        >
          {t('transactions.section.showing', {
            count: transactions.length,
            period: period || t('transactions.section.thisPeriod'),
          })}
        </Text>

        {/* Search Box */}
        <Box
          style={{
            position: 'relative',
          }}
        >
          <TextInput
            placeholder={t('transactions.section.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            leftSection={<span style={{ color: 'var(--text-tertiary)' }}>🔍</span>}
            styles={{
              input: {
                width: '300px',
                padding: '10px 16px 10px 40px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                '&:focus': {
                  borderColor: 'var(--accent-primary)',
                  boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
                },
                '&::placeholder': {
                  color: 'var(--text-tertiary)',
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Transaction Groups */}
      {transactions.length > 0 ? (
        isMobile ? (
          // Mobile view: Stack of cards
          <Stack gap="xs" p="md">
            {Array.from(groupedTransactions.entries()).map(([date]) => {
              const groupTransactions = groupedTransactions.get(date) || [];
              return (
                <Box key={date}>
                  {/* Date header */}
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    mb="xs"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {new Date(date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      weekday: 'long',
                    })}
                  </Text>
                  {/* Cards for this date */}
                  <Stack gap="xs">
                    {groupTransactions.map((transaction) => (
                      <MobileTransactionCardWithActions
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={() => onEdit(transaction)}
                        onDelete={() => onDelete(transaction.id)}
                      />
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        ) : (
          // Desktop view: Table
          <Table verticalSpacing="sm">
            <Table.Thead
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <Table.Tr>
                <Table.Th w={110} style={{ paddingLeft: '16px' }}>
                  {t('transactions.list.date')}
                </Table.Th>
                <Table.Th style={{ paddingLeft: '16px' }}>
                  {t('transactions.list.descriptionVendor')}
                </Table.Th>
                <Table.Th w={180} style={{ paddingLeft: '16px' }}>
                  {t('transactions.list.category')}
                </Table.Th>
                <Table.Th w={250} style={{ paddingLeft: '16px' }}>
                  {t('transactions.list.accounts')}
                </Table.Th>
                <Table.Th w={120} align="right" style={{ paddingLeft: '16px' }}>
                  {t('transactions.list.amount')}
                </Table.Th>
                <Table.Th w={50} style={{ paddingLeft: '16px' }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
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
            </Table.Tbody>
          </Table>
        )
      ) : (
        /* Empty State */
        <Box
          style={{
            padding: '64px 32px',
            textAlign: 'center',
          }}
        >
          <Text style={{ fontSize: '48px', opacity: 0.5, marginBottom: '16px' }}>💳</Text>
          <Text
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            {t('transactions.section.noTransactionsFound')}
          </Text>
          <Text style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
            {t('transactions.section.adjustFilters')}
          </Text>
        </Box>
      )}

      {(hasMore || isLoadingMore) && (
        <Box
          ref={sentinelRef}
          style={{
            padding: '12px 16px 20px',
            textAlign: 'center',
          }}
        >
          <Text size="sm" c="dimmed">
            {isLoadingMore ? t('states.loading.default') : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
};
