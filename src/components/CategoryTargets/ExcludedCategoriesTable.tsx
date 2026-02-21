import { useTranslation } from 'react-i18next';
import { Button, Text } from '@mantine/core';
import { CategoryTargetRow } from '@/types/categoryTarget';
import styles from './CategoryTargets.module.css';

interface ExcludedCategoriesTableProps {
  rows: CategoryTargetRow[];
  onInclude: (categoryId: string) => void;
}

export function ExcludedCategoriesTable({ rows, onInclude }: ExcludedCategoriesTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return null;
  }

  const isSystemExcluded = (row: CategoryTargetRow) => row.categoryType === 'Transfer';

  return (
    <div className={styles.excludedGroup}>
      <div className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>{t('categoryTargets.sections.excluded')}</Text>
      </div>
      <div className={styles.excludedHeader}>
        <span className={styles.tableHeaderLabel}>{t('categoryTargets.headers.category')}</span>
        <span className={styles.tableHeaderLabel}>{t('categoryTargets.headers.targetStatus')}</span>
        <span className={styles.tableHeaderLabel}>{t('categoryTargets.headers.reason')}</span>
        <span className={styles.tableHeaderLabel}>{t('categoryTargets.headers.action')}</span>
      </div>
      {rows.map((row) => (
        <div key={row.categoryId} className={styles.excludedRow}>
          <div className={styles.categoryCell}>
            <span className={styles.categoryName}>{row.categoryName}</span>
            <span className={styles.categoryMeta}>
              {isSystemExcluded(row)
                ? t('categoryTargets.row.systemManaged')
                : `${t(`categories.types.${row.categoryType}`)} \u2022 ${t('categoryTargets.row.userExclusion')}`}
            </span>
          </div>
          <span className={styles.excludedStatus}>{t('categoryTargets.status.excluded')}</span>
          <span className={styles.excludedReason}>
            {row.exclusionReason ?? t('categoryTargets.row.noReason')}
          </span>
          {isSystemExcluded(row) ? (
            <span className={styles.systemRule}>{t('categoryTargets.actions.systemRule')}</span>
          ) : (
            <Button
              variant="default"
              size="compact-sm"
              className={styles.scopeAction}
              onClick={() => onInclude(row.categoryId)}
            >
              {t('categoryTargets.actions.includeInTargets')}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
