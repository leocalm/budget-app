import { ActionIcon, Progress, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useExcludeCategoryTarget } from '@/hooks/v2/useCategoryTargets';
import { toast } from '@/lib/toast';
import classes from './Categories.module.css';

type TargetItem = components['schemas']['TargetItem'];

interface TargetRowProps {
  target: TargetItem;
}

export function TargetRow({ target }: TargetRowProps) {
  const excludeMutation = useExcludeCategoryTarget();

  const hasTarget = target.currentTarget != null && target.currentTarget > 0;
  const isExcluded = target.status === 'excluded';
  const spentPct =
    hasTarget && target.currentTarget! > 0
      ? Math.min(Math.round((target.spentInPeriod / target.currentTarget!) * 100), 100)
      : 0;

  const handleExclude = async () => {
    try {
      await excludeMutation.mutateAsync(target.id);
      toast.success({ message: `${target.name} excluded from targets` });
    } catch {
      toast.error({ message: 'Failed to exclude category' });
    }
  };

  return (
    <div className={classes.targetRow} style={{ opacity: isExcluded ? 0.5 : 1 }}>
      {/* Category name */}
      <div className={classes.targetInfo}>
        <Text fz="sm" fw={600} truncate>
          {target.name}
        </Text>
        {target.previousTarget != null && target.previousTarget > 0 && (
          <Text fz="xs" c="dimmed">
            Previous: <CurrencyValue cents={target.previousTarget} />
          </Text>
        )}
      </div>

      {/* Target value — view only */}
      <div className={classes.targetValue}>
        <Text fz="sm" fw={500} ff="var(--mantine-font-family-monospace)">
          {hasTarget ? <CurrencyValue cents={target.currentTarget!} /> : '—'}
        </Text>
      </div>

      {/* Actual spend */}
      <div className={classes.targetActual}>
        <Text fz="sm" ff="var(--mantine-font-family-monospace)" c="dimmed">
          <CurrencyValue cents={target.spentInPeriod} />
        </Text>
      </div>

      {/* Progress */}
      {hasTarget && (
        <div className={classes.targetProgress}>
          <Progress value={spentPct} size={6} radius="xl" color="var(--v2-primary)" />
        </div>
      )}

      {/* Exclude action */}
      {!isExcluded && (
        <div className={classes.targetActions}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={handleExclude}
            aria-label={`Exclude ${target.name}`}
            title="Exclude from targets"
          >
            <Text fz="xs">✕</Text>
          </ActionIcon>
        </div>
      )}
    </div>
  );
}
