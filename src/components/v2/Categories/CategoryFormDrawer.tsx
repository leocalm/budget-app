import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Drawer,
  Group,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import type { components } from '@/api/v2';
import { useCreateCategory, useUpdateCategory } from '@/hooks/v2/useCategories';
import {
  useCategoryTargets,
  useCreateCategoryTarget,
  useUpdateCategoryTarget,
} from '@/hooks/v2/useCategoryTargets';
import { useSubscriptionsByCategory } from '@/hooks/v2/useSubscriptions';
import { toast } from '@/lib/toast';
import { CategorySubscriptionSection } from './CategorySubscriptionSection';
import classes from './Categories.module.css';

type CategoryType = 'income' | 'expense' | 'transfer';
type Behavior = 'fixed' | 'variable' | 'subscription';
type CategoryBase = components['schemas']['CategoryBase'];
type EditableCategory = CategoryBase & {
  description?: string | null;
  target?: number | null;
  /** When true the target is auto-computed from active subscriptions (from CategoryResponse). */
  autoComputedTarget?: boolean;
};

const CATEGORY_ICONS = [
  '🏠',
  '🛒',
  '🍔',
  '🚗',
  '⛽',
  '💡',
  '📱',
  '🎬',
  '👕',
  '💊',
  '🎓',
  '✈️',
  '💰',
  '💳',
  '🎵',
  '📦',
  '🏥',
  '🐕',
  '🎁',
  '☕',
  '🏋️',
  '💇',
  '🧹',
  '📰',
];

interface CategoryFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  editCategory?: EditableCategory | null;
}

export function CategoryFormDrawer({ opened, onClose, editCategory }: CategoryFormDrawerProps) {
  const { t } = useTranslation('v2');
  const isEdit = !!editCategory;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const createTarget = useCreateCategoryTarget();
  const updateTarget = useUpdateCategoryTarget();
  const { data: targets } = useCategoryTargets(null);

  // Issue 7: Only fetch subscriptions when editing a subscription-behavior category
  const { data: categorySubs } = useSubscriptionsByCategory(
    isEdit && editCategory?.behavior === 'subscription' ? (editCategory?.id ?? null) : null
  );
  const hasActiveSubs =
    isEdit &&
    editCategory?.behavior === 'subscription' &&
    (categorySubs ?? []).some((s) => s.status !== 'cancelled');

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [behavior, setBehavior] = useState<Behavior | null>('variable');
  const [icon, setIcon] = useState('🛒');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState<number | string>('');

  useEffect(() => {
    if (isEdit && editCategory) {
      setName(editCategory.name);
      setType(editCategory.type);
      setBehavior(editCategory.behavior ?? null);
      setIcon(editCategory.icon);
      setDescription(editCategory.description ?? '');
      setTarget(editCategory.target != null ? editCategory.target / 100 : '');
    }
  }, [isEdit, editCategory]);

  const handleSubmit = async () => {
    // Encrypted API contract (Phase 4a fix): category create/update doesn't
    // accept a `target` field — manage budget targets via /targets separately.
    const body = {
      name: name.trim(),
      type,
      icon,
      color: '#000000',
      description: description.trim() || undefined,
      behavior: type === 'expense' ? behavior : undefined,
    } as components['schemas']['CreateCategoryRequest'];

    const desiredTargetCents =
      target !== '' && Number(target) > 0 ? Math.round(Number(target) * 100) : null;

    try {
      let categoryId: string;
      if (isEdit && editCategory) {
        await updateMutation.mutateAsync({ id: editCategory.id, body });
        categoryId = editCategory.id;
        toast.success({ message: t('categories.updated') });
      } else {
        const created = (await createMutation.mutateAsync(body)) as unknown as { id: string };
        categoryId = created?.id ?? '';
        toast.success({ message: t('categories.created') });
      }

      // Only manage targets for expense/income categories with an explicit
      // value; subscription-behavior categories get their budget auto-
      // computed from billing amounts so a manual target is a no-op.
      if (categoryId && desiredTargetCents != null && behavior !== 'subscription') {
        // The encrypted API returns the targets as a flat array. The openapi
        // typings aren't synced yet, so cast before scanning.
        const targetsList = (targets ?? []) as unknown as {
          id: string;
          categoryId: string;
        }[];
        const existing = targetsList.find((tg) => tg.categoryId === categoryId);
        try {
          if (existing) {
            // The Rust API's UpdateTargetRequest only has `value`; the
            // stale OpenAPI typing still lists `categoryId`. Cast to
            // satisfy the generated client without sending dead fields.
            await updateTarget.mutateAsync({
              id: existing.id,
              body: { value: desiredTargetCents } as unknown as {
                categoryId: string;
                value: number;
              },
            });
          } else {
            await createTarget.mutateAsync({
              categoryId,
              value: desiredTargetCents,
            });
          }
        } catch (err) {
          console.error('Failed to save category target', err);
        }
      }

      onClose();
      if (!isEdit) {
        setName('');
        setType('expense');
        setBehavior('variable');
        setIcon('🛒');
        setDescription('');
        setTarget('');
      }
    } catch {
      toast.error({
        message: t('categories.saveFailed', { action: isEdit ? 'update' : 'create' }),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid = name.trim().length >= 1 && icon;

  return (
    <Drawer
      data-testid="category-form-drawer"
      opened={opened}
      onClose={onClose}
      title={isEdit ? t('categories.form.editTitle') : t('categories.form.createTitle')}
      position="right"
      size="md"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        {/*
          Category type is immutable after creation. The backend enforces this
          via a BEFORE UPDATE trigger on the `category` table (migration
          20260327000004), because category_type is snapshotted by the
          transaction aggregate trigger at insert time to classify
          inflow/outflow/spending. Editing it would silently drift the
          materialized aggregates. Do not add an edit-mode branch here.
        */}
        {!isEdit && (
          <div>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
              {t('categories.form.type')}
            </Text>
            <div className={classes.typeSelector} data-testid="category-type-select">
              {(['income', 'expense'] as const).map((catType) => (
                <UnstyledButton
                  key={catType}
                  className={
                    type === catType ? classes.selectorButtonActive : classes.selectorButton
                  }
                  onClick={() => setType(catType)}
                >
                  <Text fz="sm" fw={500}>
                    {catType === 'income' ? t('common.incoming') : t('common.outgoing')}
                  </Text>
                </UnstyledButton>
              ))}
            </div>
          </div>
        )}

        {/* Behavior selector */}
        {type === 'expense' && (
          <div>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
              {t('categories.form.behavior')}
            </Text>
            <div className={classes.behaviorSelector}>
              {(['fixed', 'variable', 'subscription'] as const).map((b) => {
                const isDisabled = hasActiveSubs && b !== 'subscription';
                const btn = (
                  <UnstyledButton
                    key={b}
                    className={
                      behavior === b ? classes.selectorButtonActive : classes.selectorButton
                    }
                    onClick={() => !isDisabled && setBehavior(b)}
                    style={isDisabled ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                  >
                    <Text fz="lg">{b === 'fixed' ? '📌' : b === 'variable' ? '📊' : '🔄'}</Text>
                    <Text fz="xs" fw={500}>
                      {t(`categories.behaviors.${b}`)}
                    </Text>
                  </UnstyledButton>
                );
                return isDisabled ? (
                  <Tooltip
                    key={b}
                    label={t('categories.form.behaviorLockedSubs')}
                    withArrow
                    position="top"
                  >
                    <span>{btn}</span>
                  </Tooltip>
                ) : (
                  btn
                );
              })}
            </div>
          </div>
        )}

        {/* Name */}
        <TextInput
          data-testid="category-name-input"
          label={t('categories.form.categoryName')}
          placeholder={t('categories.form.categoryNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        {/* Icon picker */}
        <div>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {t('categories.form.icon')}
          </Text>
          <div className={classes.iconGrid}>
            {CATEGORY_ICONS.map((i) => (
              <UnstyledButton
                key={i}
                className={icon === i ? classes.iconOptionActive : classes.iconOption}
                onClick={() => setIcon(i)}
              >
                {i}
              </UnstyledButton>
            ))}
          </div>
        </div>

        {/* Description */}
        <Textarea
          label={t('categories.form.description')}
          placeholder={t('categories.form.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          maxLength={500}
          autosize
          minRows={2}
        />

        {/* Issue 8: Budget Target — hidden for subscription categories.
            Also hides when autoComputedTarget is true (target is derived from active subs). */}
        {behavior !== 'subscription' && !editCategory?.autoComputedTarget && (
          <NumberInput
            data-testid="category-budget-input"
            label={t('categories.form.budgetTarget')}
            description={t('categories.form.budgetTargetDesc')}
            placeholder="0.00"
            value={target}
            onChange={setTarget}
            decimalScale={2}
            fixedDecimalScale
            min={0}
          />
        )}

        {/* Subscription section — shown when editing a subscription category */}
        {behavior === 'subscription' && isEdit && editCategory?.id && (
          <Stack gap="xs">
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
              {t('categories.subscriptionSection.title')}
            </Text>
            <CategorySubscriptionSection categoryId={editCategory.id} />
          </Stack>
        )}

        {/* Info text — shown when creating a subscription category */}
        {behavior === 'subscription' && !isEdit && (
          <Alert variant="light" color="blue">
            {t('categories.subscriptionSection.createHint')}
          </Alert>
        )}

        {/* Submit */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button
            data-testid="category-form-submit"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!isValid}
          >
            {isEdit ? t('common.saveChanges') : t('categories.form.createButton')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
