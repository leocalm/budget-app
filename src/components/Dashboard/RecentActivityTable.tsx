import React from 'react';
import { Paper, Table, Text, Button, Group } from '@mantine/core';
import { TransactionResponse } from '@/types/transaction';
import { TransactionRow } from '@/components/Transactions';

interface RecentActivityTableProps {
  transactions: TransactionResponse[];
  onViewAll?: () => void;
}

export function RecentActivityTable({ transactions, onViewAll }: RecentActivityTableProps) {
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" mb="xl">
        <Text fw={700} size="lg">Recent Activity</Text>
        {onViewAll && (
          <Button 
            variant="light" 
            color="cyan" 
            size="xs" 
            rightSection={<span>➡️</span>} 
            onClick={onViewAll}
            style={{ background: 'rgba(0, 212, 255, 0.1)', color: 'var(--mantine-color-cyan-5)', border: '1px solid rgba(0, 212, 255, 0.2)' }}
          >
            View All
          </Button>
        )}
      </Group>
      
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th c="dimmed" tt="uppercase" fz="xs" fw={600} style={{ letterSpacing: 0.8 }}>Date</Table.Th>
            <Table.Th c="dimmed" tt="uppercase" fz="xs" fw={600} style={{ letterSpacing: 0.8 }}>Description / Vendor</Table.Th>
            <Table.Th c="dimmed" tt="uppercase" fz="xs" fw={600} style={{ letterSpacing: 0.8 }}>Category</Table.Th>
            <Table.Th c="dimmed" tt="uppercase" fz="xs" fw={600} style={{ letterSpacing: 0.8 }}>Account</Table.Th>
            <Table.Th c="dimmed" tt="uppercase" fz="xs" fw={600} style={{ letterSpacing: 0.8, textAlign: 'right' }}>Amount</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {transactions.map(t => (
            <TransactionRow 
              key={t.id} 
              transaction={t} 
              onEdit={() => {}} 
              onDelete={() => {}} 
            />
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}