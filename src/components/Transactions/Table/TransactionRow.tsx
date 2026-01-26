import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Group, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { TransactionResponse } from '@/types/transaction';
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
  const { t: translator } = useTranslation();

  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const isTransfer = t.category.categoryType === 'Transfer';
  const isOutgoing = t.category.categoryType === 'Outgoing';
  const amountColor = isTransfer ? '#00d4ff' : isOutgoing ? '#ff6b9d' : '#00ffa3';

  const formattedAmount = `${isOutgoing ? '-' : isTransfer ? '' : '+'}€ ${(
    t.amount / 100
  ).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // Mobile Layout
  if (isMobile) {
    return (
      <Box
        onClick={() => onClick?.(t)}
        style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
                color: '#ffffff',
                fontSize: '15px',
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
                  color: '#5a6272',
                  fontSize: '13px',
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
              fontSize: '16px',
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

  // Desktop Layout
  return (
    <Box
      onClick={() => onClick?.(t)}
      style={{
        padding: '24px 32px',
        display: 'grid',
        gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr 60px',
        gap: '24px',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        borderBottom: '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        animation: `fadeInUp 0.4s ease backwards`,
        animationDelay: `${animationDelay}s`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
        e.currentTarget.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
        const actions = e.currentTarget.querySelector('.transaction-actions') as HTMLElement;
        if (actions) {
          actions.style.opacity = '1';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderBottomColor = 'transparent';
        const actions = e.currentTarget.querySelector('.transaction-actions') as HTMLElement;
        if (actions) {
          actions.style.opacity = '0';
        }
      }}
    >
      {/* Column 1 - Description */}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <Text
          size="md"
          fw={600}
          style={{
            color: '#ffffff',
            fontSize: '15px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isTransfer ? translator('transactions.list.row.transferDescription') : t.description}
        </Text>
        {t.vendor && (
          <Text
            size="sm"
            style={{
              color: '#5a6272',
              fontSize: '13px',
            }}
          >
            {t.vendor.name}
          </Text>
        )}
      </Box>

      {/* Column 2 - Category Badge */}
      <Box style={{ minWidth: 0 }}>
        <CategoryBadge category={t.category} />
      </Box>

      {/* Column 3 - Account Badge */}
      <Box style={{ minWidth: 0 }}>
        <AccountBadge account={t.fromAccount} />
      </Box>

      {/* Column 4 - Vendor Name (hidden on smaller screens via CSS) */}
      <Box className="vendor-column" style={{ minWidth: 0 }}>
        <Text
          size="sm"
          style={{
            color: '#8892a6',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {t.vendor?.name || '-'}
        </Text>
      </Box>

      {/* Column 5 - Amount */}
      <Box style={{ textAlign: 'right', minWidth: 0 }}>
        <Text
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: '16px',
            color: amountColor,
            whiteSpace: 'nowrap',
          }}
        >
          {formattedAmount}
        </Text>
      </Box>

      {/* Column 6 - Actions */}
      <ActionButtons onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} />
    </Box>
  );
};
