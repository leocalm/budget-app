import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CategoryTargets } from '@/components/CategoryTargets';
import {
  useArchiveCategory,
  useCategoriesManagement,
  useCreateCategory,
  useDeleteCategory,
  useRestoreCategory,
  useUpdateCategory,
} from '@/hooks/useCategories';
import { toast } from '@/lib/toast';
import { CategoryManagementRow, CategoryRequest } from '@/types/category';
import { CategoriesManagement } from './CategoriesManagement';
import { CategoriesOverview } from './CategoriesOverview';
import {
  ArchiveBlockedDialog,
  ArchiveConfirmDialog,
  DeleteConfirmDialog,
  RestoreConfirmDialog,
} from './CategoryConfirmDialogs';
import { CategoryFormModal } from './CategoryFormModal';
import styles from './Categories.module.css';

type ViewMode = 'overview' | 'management' | 'targets';

export function CategoriesContainer() {
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editingCategory, setEditingCategory] = useState<CategoryManagementRow | null>(null);
  const [subcategoryOpened, { open: openSubcategory, close: closeSubcategory }] =
    useDisclosure(false);
  const [parentCategory, setParentCategory] = useState<CategoryManagementRow | null>(null);
  const [archiveConfirmOpened, { open: openArchiveConfirm, close: closeArchiveConfirm }] =
    useDisclosure(false);
  const [archiveBlockedOpened, { open: openArchiveBlocked, close: closeArchiveBlocked }] =
    useDisclosure(false);
  const [deleteConfirmOpened, { open: openDeleteConfirm, close: closeDeleteConfirm }] =
    useDisclosure(false);
  const [restoreConfirmOpened, { open: openRestoreConfirm, close: closeRestoreConfirm }] =
    useDisclosure(false);
  const [actionCategory, setActionCategory] = useState<CategoryManagementRow | null>(null);

  const {
    data: managementData,
    isLoading: isManagementLoading,
    isError: isManagementError,
    refetch: refetchManagement,
  } = useCategoriesManagement();

  const createMutation = useCreateCategory(null);
  const updateMutation = useUpdateCategory(null);
  const deleteMutation = useDeleteCategory(null);
  const archiveMutation = useArchiveCategory();
  const restoreMutation = useRestoreCategory();

  const handleCreateCategory = async (data: CategoryRequest) => {
    await createMutation.mutateAsync(data);
    toast.success({ message: t('categories.success.created') });
    closeCreate();
  };

  const handleEditCategory = (category: CategoryManagementRow) => {
    setEditingCategory(category);
    openEdit();
  };

  const handleUpdateCategory = async (data: CategoryRequest) => {
    if (!editingCategory) {
      return;
    }
    await updateMutation.mutateAsync({ id: editingCategory.id, payload: data });
    toast.success({ message: t('categories.success.updated') });
    closeEdit();
  };

  const handleArchiveCategory = (category: CategoryManagementRow) => {
    setActionCategory(category);
    if (category.activeChildrenCount > 0) {
      openArchiveBlocked();
    } else {
      openArchiveConfirm();
    }
  };

  const handleConfirmArchive = async () => {
    if (!actionCategory) {
      return;
    }
    try {
      await archiveMutation.mutateAsync(actionCategory.id);
      toast.success({ message: t('categories.success.archived') });
      closeArchiveConfirm();
      setActionCategory(null);
    } catch (error) {
      toast.error({ message: t('categories.errors.archiveFailed') });
    }
  };

  const handleRestoreCategory = (category: CategoryManagementRow) => {
    setActionCategory(category);
    openRestoreConfirm();
  };

  const handleConfirmRestore = async () => {
    if (!actionCategory) {
      return;
    }
    try {
      await restoreMutation.mutateAsync(actionCategory.id);
      toast.success({ message: t('categories.success.restored') });
      closeRestoreConfirm();
      setActionCategory(null);
    } catch (error) {
      toast.error({ message: t('categories.errors.restoreFailed') });
    }
  };

  const handleDeleteCategory = (category: CategoryManagementRow) => {
    setActionCategory(category);
    openDeleteConfirm();
  };

  const handleConfirmDelete = async () => {
    if (!actionCategory) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(actionCategory.id);
      toast.success({ message: t('categories.success.deleted') });
      closeDeleteConfirm();
      setActionCategory(null);
    } catch (error) {
      toast.error({ message: t('categories.errors.deleteFailed') });
    }
  };

  const handleCreateSubcategory = (parent: CategoryManagementRow) => {
    setParentCategory(parent);
    openSubcategory();
  };

  const handleCreateSubcategorySubmit = async (data: CategoryRequest) => {
    await createMutation.mutateAsync(data);
    toast.success({ message: t('categories.success.created') });
    closeSubcategory();
  };

  return (
    <Box className={styles.categoriesRoot}>
      <Stack gap="xl">
        <div className={styles.categoriesHeader}>
          <div>
            <Title order={1} className={styles.categoriesTitle}>
              {t('categories.header.title')}
            </Title>
            <Text className={styles.categoriesSubtitle}>
              {viewMode === 'overview'
                ? t('categories.header.subtitle')
                : viewMode === 'management'
                  ? t('categories.header.subtitleManagement')
                  : t('categories.header.subtitleTargets')}
            </Text>
            <nav className={styles.modeSwitch} aria-label="Categories page mode">
              <button
                type="button"
                className={`${styles.modePill} ${viewMode === 'overview' ? styles.modePillActive : ''}`}
                tabIndex={0}
                aria-label={t('categories.modeSwitch.overview')}
                onClick={() => setViewMode('overview')}
              >
                {t('categories.modeSwitch.overview')}
              </button>
              <button
                type="button"
                className={`${styles.modePill} ${viewMode === 'management' ? styles.modePillActive : ''}`}
                tabIndex={0}
                aria-label={t('categories.modeSwitch.management')}
                onClick={() => setViewMode('management')}
              >
                {t('categories.modeSwitch.management')}
              </button>
              <button
                type="button"
                className={`${styles.modePill} ${viewMode === 'targets' ? styles.modePillActive : ''}`}
                tabIndex={0}
                aria-label={t('categories.modeSwitch.targets')}
                onClick={() => setViewMode('targets')}
              >
                {t('categories.modeSwitch.targets')}
              </button>
            </nav>
          </div>
          {viewMode === 'management' && (
            <Button onClick={openCreate} className={styles.addButton}>
              <span className={styles.desktopAddLabel}>
                + {t('categories.actions.addCategory')}
              </span>
              <span className={styles.mobileAddLabel}>+</span>
            </Button>
          )}
        </div>

        {viewMode === 'overview' ? (
          <CategoriesOverview
            emptyAction={{
              label: t('categories.empty.addButton'),
              onClick: openCreate,
            }}
          />
        ) : viewMode === 'management' ? (
          <CategoriesManagement
            data={managementData}
            isLoading={isManagementLoading}
            isError={isManagementError}
            onRetry={() => refetchManagement()}
            onEdit={handleEditCategory}
            onArchive={handleArchiveCategory}
            onRestore={handleRestoreCategory}
            onDelete={handleDeleteCategory}
            onAddSubcategory={handleCreateSubcategory}
          />
        ) : (
          <CategoryTargets />
        )}

        <CategoryFormModal
          opened={createOpened}
          onClose={closeCreate}
          onSubmit={handleCreateCategory}
          mode="create"
        />

        <CategoryFormModal
          opened={editOpened}
          onClose={closeEdit}
          onSubmit={handleUpdateCategory}
          category={editingCategory}
          mode="edit"
        />

        <CategoryFormModal
          opened={subcategoryOpened}
          onClose={closeSubcategory}
          onSubmit={handleCreateSubcategorySubmit}
          parentCategory={parentCategory}
          mode="subcategory"
        />

        <ArchiveConfirmDialog
          opened={archiveConfirmOpened}
          onClose={closeArchiveConfirm}
          onConfirm={handleConfirmArchive}
          category={actionCategory}
          isLoading={archiveMutation.isPending}
        />

        <ArchiveBlockedDialog
          opened={archiveBlockedOpened}
          onClose={closeArchiveBlocked}
          category={actionCategory}
        />

        <DeleteConfirmDialog
          opened={deleteConfirmOpened}
          onClose={closeDeleteConfirm}
          onConfirm={handleConfirmDelete}
          category={actionCategory}
          isLoading={deleteMutation.isPending}
        />

        <RestoreConfirmDialog
          opened={restoreConfirmOpened}
          onClose={closeRestoreConfirm}
          onConfirm={handleConfirmRestore}
          category={actionCategory}
          isLoading={restoreMutation.isPending}
        />
      </Stack>
    </Box>
  );
}
