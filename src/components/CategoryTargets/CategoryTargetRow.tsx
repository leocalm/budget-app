import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { CategoryTargetRow as CategoryTargetRowType } from '@/types/categoryTarget';
import { formatCurrency } from '@/utils/currency';
import styles from './CategoryTargets.module.css';

interface CategoryTargetRowProps {
  row: CategoryTargetRowType;
  editedValue: number | null;
  onValueChange: (categoryId: string, value: number | null) => void;
  onExclude: (categoryId: string) => void;
}

export function CategoryTargetRow({
  row,
  editedValue,
  onValueChange,
  onExclude,
}: CategoryTargetRowProps) {
  const { t, i18n } = useTranslation();
  const currency = useDisplayCurrency();
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = editedValue !== null ? editedValue : (row.currentTarget ?? 0);
  const [inputValue, setInputValue] = useState(
    (displayValue / 100).toFixed(currency?.decimalPlaces ?? 2)
  );

  const formatAmount = (amountInCents: number) =>
    formatCurrency(amountInCents, currency, i18n.language);

  const previousLabel = row.previousTarget !== null ? formatAmount(row.previousTarget) : '—';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value;
    setInputValue(raw);
  };

  const commitValue = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed >= 0) {
      const cents = Math.round(parsed * 100);
      onValueChange(row.categoryId, cents);
      setInputValue((cents / 100).toFixed(currency?.decimalPlaces ?? 2));
    } else {
      // Reset to original
      const original = row.currentTarget ?? 0;
      setInputValue((original / 100).toFixed(currency?.decimalPlaces ?? 2));
      onValueChange(row.categoryId, null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitValue();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      const original = row.currentTarget ?? 0;
      setInputValue((original / 100).toFixed(currency?.decimalPlaces ?? 2));
      onValueChange(row.categoryId, null);
      inputRef.current?.blur();
    }
  };

  // Variance display
  let varianceLabel = '—';
  let varianceClass = styles.varianceNeutral;
  if (row.projectedVarianceBasisPoints !== null) {
    const percent = Math.round(row.projectedVarianceBasisPoints / 100);
    varianceLabel = `${row.projectedVarianceBasisPoints > 0 ? '+' : ''}${percent}%`;
    if (row.projectedVarianceBasisPoints > 0) {
      varianceClass = styles.variancePositive;
    } else if (row.projectedVarianceBasisPoints < 0) {
      varianceClass = styles.varianceNegative;
    }
  }

  // Meta line: "Outgoing . Parent category" or "Outgoing . No target defined yet"
  const typeName = t(`categories.types.${row.categoryType}`);
  const metaInfo = row.isParent
    ? t('categoryTargets.row.parentCategory')
    : (row.parentCategoryName ?? '');
  const metaLabel =
    row.currentTarget === null && !row.previousTarget
      ? `${typeName} \u2022 ${t('categoryTargets.row.noTargetYet')}`
      : `${typeName} \u2022 ${metaInfo || t('categoryTargets.row.parentCategory')}`;

  if (row.isArchived) {
    return (
      <div className={`${styles.targetRow} ${styles.targetRowArchived}`}>
        <div className={styles.categoryCell}>
          <div className={styles.categoryNameRow}>
            <span className={styles.categoryName}>{row.categoryName}</span>
            <span className={styles.archivedBadge}>{t('categoryTargets.row.archived')}</span>
          </div>
          <span className={styles.categoryMeta}>
            {typeName} &bull; {t('categoryTargets.row.hiddenFromTargets')}
          </span>
        </div>
        <span className={styles.previousTarget}>{previousLabel}</span>
        <span className={styles.unavailableLabel}>{t('categoryTargets.row.unavailable')}</span>
        <span className={styles.varianceNeutral}>-</span>
        <span className={styles.varianceNeutral}>-</span>
      </div>
    );
  }

  return (
    <div className={styles.targetRow}>
      <div className={styles.categoryCell}>
        <span className={styles.categoryName}>{row.categoryName}</span>
        <span className={styles.categoryMeta}>{metaLabel}</span>
      </div>
      <span className={styles.previousTarget}>{previousLabel}</span>
      <TextInput
        ref={inputRef}
        className={styles.targetInput}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={commitValue}
        onKeyDown={handleKeyDown}
        leftSection={<span className={styles.targetInputPrefix}>{currency.symbol}</span>}
        size="sm"
      />
      <span className={`${styles.varianceValue} ${varianceClass}`}>{varianceLabel}</span>
      <Button
        variant="default"
        size="compact-sm"
        className={styles.scopeAction}
        onClick={() => onExclude(row.categoryId)}
      >
        {t('categoryTargets.actions.markExcluded')}
      </Button>
    </div>
  );
}
