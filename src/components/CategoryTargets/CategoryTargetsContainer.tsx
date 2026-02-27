import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { StateRenderer } from '@/components/Utils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import {
  useCategoryTargets,
  useExcludeCategory,
  useIncludeCategory,
  useSaveCategoryTargets,
} from '@/hooks/useCategoryTargets';
import { toast } from '@/lib/toast';
import { CategoryTargetsContext } from './CategoryTargetsContext';
import { CategoryTargetTable } from './CategoryTargetTable';
import { ExcludedCategoriesTable } from './ExcludedCategoriesTable';
import styles from './CategoryTargets.module.css';

function TargetsSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={120} radius="md" />
      <Skeleton height={200} radius="md" />
      <Skeleton height={120} radius="md" />
    </Stack>
  );
}

export function CategoryTargetsContainer() {
  const { t } = useTranslation();
  const isMdUp = useMediaQuery('(min-width: 768px)');
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data, isLoading, isError, refetch } = useCategoryTargets(selectedPeriodId);
  const saveMutation = useSaveCategoryTargets(selectedPeriodId);
  const excludeMutation = useExcludeCategory(selectedPeriodId);
  const includeMutation = useIncludeCategory(selectedPeriodId);

  // Local edit state: map of categoryId -> edited cents value
  const [editedValues, setEditedValues] = useState<Map<string, number>>(new Map());

  const hasUnsavedChanges = editedValues.size > 0;

  const handleValueChange = useCallback((categoryId: string, value: number | null) => {
    setEditedValues((prev) => {
      const next = new Map(prev);
      if (value === null) {
        next.delete(categoryId);
      } else {
        next.set(categoryId, value);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setEditedValues(new Map());
  }, []);

  const handleSave = useCallback(async () => {
    if (editedValues.size === 0) {
      return;
    }

    const targets = Array.from(editedValues.entries()).map(([categoryId, budgetedValue]) => ({
      categoryId,
      budgetedValue,
    }));

    try {
      await saveMutation.mutateAsync({ targets });
      setEditedValues(new Map());
      toast.success({ message: t('categoryTargets.success.saved') });
    } catch {
      toast.error({ message: t('categoryTargets.errors.saveFailed') });
    }
  }, [editedValues, saveMutation, t]);

  const handleExclude = useCallback(
    async (categoryId: string) => {
      try {
        await excludeMutation.mutateAsync(categoryId);
        // Remove from edited values if present
        setEditedValues((prev) => {
          const next = new Map(prev);
          next.delete(categoryId);
          return next;
        });
        toast.success({ message: t('categoryTargets.success.excluded') });
      } catch {
        toast.error({ message: t('categoryTargets.errors.excludeFailed') });
      }
    },
    [excludeMutation, t]
  );

  const handleInclude = useCallback(
    async (categoryId: string) => {
      try {
        await includeMutation.mutateAsync(categoryId);
        toast.success({ message: t('categoryTargets.success.included') });
      } catch {
        toast.error({ message: t('categoryTargets.errors.includeFailed') });
      }
    },
    [includeMutation, t]
  );

  const isEmpty = useMemo(() => {
    if (!data) {
      return false;
    }
    return (
      data.outgoingTargets.length === 0 &&
      data.incomingTargets.length === 0 &&
      data.excludedCategories.length === 0
    );
  }, [data]);

  return (
    <StateRenderer
      variant="page"
      isLocked={selectedPeriodId === null}
      lockMessage={t('categoryTargets.states.locked')}
      lockAction={{ label: t('categoryTargets.states.lockAction'), to: '/periods' }}
      hasError={isError}
      errorMessage={t('categoryTargets.states.error')}
      onRetry={() => refetch()}
      isLoading={isLoading}
      loadingSkeleton={<TargetsSkeleton />}
      isEmpty={isEmpty}
      emptyTitle={t('categoryTargets.states.emptyTitle')}
      emptyMessage={t('categoryTargets.states.emptyMessage')}
    >
      {data && (
        <Stack gap="lg">
          <CategoryTargetsContext data={data} />

          <CategoryTargetTable
            title={t('categoryTargets.sections.outgoing')}
            rows={data.outgoingTargets}
            editedValues={editedValues}
            onValueChange={handleValueChange}
            onExclude={handleExclude}
          />

          <CategoryTargetTable
            title={t('categoryTargets.sections.incoming')}
            rows={data.incomingTargets}
            editedValues={editedValues}
            onValueChange={handleValueChange}
            onExclude={handleExclude}
          />

          <ExcludedCategoriesTable rows={data.excludedCategories} onInclude={handleInclude} />

          <div className={styles.markExcludedHint}>
            {t('categoryTargets.hints.markExcluded.prefix')}{' '}
            <span className={styles.markExcludedHintBold}>
              {t('categoryTargets.actions.markExcluded')}
            </span>{' '}
            {t('categoryTargets.hints.markExcluded.suffix')}
          </div>

          {/* Footer actions */}
          <div className={styles.footerBar}>
            <div>
              <Text className={styles.unsavedLabel}>
                {hasUnsavedChanges
                  ? t('categoryTargets.footer.unsaved', { count: editedValues.size })
                  : t('categoryTargets.footer.noChanges')}
              </Text>
            </div>
            <div className={styles.footerActions}>
              <Button variant="default" onClick={handleReset} disabled={!hasUnsavedChanges}>
                {t('categoryTargets.footer.reset')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                loading={saveMutation.isPending}
              >
                {t('categoryTargets.footer.save')}
              </Button>
            </div>
          </div>
          {isMdUp && (
            <Text className={styles.keyboardHint}>{t('categoryTargets.footer.keyboardHint')}</Text>
          )}
        </Stack>
      )}
    </StateRenderer>
  );
}
