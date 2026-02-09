import { IconArrowNarrowDown, IconArrowNarrowUp, IconArrowsExchange } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Group, ScrollArea, Table, Text } from '@mantine/core';
import { OverlayInclusionMode, OverlayTransaction } from '@/types/overlay';
import { formatCurrencyValue } from '@/utils/currency';
import classes from './OverlayTransactionsTable.module.css';

interface OverlayTransactionsTableProps {
  transactions: OverlayTransaction[];
  pendingTransactionId: string | null;
  onInclude: (transactionId: string) => void;
  onExclude: (transactionId: string) => void;
  readOnly?: boolean;
}

const getMembershipLabel = (
  source: OverlayInclusionMode | null | undefined,
  isIncluded: boolean,
  t: (key: string) => string
) => {
  if (!isIncluded) {
    return t('overlays.detail.transactions.notIncluded');
  }

  if (source === 'rules') {
    return t('overlays.detail.transactions.autoIncludedRules');
  }

  if (source === 'all') {
    return t('overlays.detail.transactions.autoIncludedAll');
  }

  return t('overlays.detail.transactions.manuallyIncluded');
};

const getAmountAppearance = (categoryType: OverlayTransaction['category']['categoryType']) => {
  if (categoryType === 'Transfer') {
    return {
      prefix: '',
      color: 'var(--accent-primary)',
      icon: <IconArrowsExchange size={14} />,
    };
  }

  if (categoryType === 'Incoming') {
    return {
      prefix: '+',
      color: 'var(--accent-success)',
      icon: <IconArrowNarrowDown size={14} />,
    };
  }

  return {
    prefix: '-',
    color: 'var(--accent-danger)',
    icon: <IconArrowNarrowUp size={14} />,
  };
};

export function OverlayTransactionsTable({
  transactions,
  pendingTransactionId,
  onInclude,
  onExclude,
  readOnly = false,
}: OverlayTransactionsTableProps) {
  const { t } = useTranslation();

  return (
    <ScrollArea className={classes.root} type="auto">
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('overlays.detail.transactions.date')}</Table.Th>
            <Table.Th>{t('overlays.detail.transactions.description')}</Table.Th>
            <Table.Th>{t('overlays.detail.transactions.membership')}</Table.Th>
            <Table.Th>{t('overlays.detail.transactions.amount')}</Table.Th>
            <Table.Th>{t('overlays.detail.transactions.action')}</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {transactions.map((transaction) => {
            const isIncluded = transaction.membership?.isIncluded ?? false;
            const source = transaction.membership?.inclusionSource;
            const membershipLabel = getMembershipLabel(source, isIncluded, t);
            const isPending = pendingTransactionId === transaction.id;

            const appearance = getAmountAppearance(transaction.category.categoryType);

            return (
              <Table.Tr key={transaction.id}>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {new Date(transaction.occurredAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </Table.Td>

                <Table.Td>
                  <Text fw={600}>{transaction.description}</Text>
                  <Text size="sm" c="dimmed">
                    {transaction.vendor?.name ?? transaction.category.name}
                  </Text>
                </Table.Td>

                <Table.Td>
                  <Badge
                    variant="light"
                    color={
                      isIncluded ? (source && source !== 'manual' ? 'violet' : 'cyan') : 'gray'
                    }
                  >
                    {membershipLabel}
                  </Badge>
                </Table.Td>

                <Table.Td>
                  <Group gap={4} wrap="nowrap" className={classes.amountCell}>
                    <span>{appearance.icon}</span>
                    <Text className={classes.amountValue} style={{ color: appearance.color }}>
                      {appearance.prefix}€{formatCurrencyValue(transaction.amount)}
                    </Text>
                  </Group>
                </Table.Td>

                <Table.Td>
                  {!readOnly && (
                    <Button
                      size="xs"
                      variant={isIncluded ? 'light' : 'filled'}
                      color={isIncluded ? 'red' : 'cyan'}
                      onClick={() => {
                        if (isIncluded) {
                          onExclude(transaction.id);
                          return;
                        }

                        onInclude(transaction.id);
                      }}
                      loading={isPending}
                    >
                      {isIncluded
                        ? t('overlays.detail.transactions.exclude')
                        : t('overlays.detail.transactions.include')}
                    </Button>
                  )}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
