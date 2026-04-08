import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActionIcon, Badge, Menu, Progress, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import classes from './Categories.module.css';

type CategorySummary = components['schemas']['CategorySummaryItem'];

const BEHAVIOR_LABELS: Record<string, string> = {
  fixed: 'categories.behaviors.fixed',
  variable: 'categories.behaviors.variable',
  subscription: 'categories.behaviors.subscription',
};

interface CategoryRowProps {
  category: CategorySummary;
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CategoryRow({
  category,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: CategoryRowProps) {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();
  const isArchived = category.status === 'inactive';
  const hasBudget = category.budgeted != null && category.budgeted > 0;
  const spentPct = hasBudget
    ? Math.min(Math.round((category.actual / category.budgeted!) * 100), 100)
    : 0;

  return (
    <div
      className={classes.categoryRow}
      data-testid={`category-row-${category.id}`}
      data-archived={isArchived || undefined}
      onClick={() => navigate(`/categories/${category.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/categories/${category.id}`);
        }
      }}
    >
      {/* Icon */}
      <div className={classes.iconBadge} style={{ backgroundColor: `${category.color}26` }}>
        {category.icon}
      </div>

      {/* Name + meta */}
      <div className={classes.categoryInfo}>
        <div className={classes.categoryNameRow}>
          <Text fz="md" fw={600} truncate>
            {category.name}
          </Text>
          {category.behavior && (
            <Badge size="xs" variant="light" color="var(--v2-primary)">
              {t(BEHAVIOR_LABELS[category.behavior] ?? category.behavior)}
            </Badge>
          )}
        </div>
        <Text fz="xs" c="dimmed">
          {category.type === 'income'
            ? t('common.incoming')
            : category.type === 'transfer'
              ? t('common.transfer')
              : t('common.outgoing')}
          {hasBudget && (
            <>
              {' '}
              · <CurrencyValue cents={category.budgeted!} /> {t('common.budgeted')}
            </>
          )}
        </Text>
      </div>

      {/* Progress bar */}
      {hasBudget && (
        <div className={classes.progressCell}>
          <Progress value={spentPct} size={6} radius="xl" color={category.color} />
          <Text fz="xs" c="dimmed" ta="right" mt={2}>
            {spentPct}%
          </Text>
        </div>
      )}

      {/* Amount */}
      <div className={classes.amountCell}>
        <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
          <CurrencyValue cents={category.actual} />
        </Text>
      </div>

      {/* Kebab */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={classes.kebabCell}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={`Actions for ${category.name}`}
            >
              <Text fz="lg" lh={1}>
                ⋮
              </Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {!isArchived && (
              <Menu.Item onClick={() => onEdit(category.id)}>{t('common.edit')}</Menu.Item>
            )}
            {isArchived ? (
              <Menu.Item onClick={() => onUnarchive(category.id)}>
                {t('common.unarchive')}
              </Menu.Item>
            ) : (
              <Menu.Item onClick={() => onArchive(category.id)}>{t('common.archive')}</Menu.Item>
            )}
            <Menu.Item color="red" onClick={() => onDelete(category.id)}>
              {t('common.delete')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
