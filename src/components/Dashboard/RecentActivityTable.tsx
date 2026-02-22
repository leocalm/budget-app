import React from 'react';
import { Badge, Button, Group, Paper, Table, Text } from '@mantine/core';
import { TransactionResponse } from '@/types/transaction';
import { convertCentsToDisplay } from '@/utils/currency';

interface RecentActivityTableProps {
  transactions: TransactionResponse[];
  onViewAll?: () => void;
}

export function RecentActivityTable({ transactions, onViewAll }: RecentActivityTableProps) {
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" mb="xl">
        <Text fw={700} size="lg">
          Recent Activity
        </Text>
        {onViewAll && (
          <Button
            variant="light"
            color="piggyPrimary"
            size="xs"
            rightSection={<span>➡️</span>}
            onClick={onViewAll}
            style={{
              background: 'var(--color-accent-primary-soft)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--color-accent-primary-soft-strong)',
            }}
          >
            View All
          </Button>
        )}
      </Group>

      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th c="dimmed" tt="uppercase" fz="xs" fw={600} style={{ letterSpacing: 0.8 }}>
              Date
            </Table.Th>
            <Table.Th c="dimmed" tt="uppercase" fz="xs" fw={600} style={{ letterSpacing: 0.8 }}>
              Description / Vendor
            </Table.Th>
            <Table.Th c="dimmed" tt="uppercase" fz="xs" fw={600} style={{ letterSpacing: 0.8 }}>
              Category
            </Table.Th>
            <Table.Th c="dimmed" tt="uppercase" fz="xs" fw={600} style={{ letterSpacing: 0.8 }}>
              Account
            </Table.Th>
            <Table.Th
              c="dimmed"
              tt="uppercase"
              fz="xs"
              fw={600}
              style={{ letterSpacing: 0.8, textAlign: 'right' }}
            >
              Amount
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {transactions.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td>{t.occurredAt}</Table.Td>
              <Table.Td>
                <Text size="sm">{t.description || t.vendor?.name || '-'}</Text>
              </Table.Td>
              <Table.Td>
                <Badge size="sm" color={t.category.color}>
                  {t.category.icon} {t.category.name}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{t.fromAccount.name}</Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text size="sm">{convertCentsToDisplay(t.amount)}</Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
