import { AreaChart, BarChart } from '@mantine/charts';
import { Grid, Group, Paper, Select, Stack, Text, Title } from '@mantine/core';

const monthlyData = [
  { month: 'Jan', income: 4500, expenses: 3200 },
  { month: 'Feb', income: 4500, expenses: 3400 },
  { month: 'Mar', income: 4800, expenses: 3100 },
  { month: 'Apr', income: 4500, expenses: 3800 },
  { month: 'May', income: 5200, expenses: 4100 },
  { month: 'Jun', income: 4500, expenses: 3300 },
];

const categoryData = [
  { date: 'Jan', Housing: 1200, Food: 450, Transport: 200, Entertainment: 150 },
  { date: 'Feb', Housing: 1200, Food: 480, Transport: 220, Entertainment: 180 },
  { date: 'Mar', Housing: 1200, Food: 420, Transport: 180, Entertainment: 120 },
  { date: 'Apr', Housing: 1200, Food: 500, Transport: 250, Entertainment: 300 },
  { date: 'May', Housing: 1200, Food: 550, Transport: 280, Entertainment: 250 },
  { date: 'Jun', Housing: 1200, Food: 460, Transport: 210, Entertainment: 190 },
];

export function ReportsPage() {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Reports</Title>
          <Text c="dimmed">Analyze your financial performance</Text>
        </div>
        <Select
          placeholder="Select period"
          defaultValue="6m"
          data={[
            { value: '1m', label: 'Last Month' },
            { value: '3m', label: 'Last 3 Months' },
            { value: '6m', label: 'Last 6 Months' },
            { value: '1y', label: 'Last Year' },
          ]}
        />
      </Group>

      <Grid gutter="md">
        <Grid.Col span={12}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="lg">
              Income vs Expenses
            </Title>
            <BarChart
              h={300}
              data={monthlyData}
              dataKey="month"
              series={[
                { name: 'income', color: 'teal.6', label: 'Income' },
                { name: 'expenses', color: 'red.6', label: 'Expenses' },
              ]}
              tickLine="y"
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={12}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="lg">
              Spending Trends by Category
            </Title>
            <AreaChart
              h={300}
              data={categoryData}
              dataKey="date"
              series={[
                { name: 'Housing', color: 'blue.6', label: 'Housing' },
                { name: 'Food', color: 'cyan.6', label: 'Food' },
                { name: 'Transport', color: 'orange.6', label: 'Transport' },
                { name: 'Entertainment', color: 'pink.6', label: 'Entertainment' },
              ]}
              curveType="monotone"
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
