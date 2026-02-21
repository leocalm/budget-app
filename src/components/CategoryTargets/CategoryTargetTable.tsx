import { useTranslation } from 'react-i18next';
import { Text } from '@mantine/core';
import { CategoryTargetRow as CategoryTargetRowType } from '@/types/categoryTarget';
import { CategoryTargetRow } from './CategoryTargetRow';
import styles from './CategoryTargets.module.css';

interface CategoryTargetTableProps {
  title: string;
  rows: CategoryTargetRowType[];
  editedValues: Map<string, number>;
  onValueChange: (categoryId: string, value: number | null) => void;
  onExclude: (categoryId: string) => void;
}

export function CategoryTargetTable({
  title,
  rows,
  editedValues,
  onValueChange,
  onExclude,
}: CategoryTargetTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={styles.sectionGroup}>
      <div className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>{title}</Text>
      </div>
      <div className={styles.tableHeader}>
        <span className={styles.tableHeaderLabel}>{t('categoryTargets.headers.category')}</span>
        <span className={styles.tableHeaderLabel}>
          {t('categoryTargets.headers.previousTarget')}
        </span>
        <span className={styles.tableHeaderLabel}>
          {t('categoryTargets.headers.currentTarget')}
        </span>
        <span className={styles.tableHeaderLabel}>
          {t('categoryTargets.headers.projectedVariance')}
        </span>
        <span className={styles.tableHeaderLabel}>{t('categoryTargets.headers.targetScope')}</span>
      </div>
      {rows.map((row) => (
        <CategoryTargetRow
          key={row.categoryId}
          row={row}
          editedValue={editedValues.get(row.categoryId) ?? null}
          onValueChange={onValueChange}
          onExclude={onExclude}
        />
      ))}
      <div className={styles.markExcludedHint}>
        {t('categoryTargets.hints.markExcluded.prefix')}{' '}
        <span className={styles.markExcludedHintBold}>
          {t('categoryTargets.actions.markExcluded')}
        </span>{' '}
        {t('categoryTargets.hints.markExcluded.suffix')}
      </div>
    </div>
  );
}
