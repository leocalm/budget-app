import { AreaChart } from '@mantine/charts';
import { useV2Theme } from '@/theme/v2';

interface NetPositionSparklineProps {
  /** Current net position in cents */
  total: number;
  /** Change this period in cents */
  change: number;
}

/**
 * Simplified sparkline — generates synthetic trend from period change.
 * Will be replaced with real daily snapshots when the API supports it.
 */
export function NetPositionSparkline({ total, change }: NetPositionSparklineProps) {
  const { accents } = useV2Theme();

  const start = total - change;
  const points = 10;
  const data = Array.from({ length: points }, (_, i) => ({
    day: i,
    value: start + (change * i) / (points - 1),
  }));

  return (
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
      data-testid="net-position-sparkline"
    />
  );
}
