import React from 'react';
import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';

interface AccountsSummaryProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export function AccountsSummary({ totalAssets, totalLiabilities, netWorth }: AccountsSummaryProps) {
  const stats = [
    {
      label: 'Total Assets',
      value: totalAssets,
      icon: () => <span>🪙</span>,
      color: 'green',
    },
    {
      label: 'Total Liabilities',
      value: totalLiabilities,
      icon: () => <span>💳</span>,
      color: 'red',
    },
    {
      label: 'Net Worth',
      value: netWorth,
      icon: () => <span>⚖️</span>,
      color: netWorth >= 0 ? 'blue' : 'orange',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      {stats.map((stat) => (
        <Paper key={stat.label} withBorder p="md" radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" tt="uppercase" fw={700} size="xs">
                {stat.label}
              </Text>
              <Text
                fw={700}
                size="xl"
                style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}
              >
                € {Math.abs(stat.value / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </div>
            <ThemeIcon color={stat.color} variant="light" size={38} radius="md">
              <stat.icon />
            </ThemeIcon>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
