import { AreaChart } from '@mantine/charts';
import type { components } from '@/api/v2';
import { useV2Theme } from '@/theme/v2';

type HistoryPoint = components['schemas']['AccountBalanceHistoryPoint'];

interface AccountSparklineProps {
  history?: HistoryPoint[];
  /** Account name used for the accessible aria-label. */
  acctName?: string;
}

export function AccountSparkline({ history, acctName }: AccountSparklineProps) {
  const { accents } = useV2Theme();

  if (!history || history.length < 2) {
    return null;
  }

  const data = history.map((p) => ({ day: p.date, value: p.balance }));
  const label = acctName ? `Balance history for ${acctName}` : 'Balance history';

  return (
    <div data-testid="account-sparkline" role="img" aria-label={label}>
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
