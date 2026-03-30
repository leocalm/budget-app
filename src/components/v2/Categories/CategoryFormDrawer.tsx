import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import type { components } from '@/api/v2';
import { useCreateCategory, useUpdateCategory } from '@/hooks/v2/useCategories';
import { toast } from '@/lib/toast';
import classes from './Categories.module.css';

type CategoryType = 'income' | 'expense' | 'transfer';
type Behavior = 'fixed' | 'variable' | 'subscription';
type CategoryBase = components['schemas']['CategoryBase'];
type EditableCategory = CategoryBase & { description?: string | null; target?: number | null };

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
    const body: components['schemas']['CreateCategoryRequest'] = {
      name: name.trim(),
      type,
      icon,
      color: '#000000',
      description: description.trim() || undefined,
      behavior: type === 'expense' ? behavior : undefined,
      target: target !== '' && Number(target) > 0 ? Math.round(Number(target) * 100) : undefined,
    };

    try {
      if (isEdit && editCategory) {
        await updateMutation.mutateAsync({ id: editCategory.id, body });
        toast.success({ message: t('categories.updated') });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: t('categories.created') });
      }
      onClose();
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
        {/* Type selector */}
        {!isEdit && (
          <div>
            <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
              {t('categories.form.type')}
            </Text>
            <div className={classes.typeSelector}>
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
              {(['fixed', 'variable', 'subscription'] as const).map((b) => (
                <UnstyledButton
                  key={b}
                  className={behavior === b ? classes.selectorButtonActive : classes.selectorButton}
                  onClick={() => setBehavior(b)}
                >
                  <Text fz="lg">{b === 'fixed' ? '📌' : b === 'variable' ? '📊' : '🔄'}</Text>
                  <Text fz="xs" fw={500}>
                    {b.charAt(0).toUpperCase() + b.slice(1)}
                  </Text>
                </UnstyledButton>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <TextInput
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

        {/* Budget Target */}
        <NumberInput
          label={t('categories.form.budgetTarget')}
          description={t('categories.form.budgetTargetDesc')}
          placeholder="0.00"
          value={target}
          onChange={setTarget}
          decimalScale={2}
          fixedDecimalScale
          min={0}
        />

        {/* Submit */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isValid}>
            {isEdit ? t('common.saveChanges') : t('categories.form.createButton')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
