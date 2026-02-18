import React from 'react';
import { Button, Group, Paper, Table, Text } from '@mantine/core';
import { TransactionRow } from '@/components/Transactions';
import { TransactionResponse } from '@/types/transaction';

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
            <TransactionRow key={t.id} transaction={t} onEdit={() => {}} onDelete={() => {}} />
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
