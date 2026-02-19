import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Drawer,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { PeriodContextStrip } from '@/components/BudgetPeriodSelector';
import { StateRenderer } from '@/components/Utils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import {
  useArchiveCategory,
  useCategoriesDiagnostic,
  useCategoriesManagement,
  useCreateCategory,
  useDeleteCategory,
  useRestoreCategory,
  useUpdateCategory,
} from '@/hooks/useCategories';
import { toast } from '@/lib/toast';
import { CategoryManagementRow, CategoryRequest } from '@/types/category';
import { BudgetedDiagnosticRow } from './BudgetedDiagnosticRow';
import {
  ArchiveBlockedDialog,
  ArchiveConfirmDialog,
  DeleteConfirmDialog,
  RestoreConfirmDialog,
} from './CategoryConfirmDialogs';
import { CategoryFormModal } from './CategoryFormModal';
import { CategoriesManagement } from './CategoriesManagement';
import { CreateCategoryForm } from './CreateCategoryForm';
import { UnbudgetedDiagnosticItem, UnbudgetedDiagnosticList } from './UnbudgetedDiagnosticList';
import styles from './Categories.module.css';

type ViewMode = 'overview' | 'management';

function CategoriesDiagnosticsSkeleton() {
  return (
    <div className={styles.diagnosticsLayout}>
      <Paper withBorder radius="lg" p="lg" className={styles.budgetedSection}>
        <Stack gap="sm">
          <Skeleton height={24} width="40%" radius="sm" />
          <Skeleton height={88} radius="md" />
          <Skeleton height={88} radius="md" />
          <Skeleton height={88} radius="md" />
        </Stack>
      </Paper>

      <Paper withBorder radius="lg" p="lg" className={styles.unbudgetedSection}>
        <Stack gap="sm">
          <Skeleton height={24} width="55%" radius="sm" />
          <Skeleton height={60} radius="md" />
          <Skeleton height={60} radius="md" />
          <Skeleton height={60} radius="md" />
        </Stack>
      </Paper>
    </div>
  );
}

export function CategoriesContainer() {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { selectedPeriodId } = useBudgetPeriodSelection();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  // Create category modal
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  // Edit category modal
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editingCategory, setEditingCategory] = useState<CategoryManagementRow | null>(null);

  // Subcategory modal
  const [subcategoryOpened, { open: openSubcategory, close: closeSubcategory }] = useDisclosure(false);
  const [parentCategory, setParentCategory] = useState<CategoryManagementRow | null>(null);

  // Confirmation dialogs
  const [archiveConfirmOpened, { open: openArchiveConfirm, close: closeArchiveConfirm }] = useDisclosure(false);
  const [archiveBlockedOpened, { open: openArchiveBlocked, close: closeArchiveBlocked }] = useDisclosure(false);
  const [deleteConfirmOpened, { open: openDeleteConfirm, close: closeDeleteConfirm }] = useDisclosure(false);
  const [restoreConfirmOpened, { open: openRestoreConfirm, close: closeRestoreConfirm }] = useDisclosure(false);
  const [actionCategory, setActionCategory] = useState<CategoryManagementRow | null>(null);

  // Queries
  const {
    data: diagnostics,
    isLoading: isDiagnosticsQueryLoading,
    isError: hasDiagnosticsError,
    refetch: refetchDiagnostics,
  } = useCategoriesDiagnostic(selectedPeriodId);

  const {
    data: managementData,
    isLoading: isManagementLoading,
    isError: isManagementError,
    refetch: refetchManagement,
  } = useCategoriesManagement();

  // Mutations
  const createMutation = useCreateCategory(selectedPeriodId);
  const updateMutation = useUpdateCategory(selectedPeriodId);
  const deleteMutation = useDeleteCategory(selectedPeriodId);
  const archiveMutation = useArchiveCategory();
  const restoreMutation = useRestoreCategory();

  const budgetedDiagnostics = useMemo(() => {
    return (diagnostics?.budgetedRows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      budgetedValue: row.budgetedValue,
      spentValue: row.actualValue,
      varianceValue: row.varianceValue,
      progressPercentage: row.progressBasisPoints / 100,
      stabilityHistory: row.recentClosedPeriods.map((period) => !period.isOutsideTolerance),
    }));
  }, [diagnostics]);

  const unbudgetedDiagnostics = useMemo<UnbudgetedDiagnosticItem[]>(() => {
    return (diagnostics?.unbudgetedRows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      spentValue: row.actualValue,
      sharePercentage: row.shareOfTotalBasisPoints / 100,
    }));
  }, [diagnostics]);

  const isDiagnosticsLoading = selectedPeriodId !== null && isDiagnosticsQueryLoading;

  const retryDiagnostics = () => {
    void refetchDiagnostics();
  };

  // Handlers
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
    if (!editingCategory) return;
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
    if (!actionCategory) return;
    await archiveMutation.mutateAsync(actionCategory.id);
    toast.success({ message: t('categories.success.archived') });
    closeArchiveConfirm();
    setActionCategory(null);
  };

  const handleRestoreCategory = (category: CategoryManagementRow) => {
    setActionCategory(category);
    openRestoreConfirm();
  };

  const handleConfirmRestore = async () => {
    if (!actionCategory) return;
    await restoreMutation.mutateAsync(actionCategory.id);
    toast.success({ message: t('categories.success.restored') });
    closeRestoreConfirm();
    setActionCategory(null);
  };

  const handleDeleteCategory = (category: CategoryManagementRow) => {
    setActionCategory(category);
    openDeleteConfirm();
  };

  const handleConfirmDelete = async () => {
    if (!actionCategory) return;
    await deleteMutation.mutateAsync(actionCategory.id);
    toast.success({ message: t('categories.success.deleted') });
    closeDeleteConfirm();
    setActionCategory(null);
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
                : t('categories.header.subtitleManagement')}
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
            </nav>
          </div>
          {viewMode === 'management' && (
            <Button onClick={openCreate} className={styles.addButton}>
              <span className={styles.desktopAddLabel}>+ {t('categories.actions.addCategory')}</span>
              <span className={styles.mobileAddLabel}>+</span>
            </Button>
          )}
        </div>

        <PeriodContextStrip />

        {viewMode === 'overview' ? (
          <StateRenderer
            variant="page"
            isLocked={selectedPeriodId === null}
            lockMessage={t('states.locked.message.periodRequired')}
            lockAction={{ label: t('states.locked.configure'), to: '/periods' }}
            hasError={hasDiagnosticsError}
            errorMessage={t('states.error.loadFailed.message')}
            onRetry={retryDiagnostics}
            isLoading={isDiagnosticsLoading}
            loadingSkeleton={<CategoriesDiagnosticsSkeleton />}
            isEmpty={budgetedDiagnostics.length === 0 && unbudgetedDiagnostics.length === 0}
            emptyItemsLabel={t('states.contract.items.categories')}
            emptyMessage={t('states.empty.categories.message')}
            emptyAction={{
              label: t('categories.empty.addButton'),
              onClick: openCreate,
            }}
          >
            <div className={styles.diagnosticsLayout}>
              <Paper withBorder radius="lg" p="lg" className={styles.budgetedSection}>
                <Stack gap="md">
                  <div className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>
                      {t('categories.diagnostics.sections.budgeted')}
                    </Text>
                    <Text className={styles.sectionSubtitle}>
                      {t('categories.diagnostics.sections.budgetedSubtitle')}
                    </Text>
                  </div>

                  {budgetedDiagnostics.length === 0 ? (
                    <Text className={styles.sectionEmpty}>
                      {t('categories.diagnostics.empty.budgeted')}
                    </Text>
                  ) : (
                    <Stack gap={0}>
                      {budgetedDiagnostics.map((row) => (
                        <BudgetedDiagnosticRow
                          key={row.id}
                          id={row.id}
                          name={row.name}
                          icon={row.icon}
                          color={row.color}
                          budgetedValue={row.budgetedValue}
                          spentValue={row.spentValue}
                          varianceValue={row.varianceValue}
                          progressPercentage={row.progressPercentage}
                          stabilityHistory={row.stabilityHistory}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <Paper withBorder radius="lg" p="lg" className={styles.unbudgetedSection}>
                <Stack gap="md">
                  <div className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>
                      {t('categories.diagnostics.sections.unbudgeted')}
                    </Text>
                  </div>

                  <UnbudgetedDiagnosticList rows={unbudgetedDiagnostics} />
                </Stack>
              </Paper>
            </div>
          </StateRenderer>
        ) : (
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
        )}

        {/* Create Category Modal/Drawer */}
        {isMobile ? (
          <Drawer
            opened={createOpened}
            onClose={closeCreate}
            title={t('categories.modal.createTitle')}
            position="bottom"
          >
            <CreateCategoryForm
              onCategoryCreated={closeCreate}
              selectedPeriodId={selectedPeriodId}
            />
          </Drawer>
        ) : (
          <Modal
            opened={createOpened}
            onClose={closeCreate}
            title={t('categories.modal.createTitle')}
            centered
          >
            <CreateCategoryForm
              onCategoryCreated={closeCreate}
              selectedPeriodId={selectedPeriodId}
            />
          </Modal>
        )}

        {/* Edit Category Modal */}
        <CategoryFormModal
          opened={editOpened}
          onClose={closeEdit}
          onSubmit={handleUpdateCategory}
          category={editingCategory}
          mode="edit"
        />

        {/* Create Subcategory Modal */}
        <CategoryFormModal
          opened={subcategoryOpened}
          onClose={closeSubcategory}
          onSubmit={handleCreateSubcategorySubmit}
          parentCategory={parentCategory}
          mode="subcategory"
        />

        {/* Confirmation Dialogs */}
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
