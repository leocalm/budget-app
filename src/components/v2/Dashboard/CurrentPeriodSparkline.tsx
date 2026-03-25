import { AreaChart } from '@mantine/charts';
import type { components } from '@/api/v2';
import { useV2Theme } from '@/theme/v2';

type HistoryPoint = components['schemas']['CurrentPeriodHistoryPoint'];

interface CurrentPeriodSparklineProps {
  /** Daily spending history points */
  history?: HistoryPoint[];
  /** Fallback: total spent in cents */
  spent?: number;
  /** Fallback: days elapsed in period */
  daysElapsed?: number;
}

/**
 * Sparkline showing cumulative spending trend over the current period.
 * Uses real daily history when available, falls back to linear interpolation.
 */
export function CurrentPeriodSparkline({
  history,
  spent = 0,
  daysElapsed = 1,
}: CurrentPeriodSparklineProps) {
  const { accents } = useV2Theme();

  const data =
    history && history.length > 1
      ? history.map((p) => ({ day: p.date, value: p.cumulativeSpent }))
      : generateSyntheticData(spent, daysElapsed);

  return (
    <div data-testid="current-period-sparkline">
      <AreaChart
        h={60}
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

function generateSyntheticData(spent: number, daysElapsed: number) {
  const points = Math.max(daysElapsed, 2);
  return Array.from({ length: points }, (_, i) => ({
    day: String(i),
    value: (spent * (i + 1)) / points,
  }));
}
