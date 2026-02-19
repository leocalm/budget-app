import { useTranslation } from 'react-i18next';
import styles from './Categories.module.css';

interface CategoryStabilityDotsProps {
  history: boolean[];
}

export function CategoryStabilityDots({ history }: CategoryStabilityDotsProps) {
  const { t } = useTranslation();
  const normalizedHistory = history.slice(0, 3);
  const fixedSlots = Array.from({ length: 3 }, (_, index) => normalizedHistory[index]);

  return (
    <div
      className={styles.categoryStabilityDots}
      aria-label={t('categories.diagnostics.labels.lastThreePeriods')}
    >
      {fixedSlots.map((isWithinTolerance, index) => (
        <span
          key={`stability-dot-${index}`}
          className={`${styles.categoryStabilityDot} ${
            isWithinTolerance === false ? styles.categoryStabilityDotFilled : ''
          }`}
          aria-label={
            isWithinTolerance === undefined
              ? 'No data'
              : isWithinTolerance
                ? 'Within tolerance'
                : 'Outside tolerance'
          }
        />
      ))}
    </div>
  );
}
