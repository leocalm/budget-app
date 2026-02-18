import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Group, Table, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { TransactionResponse } from '@/types/transaction';
import { formatCurrencyValue } from '@/utils/currency';
import { AccountBadge } from './AccountBadge';
import { ActionButtons } from './ActionButtons';
import { CategoryBadge } from './CategoryBadge';

export interface TransactionRowProps {
  transaction: TransactionResponse;
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (id: string) => void;
  onClick?: (transaction: TransactionResponse) => void;
  animationDelay?: number;
}

export const TransactionRow = ({
  transaction: t,
  onEdit,
  onDelete,
  onClick,
  animationDelay = 0,
}: TransactionRowProps) => {
  const { t: translator, i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const isTransfer = t.category.categoryType === 'Transfer';
  const isOutgoing = t.category.categoryType === 'Outgoing';
  const amountColor = isTransfer
    ? 'var(--accent-primary)'
    : isOutgoing
      ? 'var(--mantine-color-red-6)'
      : 'var(--mantine-color-green-6)';

  const prefix = isOutgoing ? '-' : isTransfer ? '' : '+';
  const formattedValue = formatCurrencyValue(t.amount, globalCurrency.decimalPlaces, i18n.language);
  const formattedAmount = `${prefix}${globalCurrency.symbol} ${formattedValue}`;

  // Mobile Layout
  if (isMobile) {
    return (
      <Box
        onClick={() => onClick?.(t)}
        style={{
          padding: 'var(--spacing-l)',
          borderBottom: '1px solid var(--border-soft)',
          cursor: onClick ? 'pointer' : 'default',
          animation: `fadeInUp 0.4s ease backwards`,
          animationDelay: `${animationDelay}s`,
        }}
      >
        {/* Top row: Description and Amount */}
        <Group justify="space-between" align="flex-start" mb="xs">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              fw={600}
              style={{
                color: 'var(--text-primary)',
                fontSize: 'var(--type-diagnostic-name-size)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t.description || (isTransfer ? 'Internal Transfer' : '-')}
            </Text>
            {t.vendor && (
              <Text
                size="sm"
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 'var(--type-diagnostic-metric-size)',
                }}
              >
                {t.vendor.name}
              </Text>
            )}
          </Box>
          <Text
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 'var(--type-reflective-label-size)',
              color: amountColor,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {formattedAmount}
          </Text>
        </Group>

        {/* Bottom row: Category, Account, and Actions */}
        <Group justify="space-between" align="center" mt="sm">
          <Group gap="xs" wrap="wrap" style={{ flex: 1 }}>
            <CategoryBadge category={t.category} />
            <AccountBadge account={t.fromAccount} />
          </Group>
          <Box style={{ opacity: 1 }}>
            <ActionButtons onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} />
          </Box>
        </Group>
      </Box>
    );
  }

  // Desktop Layout - using Table.Tr for proper HTML structure
  return (
    <Table.Tr
      onClick={() => onClick?.(t)}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        animation: `fadeInUp 0.4s ease backwards`,
        animationDelay: `${animationDelay}s`,
      }}
    >
      {/* Date */}
      <Table.Td style={{ paddingLeft: '16px' }}>
        <Text size="sm" c="dimmed">
          {new Date(t.occurredAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </Table.Td>

      {/* Description & Vendor */}
      <Table.Td style={{ paddingLeft: '16px' }}>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Text
            size="md"
            fw={600}
            style={{
              color: 'var(--text-primary)',
              fontSize: 'var(--type-diagnostic-name-size)',
            }}
          >
            {isTransfer ? translator('transactions.list.row.transferDescription') : t.description}
          </Text>
          {t.vendor && (
            <Text size="sm" c="dimmed" style={{ fontSize: 'var(--type-diagnostic-metric-size)' }}>
              {t.vendor.name}
            </Text>
          )}
        </Box>
      </Table.Td>

      {/* Category Badge */}
      <Table.Td style={{ paddingLeft: '16px' }}>
        <CategoryBadge category={t.category} />
      </Table.Td>

      {/* Account Badges */}
      <Table.Td style={{ paddingLeft: '16px' }}>
        <Group gap="xs">
          <AccountBadge account={t.fromAccount} />
          {t.toAccount && (
            <>
              <Text size="sm" c="dimmed">
                →
              </Text>
              <AccountBadge account={t.toAccount} />
            </>
          )}
        </Group>
      </Table.Td>

      {/* Amount */}
      <Table.Td style={{ paddingLeft: '16px' }}>
        <Text
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: '16px',
            color: amountColor,
            whiteSpace: 'nowrap',
            textAlign: 'right',
          }}
        >
          {formattedAmount}
        </Text>
      </Table.Td>

      {/* Actions */}
      <Table.Td style={{ paddingLeft: '16px' }}>
        <ActionButtons onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} />
      </Table.Td>
    </Table.Tr>
  );
};
