import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconDeviceFloppy,
  IconPlus,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  Stack,
  Stepper,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { useCreateOverlay, useUpdateOverlay } from '@/hooks/useOverlays';
import { AccountResponse } from '@/types/account';
import { CategoryWithStats } from '@/types/category';
import { Overlay, OverlayInclusionMode, OverlayRequest } from '@/types/overlay';
import { VendorWithStats } from '@/types/vendor';
import { convertDisplayToCents, formatCurrency } from '@/utils/currency';
import classes from './OverlayFormModal.module.css';

type OverlayFormStep = 'basic' | 'inclusion' | 'rules' | 'caps' | 'review';

interface OverlayFormModalProps {
  opened: boolean;
  onClose: () => void;
  overlay?: Overlay | null;
  categories: CategoryWithStats[];
  vendors: VendorWithStats[];
  accounts: AccountResponse[];
}

interface OverlayFormValues {
  name: string;
  icon: string;
  startDate: string;
  endDate: string;
  inclusionMode: OverlayInclusionMode;
  categoryRuleIds: string[];
  vendorRuleIds: string[];
  accountRuleIds: string[];
  hasTotalCap: boolean;
  totalCapDisplayValue: number;
  hasCategoryCaps: boolean;
  categoryCapIds: string[];
  categoryCapDisplayValues: Record<string, number>;
}

const getDefaultValues = (overlay?: Overlay | null): OverlayFormValues => {
  if (!overlay) {
    return {
      name: '',
      icon: '',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(6, 'day').format('YYYY-MM-DD'),
      inclusionMode: 'manual',
      categoryRuleIds: [],
      vendorRuleIds: [],
      accountRuleIds: [],
      hasTotalCap: false,
      totalCapDisplayValue: 0,
      hasCategoryCaps: false,
      categoryCapIds: [],
      categoryCapDisplayValues: {},
    };
  }

  const categoryCaps = overlay.categoryCaps ?? [];

  return {
    name: overlay.name,
    icon: overlay.icon ?? '',
    startDate: overlay.startDate,
    endDate: overlay.endDate,
    inclusionMode: overlay.inclusionMode,
    categoryRuleIds: overlay.rules?.categoryIds ?? [],
    vendorRuleIds: overlay.rules?.vendorIds ?? [],
    accountRuleIds: overlay.rules?.accountIds ?? [],
    hasTotalCap: overlay.totalCapAmount !== null && overlay.totalCapAmount !== undefined,
    totalCapDisplayValue: overlay.totalCapAmount ? overlay.totalCapAmount / 100 : 0,
    hasCategoryCaps: categoryCaps.length > 0,
    categoryCapIds: categoryCaps.map((cap) => cap.categoryId),
    categoryCapDisplayValues: categoryCaps.reduce<Record<string, number>>((acc, cap) => {
      acc[cap.categoryId] = cap.capAmount / 100;
      return acc;
    }, {}),
  };
};

const dedupeAllowedIds = (ids: string[], allowedIds: Set<string>) => {
  return [...new Set(ids.filter((id) => allowedIds.has(id)))];
};

const getInclusionSteps = (inclusionMode: OverlayInclusionMode): OverlayFormStep[] => {
  if (inclusionMode === 'rules') {
    return ['basic', 'inclusion', 'rules', 'caps', 'review'];
  }

  return ['basic', 'inclusion', 'caps', 'review'];
};

export function OverlayFormModal({
  opened,
  onClose,
  overlay,
  categories,
  vendors,
  accounts,
}: OverlayFormModalProps) {
  const { t, i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();
  const isMobile = useMediaQuery('(max-width: 48em)');
  const createMutation = useCreateOverlay();
  const updateMutation = useUpdateOverlay();
  const [values, setValues] = useState<OverlayFormValues>(getDefaultValues(overlay));
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const format = (cents: number) => formatCurrency(cents, globalCurrency, i18n.language);

  const isEditMode = Boolean(overlay);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const allowedCategoryIds = useMemo(
    () => new Set(categories.map((category) => category.id)),
    [categories]
  );
  const allowedVendorIds = useMemo(() => new Set(vendors.map((vendor) => vendor.id)), [vendors]);
  const allowedAccountIds = useMemo(
    () => new Set(accounts.map((account) => account.id)),
    [accounts]
  );

  const steps = useMemo(() => getInclusionSteps(values.inclusionMode), [values.inclusionMode]);
  const currentStep = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  useEffect(() => {
    if (opened) {
      setValues(getDefaultValues(overlay));
      setActiveStep(0);
      setErrorMessage(null);
    }
  }, [opened, overlay]);

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: `${category.icon} ${category.name}`,
  }));
  const vendorOptions = vendors.map((vendor) => ({ value: vendor.id, label: vendor.name }));
  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: `${account.icon} ${account.name}`,
  }));

  const categoryCapRows = values.categoryCapIds.map((categoryId) => {
    const category = categories.find((item) => item.id === categoryId);

    return {
      categoryId,
      label: category ? `${category.icon} ${category.name}` : categoryId,
      amount: values.categoryCapDisplayValues[categoryId] ?? 0,
    };
  });

  const validateBasicStep = (): string | null => {
    if (values.name.trim().length < 2) {
      return t('overlays.modal.errors.nameMinLength');
    }

    if (values.name.trim().length > 80) {
      return t('overlays.modal.errors.nameMaxLength');
    }

    if (!values.startDate) {
      return t('overlays.modal.errors.startDateRequired');
    }

    if (!values.endDate) {
      return t('overlays.modal.errors.endDateRequired');
    }

    if (!dayjs(values.endDate).isAfter(dayjs(values.startDate))) {
      return t('overlays.modal.errors.endDateAfterStart');
    }

    return null;
  };

  const validateRulesStep = (): string | null => {
    if (values.inclusionMode !== 'rules') {
      return null;
    }

    const selectedCount =
      values.categoryRuleIds.length + values.vendorRuleIds.length + values.accountRuleIds.length;

    if (selectedCount === 0) {
      return t('overlays.modal.errors.ruleRequired');
    }

    return null;
  };

  const validateCapsStep = (): string | null => {
    if (values.hasTotalCap && values.totalCapDisplayValue <= 0) {
      return t('overlays.modal.errors.totalCapPositive');
    }

    if (values.hasCategoryCaps && values.categoryCapIds.length === 0) {
      return t('overlays.modal.errors.categoryCapSelectionRequired');
    }

    if (values.hasCategoryCaps) {
      const hasInvalidCategoryCap = values.categoryCapIds.some((categoryId) => {
        const capValue = values.categoryCapDisplayValues[categoryId] ?? 0;
        return capValue <= 0;
      });

      if (hasInvalidCategoryCap) {
        return t('overlays.modal.errors.categoryCapPositive');
      }
    }

    return null;
  };

  const validateStep = (step: OverlayFormStep): string | null => {
    if (step === 'basic') {
      return validateBasicStep();
    }

    if (step === 'rules') {
      return validateRulesStep();
    }

    if (step === 'caps') {
      return validateCapsStep();
    }

    return null;
  };

  const getPayload = (): OverlayRequest => {
    const categoryRuleIds = dedupeAllowedIds(values.categoryRuleIds, allowedCategoryIds);
    const vendorRuleIds = dedupeAllowedIds(values.vendorRuleIds, allowedVendorIds);
    const accountRuleIds = dedupeAllowedIds(values.accountRuleIds, allowedAccountIds);

    const categoryCapIds = dedupeAllowedIds(values.categoryCapIds, allowedCategoryIds);

    let payload: OverlayRequest = {
      name: values.name.trim(),
      icon: values.icon.trim() || undefined,
      startDate: values.startDate,
      endDate: values.endDate,
      inclusionMode: values.inclusionMode,
      totalCapAmount: values.hasTotalCap
        ? convertDisplayToCents(values.totalCapDisplayValue || 0)
        : null,
      categoryCaps: values.hasCategoryCaps
        ? categoryCapIds.map((categoryId) => ({
            categoryId,
            capAmount: convertDisplayToCents(values.categoryCapDisplayValues[categoryId] || 0),
          }))
        : [],
    };

    if (values.inclusionMode === 'rules') {
      payload = {
        ...payload,
        rules: {
          ...payload.rules,
          categoryIds: categoryRuleIds,
          vendorIds: vendorRuleIds,
          accountIds: accountRuleIds,
        },
      };
    }

    return payload;
  };

  const handleNext = async () => {
    const stepError = validateStep(currentStep);
    if (stepError) {
      setErrorMessage(stepError);
      return;
    }

    setErrorMessage(null);

    if (!isLastStep) {
      setActiveStep((current) => current + 1);
      return;
    }

    const payload = getPayload();

    try {
      if (overlay) {
        await updateMutation.mutateAsync({ id: overlay.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      notifications.show({
        color: 'green',
        title: t('common.success'),
        message: overlay
          ? t('overlays.modal.success.updated')
          : t('overlays.modal.success.created'),
      });

      onClose();
    } catch (error) {
      notifications.show({
        color: 'red',
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('overlays.modal.errors.saveFailed'),
      });
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setActiveStep((current) => Math.max(0, current - 1));
  };

  const stepContent =
    currentStep === 'basic' ? (
      <Stack gap="md">
        <TextInput
          label={t('overlays.modal.name')}
          placeholder={t('overlays.modal.namePlaceholder')}
          value={values.name}
          onChange={(event) => {
            const name = event.currentTarget.value;
            setValues((current) => ({ ...current, name }));
          }}
          required
          maxLength={80}
        />

        <TextInput
          label={t('overlays.modal.icon')}
          placeholder={t('overlays.modal.iconPlaceholder')}
          value={values.icon}
          onChange={(event) => {
            const icon = event.currentTarget.value;
            setValues((current) => ({ ...current, icon }));
          }}
          maxLength={8}
        />

        <Group grow align="flex-start">
          <TextInput
            type="date"
            label={t('overlays.modal.startDate')}
            value={values.startDate}
            onChange={(event) => {
              const startDate = event.currentTarget.value;
              setValues((current) => ({ ...current, startDate }));
            }}
            required
          />

          <TextInput
            type="date"
            label={t('overlays.modal.endDate')}
            value={values.endDate}
            onChange={(event) => {
              const endDate = event.currentTarget.value;
              setValues((current) => ({ ...current, endDate }));
            }}
            required
          />
        </Group>

        <Text size="sm" c="dimmed">
          {t('overlays.modal.basicInfoHint')}
        </Text>
      </Stack>
    ) : currentStep === 'inclusion' ? (
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('overlays.modal.inclusionHint')}
        </Text>

        <Group gap="sm" align="stretch" wrap="wrap">
          {(['manual', 'rules', 'all'] as const).map((mode) => (
            <Paper
              key={mode}
              withBorder
              p="md"
              radius="md"
              className={`${classes.modeCard} ${values.inclusionMode === mode ? classes.modeCardActive : ''}`}
              onClick={() => setValues((current) => ({ ...current, inclusionMode: mode }))}
              role="button"
              tabIndex={0}
            >
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text fw={700}>{t(`overlays.modes.${mode}`)}</Text>
                  {mode === 'manual' && (
                    <Badge size="xs" color="green" variant="light">
                      {t('overlays.modal.recommended')}
                    </Badge>
                  )}
                </Group>
                <Text size="sm" c="dimmed">
                  {t(`overlays.modal.modeDescriptions.${mode}`)}
                </Text>
              </Stack>
            </Paper>
          ))}
        </Group>
      </Stack>
    ) : currentStep === 'rules' ? (
      <Stack gap="md">
        <Alert color="cyan" variant="light" icon={<IconCircleCheck size={16} />}>
          {t('overlays.modal.rulesHint')}
        </Alert>

        <MultiSelect
          searchable
          clearable
          data={categoryOptions}
          label={t('overlays.modal.ruleCategories')}
          placeholder={t('overlays.modal.ruleCategoriesPlaceholder')}
          value={values.categoryRuleIds}
          onChange={(categoryRuleIds) => setValues((current) => ({ ...current, categoryRuleIds }))}
        />

        <MultiSelect
          searchable
          clearable
          data={vendorOptions}
          label={t('overlays.modal.ruleVendors')}
          placeholder={t('overlays.modal.ruleVendorsPlaceholder')}
          value={values.vendorRuleIds}
          onChange={(vendorRuleIds) => setValues((current) => ({ ...current, vendorRuleIds }))}
        />

        <MultiSelect
          searchable
          clearable
          data={accountOptions}
          label={t('overlays.modal.ruleAccounts')}
          placeholder={t('overlays.modal.ruleAccountsPlaceholder')}
          value={values.accountRuleIds}
          onChange={(accountRuleIds) => setValues((current) => ({ ...current, accountRuleIds }))}
        />
      </Stack>
    ) : currentStep === 'caps' ? (
      <Stack gap="md">
        <Switch
          checked={values.hasTotalCap}
          onChange={(event) => {
            const checked = (event.target as HTMLInputElement).checked;
            setValues((current) => ({ ...current, hasTotalCap: checked }));
          }}
          label={t('overlays.modal.totalCap')}
        />

        {values.hasTotalCap && (
          <NumberInput
            min={0}
            decimalScale={globalCurrency.decimalPlaces}
            fixedDecimalScale
            prefix={globalCurrency.symbol}
            value={values.totalCapDisplayValue}
            onChange={(value) =>
              setValues((current) => ({
                ...current,
                totalCapDisplayValue: Number(value) || 0,
              }))
            }
            label={t('overlays.modal.totalCapAmount')}
          />
        )}

        <Divider />

        <Switch
          checked={values.hasCategoryCaps}
          onChange={(event) => {
            const checked = (event.target as HTMLInputElement).checked;
            setValues((current) => ({ ...current, hasCategoryCaps: checked }));
          }}
          label={t('overlays.modal.categoryCaps')}
        />

        {values.hasCategoryCaps && (
          <Stack gap="sm">
            <MultiSelect
              searchable
              clearable
              data={categoryOptions}
              label={t('overlays.modal.capCategories')}
              placeholder={t('overlays.modal.capCategoriesPlaceholder')}
              value={values.categoryCapIds}
              onChange={(categoryCapIds) =>
                setValues((current) => ({
                  ...current,
                  categoryCapIds,
                  categoryCapDisplayValues: categoryCapIds.reduce<Record<string, number>>(
                    (acc, id) => {
                      acc[id] = current.categoryCapDisplayValues[id] ?? 0;
                      return acc;
                    },
                    {}
                  ),
                }))
              }
            />

            {categoryCapRows.map((row) => (
              <Group key={row.categoryId} grow className={classes.capRow}>
                <Text size="sm" fw={500}>
                  {row.label}
                </Text>
                <NumberInput
                  min={0}
                  decimalScale={globalCurrency.decimalPlaces}
                  fixedDecimalScale
                  prefix={globalCurrency.symbol}
                  value={row.amount}
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      categoryCapDisplayValues: {
                        ...current.categoryCapDisplayValues,
                        [row.categoryId]: Number(value) || 0,
                      },
                    }))
                  }
                />
              </Group>
            ))}
          </Stack>
        )}
      </Stack>
    ) : (
      <Stack gap="sm">
        <Paper withBorder radius="md" p="md" className={classes.reviewCard}>
          <Text fw={700}>
            {values.icon?.trim()
              ? `${values.icon.trim()} ${values.name.trim()}`
              : values.name.trim()}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {dayjs(values.startDate).format('MMM D, YYYY')} -{' '}
            {dayjs(values.endDate).format('MMM D, YYYY')}
          </Text>
          <Text size="sm" mt={8}>
            {t('overlays.modal.reviewInclusionMode', {
              mode: t(`overlays.modes.${values.inclusionMode}`),
            })}
          </Text>
        </Paper>

        {values.hasTotalCap && (
          <Text size="sm">
            {t('overlays.modal.reviewTotalCap', {
              amount: format(convertDisplayToCents(values.totalCapDisplayValue)),
            })}
          </Text>
        )}

        {values.hasCategoryCaps && (
          <Text size="sm">
            {t('overlays.modal.reviewCategoryCaps', { count: values.categoryCapIds.length })}
          </Text>
        )}

        {values.inclusionMode === 'rules' && (
          <Text size="sm" c="dimmed">
            {t('overlays.modal.reviewRules', {
              categories: values.categoryRuleIds.length,
              vendors: values.vendorRuleIds.length,
              accounts: values.accountRuleIds.length,
            })}
          </Text>
        )}
      </Stack>
    );

  const stepperContent = (
    <Stack gap="lg">
      {isEditMode && (
        <Alert variant="light" color="yellow" icon={<IconAlertTriangle size={16} />}>
          {t('overlays.modal.editWarning')}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="light" color="red" icon={<IconAlertTriangle size={16} />}>
          {errorMessage}
        </Alert>
      )}

      <Stepper active={activeStep} allowNextStepsSelect={false} iconPosition="right">
        {steps.map((step) => (
          <Stepper.Step key={step} label={t(`overlays.modal.steps.${step}.label`)}>
            {null}
          </Stepper.Step>
        ))}
      </Stepper>

      <div className={classes.stepContent}>{stepContent}</div>

      <Group justify="space-between" className={classes.actionsRow}>
        <Button
          variant="subtle"
          onClick={activeStep === 0 ? onClose : handleBack}
          disabled={isSubmitting}
        >
          {activeStep === 0 ? t('common.cancel') : t('common.back')}
        </Button>

        <Button
          onClick={handleNext}
          loading={isSubmitting}
          leftSection={
            isLastStep ? (
              isEditMode ? (
                <IconDeviceFloppy size={16} />
              ) : (
                <IconPlus size={16} />
              )
            ) : undefined
          }
        >
          {isLastStep
            ? isEditMode
              ? t('overlays.modal.save')
              : t('overlays.modal.create')
            : t('common.next')}
        </Button>
      </Group>
    </Stack>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="100%"
        title={isEditMode ? t('overlays.modal.editTitle') : t('overlays.modal.createTitle')}
      >
        {stepperContent}
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      title={isEditMode ? t('overlays.modal.editTitle') : t('overlays.modal.createTitle')}
    >
      {stepperContent}
    </Modal>
  );
}
