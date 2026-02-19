import { useTranslation } from 'react-i18next';
import { Text } from '@mantine/core';
import styles from './Categories.module.css';

interface CategoryStabilityDotsProps {
  history: boolean[];
}

export function CategoryStabilityDots({ history }: CategoryStabilityDotsProps) {
  const { t } = useTranslation();
  const normalizedHistory = history.slice(0, 3);

  return (
    <div className={styles.categoryStability}>
      <Text className={styles.categoryStabilityLabel}>
        {t('categories.diagnostics.labels.lastThreePeriods')}
      </Text>
      <div
        className={styles.categoryStabilityDots}
        aria-label={t('categories.diagnostics.labels.lastThreePeriods')}
      >
        {normalizedHistory.length === 0 ? (
          <span className={styles.categoryStabilityEmpty} aria-hidden="true">
            —
          </span>
        ) : (
          normalizedHistory.map((isWithinTolerance, index) => (
            <span
              key={`stability-dot-${index}`}
              className={`${styles.categoryStabilityDot} ${
                isWithinTolerance ? styles.categoryStabilityDotFilled : ''
              }`}
              aria-label={isWithinTolerance ? 'Within tolerance' : 'Outside tolerance'}
            />
          ))
        )}
      </div>
    </div>
  );
}
