import React, { useMemo, useState } from 'react';
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
import { PeriodContextStrip } from '@/components/BudgetPeriodSelector';
import { StateRenderer } from '@/components/Utils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useCategoriesDiagnostic } from '@/hooks/useCategories';
import { CategoryResponse } from '@/types/category';
import { BudgetedDiagnosticRow } from './BudgetedDiagnosticRow';
import { CreateCategoryForm } from './CreateCategoryForm';
import { EditCategoryForm } from './EditCategoryForm';
import { UnbudgetedDiagnosticItem, UnbudgetedDiagnosticList } from './UnbudgetedDiagnosticList';
import styles from './Categories.module.css';

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const {
    data: diagnostics,
    isLoading: isDiagnosticsQueryLoading,
    isError: hasDiagnosticsError,
    refetch: refetchDiagnostics,
  } = useCategoriesDiagnostic(selectedPeriodId);

  const budgetedDiagnostics = useMemo(() => {
    return (diagnostics?.budgetedRows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      category: row as CategoryResponse,
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

  const onEditCategory = (category: CategoryResponse) => {
    setSelectedCategory(category);
    openEdit();
  };

  const onEditClosed = () => {
    closeEdit();
    setSelectedCategory(null);
  };

  return (
    <Box className={styles.categoriesRoot}>
      <Stack gap="xl">
        <PeriodContextStrip />

        <div className={styles.categoriesHeader}>
          <div>
            <Title order={1} className={styles.categoriesTitle}>
              {t('categories.header.title')}
            </Title>
            <Text className={styles.categoriesSubtitle}>{t('categories.header.subtitle')}</Text>
          </div>

          <Button className={styles.addButton} size="md" onClick={openCreate}>
            <span className={styles.addButtonIcon}>+</span>
            {t('categories.actions.addCategory')}
          </Button>
        </div>

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
                  <Stack gap="sm">
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
                        onEdit={() => onEditCategory(row.category)}
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
                  <Text className={styles.sectionSubtitle}>
                    {t('categories.diagnostics.sections.unbudgetedSubtitle')}
                  </Text>
                </div>

                <UnbudgetedDiagnosticList rows={unbudgetedDiagnostics} />
              </Stack>
            </Paper>
          </div>
        </StateRenderer>

        {isMobile ? (
          <>
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

            <Drawer
              opened={editOpened}
              onClose={onEditClosed}
              title={t('categories.modal.editTitle')}
              position="bottom"
            >
              {selectedCategory && (
                <EditCategoryForm
                  category={selectedCategory}
                  onUpdated={onEditClosed}
                  selectedPeriodId={selectedPeriodId}
                />
              )}
            </Drawer>
          </>
        ) : (
          <>
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

            <Modal
              opened={editOpened}
              onClose={onEditClosed}
              title={t('categories.modal.editTitle')}
              centered
            >
              {selectedCategory && (
                <EditCategoryForm
                  category={selectedCategory}
                  onUpdated={onEditClosed}
                  selectedPeriodId={selectedPeriodId}
                />
              )}
            </Modal>
          </>
        )}
      </Stack>
    </Box>
  );
}
