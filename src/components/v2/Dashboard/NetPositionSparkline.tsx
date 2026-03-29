import { AreaChart } from '@mantine/charts';
import type { components } from '@/api/v2';
import { useV2Theme } from '@/theme/v2';

type HistoryPoint = components['schemas']['NetPositionHistoryPoint'];

interface NetPositionSparklineProps {
  /** Daily net position history points */
  history?: HistoryPoint[];
  /** Fallback: current total in cents (used when history is unavailable) */
  total?: number;
  /** Fallback: change this period in cents */
  change?: number;
}

/**
 * Sparkline showing net position trend over the current period.
 * Uses real daily history when available, falls back to synthetic linear interpolation.
 */
export function NetPositionSparkline({
  history,
  total = 0,
  change = 0,
}: NetPositionSparklineProps) {
  const { accents } = useV2Theme();

  const data =
    history && history.length > 1
      ? history.map((p) => ({ day: p.date, value: p.total }))
      : generateSyntheticData(total, change);

  return (
    <div data-testid="net-position-sparkline" role="img" aria-label="Net position trend">
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

function generateSyntheticData(total: number, change: number) {
  const start = total - change;
  const points = 10;
  return Array.from({ length: points }, (_, i) => ({
    day: String(i),
    value: start + (change * i) / (points - 1),
  }));
}
