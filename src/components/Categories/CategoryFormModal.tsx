/**
 * CategoryFormModal - Modal/Drawer for creating and editing categories
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { FormOverlay } from '@/components/Overlays/FormOverlay';
import { CategoryManagementRow, CategoryRequest, CategoryType } from '@/types/category';

interface CategoryFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryRequest) => Promise<void>;
  category?: CategoryManagementRow | null;
  mode: 'create' | 'edit' | 'subcategory';
  parentCategory?: CategoryManagementRow | null;
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
  categoryType: CategoryType;
  description: string | null;
}

const DEFAULT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

interface InitialValues {
  name: string;
  color: string;
  icon: string;
  description: string;
  categoryType: CategoryType;
}

export function CategoryFormModal({
  opened,
  onClose,
  onSubmit,
  category,
  mode,
  parentCategory,
}: CategoryFormModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('Outgoing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<InitialValues | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      let nextName: string;
      let nextColor: string;
      let nextIcon: string;
      let nextDescription: string;
      let nextCategoryType: CategoryType;

      if (mode === 'edit' && category) {
        nextName = category.name;
        nextColor = category.color || DEFAULT_COLORS[0];
        nextIcon = category.icon || '';
        nextDescription = category.description || '';
        nextCategoryType = category.categoryType;
      } else if (mode === 'subcategory' && parentCategory) {
        nextName = '';
        nextColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
        nextIcon = '';
        nextDescription = '';
        nextCategoryType = parentCategory.categoryType;
      } else {
        // Create mode
        nextName = '';
        nextColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
        nextIcon = '';
        nextDescription = '';
        nextCategoryType = 'Outgoing';
      }

      setName(nextName);
      setColor(nextColor);
      setIcon(nextIcon);
      setDescription(nextDescription);
      setCategoryType(nextCategoryType);
      setInitialValues({
        name: nextName,
        color: nextColor,
        icon: nextIcon,
        description: nextDescription,
        categoryType: nextCategoryType,
      });
      setError(null);
    }
  }, [opened, mode, category, parentCategory]);

  const isDirty = useMemo(() => {
    if (!opened || !initialValues) {
      return false;
    }

    return (
      name !== initialValues.name ||
      color !== initialValues.color ||
      icon !== initialValues.icon ||
      description !== initialValues.description ||
      categoryType !== initialValues.categoryType
    );
  }, [opened, initialValues, name, color, icon, description, categoryType]);

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      setError(t('categories.form.errors.nameMinLength'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Determine parentId based on mode
      let parentId: string | null = null;
      if (mode === 'subcategory' && parentCategory) {
        parentId = parentCategory.id;
      } else if (mode === 'edit' && category) {
        parentId = category.parentId ?? null;
      }

      await onSubmit({
        name: name.trim(),
        color,
        icon: icon.trim() || '📁',
        parentId,
        categoryType,
        description: description.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('categories.form.errors.submit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'edit':
        return t('categories.form.editTitle');
      case 'subcategory':
        return t('categories.form.subcategoryTitle');
      default:
        return t('categories.form.createTitle');
    }
  };

  return (
    <FormOverlay
      opened={opened}
      onClose={onClose}
      title={getTitle()}
      isDirty={isDirty}
      closeBlocked={isSubmitting}
    >
      <Stack gap="md">
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}

        {mode === 'subcategory' && parentCategory && (
          <TextInput
            label={t('categories.form.parentLabel')}
            value={parentCategory.name}
            readOnly
            disabled
          />
        )}

        <TextInput
          label={t('categories.form.nameLabel')}
          placeholder={t('categories.form.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          maxLength={80}
        />

        {(mode === 'create' || !category?.globalTransactionCount) && (
          <Select
            label={t('categories.form.typeLabel')}
            value={categoryType}
            onChange={(value) => {
              if (value !== null) {
                setCategoryType(value as CategoryType);
              }
            }}
            data={[
              { value: 'Incoming', label: t('categories.types.Incoming') },
              { value: 'Outgoing', label: t('categories.types.Outgoing') },
            ]}
            disabled={mode === 'subcategory'}
          />
        )}

        {mode === 'edit' &&
          category?.globalTransactionCount &&
          category.globalTransactionCount > 0 && (
            <Text size="xs" c="dimmed">
              {t('categories.form.typeLocked')}
            </Text>
          )}

        <TextInput
          label={t('categories.form.iconLabel')}
          placeholder={t('categories.form.iconPlaceholder')}
          value={icon}
          onChange={(e) => setIcon(e.currentTarget.value)}
          maxLength={8}
        />

        <Textarea
          label={t('categories.form.descriptionLabel')}
          placeholder={t('categories.form.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          rows={2}
          maxLength={255}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {mode === 'edit' ? t('common.save') : t('categories.form.create')}
          </Button>
        </Group>
      </Stack>
    </FormOverlay>
  );
}
