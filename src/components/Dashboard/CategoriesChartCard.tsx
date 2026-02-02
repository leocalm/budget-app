import { Grid, Paper, Progress, ScrollArea, Stack, Text, Tooltip } from '@mantine/core';
import { SpentPerCategory } from '@/types/dashboard';

type CategoriesChartCardProps = {
  data: SpentPerCategory[] | undefined;
};

export function CategoriesChartCard({ data }: CategoriesChartCardProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

  const rows = data?.map((item) => {
    const tooltip = `${formatter.format(item.amountSpent / 100)} / ${formatter.format(item.budgetedValue / 100)}`;
    const percentage = 100 * (item.amountSpent / item.budgetedValue);
    const isOverBudget = percentage > 100;

    return (
      <Grid key={item.categoryName}>
        <Grid.Col span={3}>
          <Text size="xs" fw={500}>
            {item.categoryName}
          </Text>
        </Grid.Col>
        <Grid.Col span={9}>
          <Progress.Root size="xl" radius="xl">
            <Tooltip label={tooltip}>
              <Progress.Section
                value={isOverBudget ? 100 / (percentage / 100) : percentage}
                color={isOverBudget ? 'orange.4' : 'blue.5'}
              />
            </Tooltip>
            {isOverBudget && (
              <Progress.Section
                value={100 - 100 / (percentage / 100)}
                color="red.7"
                striped
                animated
              />
            )}
          </Progress.Root>
        </Grid.Col>
      </Grid>
    );
  });

  return (
    <Paper
      shadow="md"
      radius="lg"
      p="lg"
      style={{
        background: 'var(--bg-card)',
      }}
      h={380}
    >
      <Text fw={600} size="lg" mb="md">
        Top Categories
      </Text>
      <ScrollArea h={300} offsetScrollbars>
        <Stack>{rows}</Stack>
      </ScrollArea>
    </Paper>
  );
}
