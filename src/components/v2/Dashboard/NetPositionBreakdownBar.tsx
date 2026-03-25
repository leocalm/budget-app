import { Group, Text } from '@mantine/core';
import { useV2Theme } from '@/theme/v2';
import classes from './NetPositionCard.module.css';

interface NetPositionBreakdownBarProps {
  liquid: number;
  protected: number;
  debt: number;
}

export function NetPositionBreakdownBar({
  liquid,
  protected: prot,
  debt,
}: NetPositionBreakdownBarProps) {
  const { accents } = useV2Theme();
  const total = liquid + prot + debt;
  if (total === 0) {
    return null;
  }

  const liquidPct = (liquid / total) * 100;
  const protPct = (prot / total) * 100;
  const debtPct = (debt / total) * 100;

  const segments = [
    { pct: liquidPct, color: accents.secondary, label: 'Liquid' },
    { pct: protPct, color: accents.primary, label: 'Protected' },
    ...(debt > 0 ? [{ pct: debtPct, color: 'var(--v2-border)', label: 'Debt' }] : []),
  ];

  return (
    <div data-testid="net-position-breakdown-bar">
      <div className={classes.barTrack}>
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={classes.barSegment}
            style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
          />
        ))}
      </div>
      <Group justify="space-between" mt={4}>
        {segments.map((seg) => (
          <Text
            key={seg.label}
            fz={9}
            fw={600}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: '0.06em' }}
          >
            {seg.label}
          </Text>
        ))}
      </Group>
    </div>
  );
}
