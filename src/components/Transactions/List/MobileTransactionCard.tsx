import React from 'react';
import { IconArrowRight, IconRepeat } from '@tabler/icons-react';
import { ActionIcon, Card, Group, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { TransactionResponse } from '@/types/transaction';
import { getIcon } from '@/utils/IconMap';

interface MobileTransactionCardProps {
  transaction: TransactionResponse;
}

export const MobileTransactionCard = ({ transaction }: MobileTransactionCardProps) => {
  const isTransfer = transaction.category.categoryType === 'Transfer';
  const isOutgoing = transaction.category.categoryType === 'Outgoing';
  const amountColor = isTransfer ? undefined : isOutgoing ? 'red.6' : 'green.6';
  const categoryColor = isTransfer ? undefined : isOutgoing ? 'red.4' : 'green.4';

  return (
    <Card withBorder radius="md" p="sm" mb="xs">
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <ActionIcon
            variant="light"
            color={isTransfer ? 'blue' : categoryColor}
            size="lg"
            radius="md"
          >
            {isTransfer ? <IconRepeat size={20} /> : getIcon(transaction.category.icon, 20)}
          </ActionIcon>
          <div>
            <Text size="sm" fw={700} truncate>
              {transaction.description}
            </Text>
            {isTransfer ? (
              <Group gap={4} wrap="nowrap">
                <Text size="xs" c="dimmed">
                  {transaction.fromAccount.name}
                </Text>
                <IconArrowRight size={10} />
                <Text size="xs" c="dimmed">
                  {transaction.toAccount?.name || ''}
                </Text>
              </Group>
            ) : (
              <Text size="xs" c="dimmed">
                {`${transaction.category.name} | ${transaction.vendor?.name}`}
              </Text>
            )}
            <Text size="xs" c="dimmed">
              {transaction.occurredAt}
            </Text>
          </div>
        </Group>
        <Text fw={800} size="md" style={{ fontFamily: 'monospace' }} c={amountColor}>
          <CurrencyValue
            currency={transaction.fromAccount.currency}
            value={transaction.amount / 100}
          />
        </Text>
      </Group>
    </Card>
  );
};
