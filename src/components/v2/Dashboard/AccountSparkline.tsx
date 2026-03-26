import { AreaChart } from '@mantine/charts';
import type { components } from '@/api/v2';
import { useV2Theme } from '@/theme/v2';

type HistoryPoint = components['schemas']['AccountBalanceHistoryPoint'];

interface AccountSparklineProps {
  history?: HistoryPoint[];
}

export function AccountSparkline({ history }: AccountSparklineProps) {
  const { accents } = useV2Theme();

  if (!history || history.length < 2) {
    return null;
  }

  const data = history.map((p) => ({ day: p.date, value: p.balance }));

  return (
    <div data-testid="account-sparkline">
      <AreaChart
        h={56}
        data={data}
        dataKey="day"
        series={[{ name: 'value', color: accents.tertiary }]}
        gridAxis="none"
        withXAxis={false}
        withYAxis={false}
        withDots={false}
        withTooltip={false}
        strokeWidth={1.5}
        fillOpacity={0.1}
        curveType="monotone"
      />
    </div>
  );
}
