import { useState } from 'react';
import { ActionIcon, NumberInput, Progress, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useExcludeCategoryTarget, useUpdateCategoryTarget } from '@/hooks/v2/useCategoryTargets';
import { toast } from '@/lib/toast';
import classes from './Categories.module.css';

type TargetItem = components['schemas']['TargetItem'];

interface TargetRowProps {
  target: TargetItem;
}

export function TargetRow({ target }: TargetRowProps) {
  const updateMutation = useUpdateCategoryTarget();
  const excludeMutation = useExcludeCategoryTarget();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState<number | string>(
    target.currentTarget != null ? target.currentTarget / 100 : 0
  );

  const hasTarget = target.currentTarget != null && target.currentTarget > 0;
  const isExcluded = target.status === 'excluded';
  const spentPct =
    hasTarget && target.currentTarget! > 0
      ? Math.min(Math.round((target.spentInPeriod / target.currentTarget!) * 100), 100)
      : 0;

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) {
      return;
    }
    const cents = Math.round(Number(editValue) * 100);
    if (cents <= 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: target.id,
        body: { categoryId: target.id, value: cents },
      });
      setEditing(false);
    } catch {
      toast.error({ message: 'Failed to update target' });
    } finally {
      setSaving(false);
    }
  };

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

      {/* Target value — inline editable */}
      <div className={classes.targetValue}>
        {editing ? (
          <NumberInput
            size="xs"
            value={editValue}
            onChange={setEditValue}
            decimalScale={2}
            fixedDecimalScale
            min={0}
            style={{ width: 90 }}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
              if (e.key === 'Escape') {
                setEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <Text
            fz="sm"
            fw={500}
            ff="var(--mantine-font-family-monospace)"
            onClick={() => {
              if (!isExcluded) {
                setEditing(true);
              }
            }}
            style={{ cursor: isExcluded ? 'default' : 'pointer' }}
            title={isExcluded ? undefined : 'Click to edit'}
          >
            {hasTarget ? <CurrencyValue cents={target.currentTarget!} /> : '—'}
          </Text>
        )}
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
