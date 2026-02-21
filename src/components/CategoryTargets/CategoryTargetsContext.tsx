import { useTranslation } from 'react-i18next';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { CategoryTargetsResponse } from '@/types/categoryTarget';
import { formatCurrency } from '@/utils/currency';
import styles from './CategoryTargets.module.css';

interface CategoryTargetsContextProps {
  data: CategoryTargetsResponse;
}

export function CategoryTargetsContext({ data }: CategoryTargetsContextProps) {
  const { t, i18n } = useTranslation();
  const currency = useDisplayCurrency();

  const format = (amountInCents: number) => formatCurrency(amountInCents, currency, i18n.language);

  const periodLabel = `${data.periodStartDate} - ${data.periodEndDate}`;
  const positionLabel = t('categoryTargets.context.currentPosition', {
    set: format(data.totalTargeted),
    total: format(data.totalTargeted),
  });
  const categoriesLabel = t('categoryTargets.context.categoriesWithTargets', {
    targeted: data.targetedCategories,
    total: data.totalCategories,
  });
  const progressPercent = Math.min(100, Math.max(0, data.periodProgressPercent));

  return (
    <div className={styles.contextCard}>
      <div className={styles.contextGrid}>
        <div className={styles.contextBlock}>
          <span className={styles.contextLabel}>{t('categoryTargets.context.period')}</span>
          <span className={styles.contextValue}>{data.periodName}</span>
          <span className={styles.contextHint}>{periodLabel}</span>
        </div>
        <div className={styles.contextBlock}>
          <span className={styles.contextLabel}>
            {t('categoryTargets.context.currentPositionLabel')}
          </span>
          <span className={styles.contextValue}>{positionLabel}</span>
        </div>
        <div className={styles.contextBlock}>
          <span className={styles.contextLabel}>
            {t('categoryTargets.context.categoriesLabel')}
          </span>
          <span className={styles.contextValue}>{categoriesLabel}</span>
        </div>
        <div className={styles.contextBlock}>
          <span className={styles.contextLabel}>{t('categoryTargets.context.periodProgress')}</span>
          <span className={styles.contextProgressLabel}>
            {progressPercent}% {t('categoryTargets.context.elapsed')}
          </span>
          <div className={styles.contextProgressTrack}>
            <div className={styles.contextProgressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
      <div className={styles.contextHint} style={{ marginTop: 12 }}>
        {t('categoryTargets.context.hint')}
      </div>
    </div>
  );
}
