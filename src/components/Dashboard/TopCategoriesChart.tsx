import { Box, Group, Paper, Text, Title } from '@mantine/core';

interface SpentPerCategory {
  category: string;
  amount: number;
  color?: string;
  colorEnd?: string;
}

interface TopCategoriesChartProps {
  data: SpentPerCategory[];
}

export function TopCategoriesChart({ data }: TopCategoriesChartProps) {
  const maxAmount = Math.max(...data.map((d) => d.amount));

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="lg">
        Top Spending Categories
      </Title>
      <Box>
        {data.map((item) => {
          const width = (item.amount / maxAmount) * 100;
          return (
            <Group key={item.category} mb="md" align="center" wrap="nowrap">
              <Text size="sm" fw={500} w={120} truncate>
                {item.category}
              </Text>
              <div
                style={{
                  flex: 1,
                  height: 32,
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${width}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${item.color || 'var(--mantine-color-teal-5)'} 0%, ${item.colorEnd || 'var(--mantine-color-teal-3)'} 100%)`,
                    borderRadius: 4,
                    transition: 'width 1s ease-out',
                  }}
                />
              </div>
              <Text
                size="sm"
                fw={600}
                style={{
                  fontFamily: 'var(--mantine-font-family-monospace)',
                  width: 60,
                  textAlign: 'right',
                }}
                c="dimmed"
              >
                €{item.amount}
              </Text>
            </Group>
          );
        })}
      </Box>
    </Paper>
  );
}
