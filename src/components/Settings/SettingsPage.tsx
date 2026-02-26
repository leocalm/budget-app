import { useEffect, useRef, useState } from 'react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCalendar,
  IconDownload,
  IconEdit,
  IconKey,
  IconLock,
  IconRefresh,
  IconShieldCheck,
  IconShieldOff,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  PasswordInput,
  PinInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { disableTwoFactor, getTwoFactorStatus } from '@/api/twoFactor';
import { useAuth } from '@/context/AuthContext';
import { useCurrencies } from '@/hooks/useCurrencies';
import {
  useChangePassword,
  useDeleteAccount,
  usePeriodModel,
  usePreferences,
  useProfile,
  useResetStructure,
  useRevokeSession,
  useSessions,
  useSettings,
  useUpdatePeriodModel,
  useUpdatePreferences,
  useUpdateProfile,
  useUpdateSettings,
} from '@/hooks/useSettings';
import { toast } from '@/lib/toast';
import {
  DateFormat,
  Language,
  LANGUAGE_DISPLAY_NAMES,
  NumberFormat,
  PeriodMode,
  PeriodModelRequest,
  Theme,
  WeekendAdjustment,
} from '@/types/settings';
import { TwoFactorSetup } from './TwoFactorSetup';

const LABEL_WIDTH = 140;

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Group gap="sm" wrap="nowrap">
      <Text size="sm" c="dimmed" style={{ minWidth: LABEL_WIDTH, flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="sm" fw={500}>
        {value || '—'}
      </Text>
    </Group>
  );
}

export function SettingsPage() {
  const { setColorScheme } = useMantineColorScheme();
  const { user, logout } = useAuth();
  const { i18n, t } = useTranslation();
  const queryClient = useQueryClient();

  // Queries
  const settingsQuery = useSettings();
  const profileQuery = useProfile();
  const preferencesQuery = usePreferences();
  const sessionsQuery = useSessions();
  const periodModelQuery = usePeriodModel();
  const currenciesQuery = useCurrencies();
  const twoFactorStatusQuery = useQuery({
    queryKey: ['twoFactorStatus'],
    queryFn: getTwoFactorStatus,
  });

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const updatePreferencesMutation = useUpdatePreferences();
  const updateSettingsMutation = useUpdateSettings();
  const changePasswordMutation = useChangePassword();
  const revokeSessionMutation = useRevokeSession();
  const updatePeriodModelMutation = useUpdatePeriodModel();
  const resetStructureMutation = useResetStructure();
  const deleteAccountMutation = useDeleteAccount();

  const disableTwoFactorMutation = useMutation({
    mutationFn: ({ password, code }: { password: string; code: string }) =>
      disableTwoFactor(password, code),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
      setDisableModalOpened(false);
      setDisablePassword('');
      setDisableCode('');
      toast.success({ title: t('common.success'), message: 'Two-factor authentication disabled' });
    },
    onError: (error: Error) => {
      toast.error({
        title: t('common.error'),
        message: error.message || 'Failed to disable 2FA',
        nonCritical: true,
      });
    },
  });

  // Modal open states
  const [profileModalOpened, setProfileModalOpened] = useState(false);
  const [passwordModalOpened, setPasswordModalOpened] = useState(false);
  const [periodModalOpened, setPeriodModalOpened] = useState(false);
  const [setupModalOpened, setSetupModalOpened] = useState(false);
  const [disableModalOpened, setDisableModalOpened] = useState(false);
  const [resetModalOpened, setResetModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editTimezone, setEditTimezone] = useState('UTC');
  const [editCurrencyId, setEditCurrencyId] = useState<string | null>(null);

  // Preferences inline state
  const [theme, setTheme] = useState<Theme>('auto');
  const [dateFormat, setDateFormat] = useState<DateFormat>('DD/MM/YYYY');
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('1,234.56');
  const [compactMode, setCompactMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const hasInitializedPreferences = useRef(false);
  const hasInitializedLanguage = useRef(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Period model edit state
  const [editPeriodMode, setEditPeriodMode] = useState<PeriodMode>('manual');
  const [editStartDay, setEditStartDay] = useState<number>(1);
  const [editDurationValue, setEditDurationValue] = useState<number>(1);
  const [editDurationUnit, setEditDurationUnit] = useState('months');
  const [editGenerateAhead, setEditGenerateAhead] = useState<number>(6);
  const [editSaturdayAdjustment, setEditSaturdayAdjustment] = useState<WeekendAdjustment>('keep');
  const [editSundayAdjustment, setEditSundayAdjustment] = useState<WeekendAdjustment>('keep');
  const [editNamePattern, setEditNamePattern] = useState('{MONTH} {YEAR}');

  // 2FA disable state
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');

  // Danger zone state
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Init preferences from query
  useEffect(() => {
    if (preferencesQuery.data && !hasInitializedPreferences.current) {
      setTheme(preferencesQuery.data.theme);
      setDateFormat(preferencesQuery.data.dateFormat);
      setNumberFormat(preferencesQuery.data.numberFormat);
      setCompactMode(preferencesQuery.data.compactMode);
      setColorScheme(preferencesQuery.data.theme);
      hasInitializedPreferences.current = true;
    }
  }, [preferencesQuery.data, setColorScheme]);

  useEffect(() => {
    if (settingsQuery.data && !hasInitializedLanguage.current) {
      setLanguage(settingsQuery.data.language);
      hasInitializedLanguage.current = true;
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    if (updatePreferencesMutation.isSuccess) {
      hasInitializedPreferences.current = false;
    }
  }, [updatePreferencesMutation.isSuccess]);

  useEffect(() => {
    if (updateSettingsMutation.isSuccess) {
      hasInitializedLanguage.current = false;
    }
  }, [updateSettingsMutation.isSuccess]);

  // --- Handlers ---

  const openProfileModal = () => {
    setEditName(profileQuery.data?.name ?? user?.name ?? '');
    setEditTimezone(profileQuery.data?.timezone ?? 'UTC');
    setEditCurrencyId(profileQuery.data?.defaultCurrencyId ?? null);
    setProfileModalOpened(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: editName,
        timezone: editTimezone,
        defaultCurrencyId: editCurrencyId,
      });
      setProfileModalOpened(false);
      toast.success({
        title: t('common.success'),
        message: t('settings.notifications.profile.success'),
      });
    } catch {
      toast.error({
        title: t('common.error'),
        message: t('settings.notifications.profile.error'),
        nonCritical: true,
      });
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferencesMutation.mutateAsync({ theme, dateFormat, numberFormat, compactMode });
      if (settingsQuery.data && settingsQuery.data.language !== language) {
        await updateSettingsMutation.mutateAsync({ language });
      }
      toast.success({
        title: t('common.success'),
        message: t('settings.notifications.preferences.success'),
      });
    } catch {
      toast.error({
        title: t('common.error'),
        message: t('settings.notifications.preferences.error'),
        nonCritical: true,
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error({
        title: t('common.error'),
        message: t('settings.security.passwordsDoNotMatch'),
        nonCritical: true,
      });
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setPasswordModalOpened(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success({
        title: t('common.success'),
        message: t('settings.notifications.password.success'),
      });
    } catch {
      toast.error({
        title: t('common.error'),
        message: t('settings.notifications.password.error'),
        nonCritical: true,
      });
    }
  };

  const openPeriodModal = () => {
    const data = periodModelQuery.data;
    if (data) {
      setEditPeriodMode(data.periodMode);
      const s = data.periodSchedule;
      if (s) {
        setEditStartDay(s.startDay);
        setEditDurationValue(s.durationValue);
        setEditDurationUnit(s.durationUnit);
        setEditGenerateAhead(s.generateAhead);
        setEditSaturdayAdjustment(s.saturdayAdjustment);
        setEditSundayAdjustment(s.sundayAdjustment);
        setEditNamePattern(s.namePattern);
      }
    }
    setPeriodModalOpened(true);
  };

  const handleSavePeriodModel = async () => {
    const payload: PeriodModelRequest = {
      periodMode: editPeriodMode,
      ...(editPeriodMode === 'automatic' && {
        periodSchedule: {
          startDay: editStartDay,
          durationValue: editDurationValue,
          durationUnit: editDurationUnit,
          generateAhead: editGenerateAhead,
          saturdayAdjustment: editSaturdayAdjustment,
          sundayAdjustment: editSundayAdjustment,
          namePattern: editNamePattern,
        },
      }),
    };
    try {
      await updatePeriodModelMutation.mutateAsync(payload);
      setPeriodModalOpened(false);
      toast.success({
        title: t('common.success'),
        message: t('settings.notifications.periodModel.success'),
      });
    } catch {
      toast.error({
        title: t('common.error'),
        message: t('settings.notifications.periodModel.error'),
        nonCritical: true,
      });
    }
  };

  const handleResetStructure = async () => {
    try {
      await resetStructureMutation.mutateAsync();
      setResetModalOpened(false);
      setResetConfirmText('');
      toast.success({
        title: t('common.success'),
        message: t('settings.notifications.resetStructure.success'),
      });
    } catch {
      toast.error({
        title: t('common.error'),
        message: t('settings.notifications.resetStructure.error'),
        nonCritical: true,
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      logout();
    } catch {
      toast.error({
        title: t('common.error'),
        message: t('settings.notifications.deleteAccount.error'),
        nonCritical: true,
      });
    }
  };

  // --- Derived values ---

  const avatarInitials =
    (profileQuery.data?.name ?? user?.name)
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'U';

  const currencyOptions =
    currenciesQuery.data?.map((c) => ({
      value: c.id,
      label: `${t(`currencies.${c.currency}`, { defaultValue: c.name })} (${c.symbol})`,
    })) ?? [];

  const timezoneOptions = Intl.supportedValuesOf('timeZone').map((tz) => ({
    value: tz,
    label: tz,
  }));

  const profileCurrencyLabel =
    currenciesQuery.data?.find((c) => c.id === profileQuery.data?.defaultCurrencyId)?.symbol ??
    null;

  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'light', label: t('settings.preferences.themeOptions.light') },
    { value: 'dark', label: t('settings.preferences.themeOptions.dark') },
    { value: 'auto', label: t('settings.preferences.themeOptions.auto') },
  ];

  const dateFormatOptions: { value: DateFormat; label: string }[] = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const numberFormatOptions: { value: NumberFormat; label: string }[] = [
    { value: '1,234.56', label: '1,234.56' },
    { value: '1.234,56', label: '1.234,56' },
    { value: '1 234.56', label: '1 234.56' },
  ];

  const languageOptions = Object.entries(LANGUAGE_DISPLAY_NAMES).map(([code, name]) => ({
    value: code,
    label: name,
  }));

  const weekendRuleOptions: { value: WeekendAdjustment; label: string }[] = [
    { value: 'keep', label: t('settings.periodModel.weekendRules.keep') },
    { value: 'friday', label: t('settings.periodModel.weekendRules.friday') },
    { value: 'monday', label: t('settings.periodModel.weekendRules.monday') },
  ];

  const durationUnitOptions = [
    { value: 'days', label: t('settings.periodModel.durationUnits.days') },
    { value: 'weeks', label: t('settings.periodModel.durationUnits.weeks') },
    { value: 'months', label: t('settings.periodModel.durationUnits.months') },
  ];

  const periodModeOptions: { value: PeriodMode; label: string }[] = [
    { value: 'automatic', label: t('settings.periodModel.modeAutomatic') },
    { value: 'manual', label: t('settings.periodModel.modeManual') },
  ];

  return (
    <Container size="lg">
      <Stack gap="xl">
        <div>
          <Title order={2}>{t('settings.pageTitle')}</Title>
          <Text c="dimmed">{t('settings.pageDescription')}</Text>
        </div>

        {/* ─── Profile ─── */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={4} mb={4}>
                  {t('settings.profile.title')}
                </Title>
                <Text c="dimmed" size="sm">
                  {t('settings.profile.description')}
                </Text>
              </div>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconEdit size={16} />}
                onClick={openProfileModal}
                disabled={profileQuery.isLoading}
              >
                {t('settings.profile.editButton')}
              </Button>
            </Group>

            {profileQuery.isLoading && <Loader size="sm" />}

            {profileQuery.data && (
              <Group align="flex-start" gap="xl">
                <Avatar size={56} radius={56} color="cyan">
                  {avatarInitials}
                </Avatar>
                <Stack gap="xs">
                  <InfoRow label={t('settings.profile.nameLabel')} value={profileQuery.data.name} />
                  <InfoRow
                    label={t('settings.profile.emailLabel')}
                    value={profileQuery.data.email}
                  />
                  <InfoRow
                    label={t('settings.profile.timezoneLabel')}
                    value={profileQuery.data.timezone}
                  />
                  <InfoRow
                    label={t('settings.profile.currencyLabel')}
                    value={profileCurrencyLabel}
                  />
                </Stack>
              </Group>
            )}
          </Stack>
        </Paper>

        {/* ─── Security ─── */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb={4}>
                {t('settings.security.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('settings.security.description')}
              </Text>
            </div>

            {/* Password */}
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  {t('settings.security.passwordLabel')}
                </Text>
                <Text size="sm" c="dimmed">
                  ••••••••
                </Text>
              </div>
              <Button
                variant="default"
                size="sm"
                leftSection={<IconKey size={16} />}
                onClick={() => setPasswordModalOpened(true)}
              >
                {t('settings.security.changePasswordButton')}
              </Button>
            </Group>

            <Divider />

            {/* Two-Factor Auth */}
            <Group justify="space-between">
              <Group gap="sm">
                <Text size="sm" fw={500}>
                  {t('settings.security.twoFactorLabel')}
                </Text>
                {twoFactorStatusQuery.data?.enabled ? (
                  <Badge color="green" size="sm" leftSection={<IconShieldCheck size={12} />}>
                    {t('settings.security.twoFactorEnabled')}
                  </Badge>
                ) : (
                  <Badge color="gray" size="sm" leftSection={<IconShieldOff size={12} />}>
                    {t('settings.security.twoFactorDisabled')}
                  </Badge>
                )}
              </Group>
              {twoFactorStatusQuery.data && !twoFactorStatusQuery.data.enabled && (
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<IconLock size={16} />}
                  onClick={() => setSetupModalOpened(true)}
                >
                  {t('settings.security.enableTwoFactorButton')}
                </Button>
              )}
              {twoFactorStatusQuery.data?.enabled && (
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconShieldOff size={16} />}
                  onClick={() => setDisableModalOpened(true)}
                >
                  {t('settings.security.disableTwoFactorButton')}
                </Button>
              )}
            </Group>

            <Divider />

            {/* Sessions */}
            <div>
              <Text size="sm" fw={500} mb="sm">
                {t('settings.security.sessionsTitle')}
              </Text>

              {sessionsQuery.isLoading && <Loader size="sm" />}

              {sessionsQuery.data?.length === 0 && (
                <Text size="sm" c="dimmed">
                  {t('settings.security.noSessions')}
                </Text>
              )}

              <Stack gap="xs">
                {sessionsQuery.data?.map((session) => (
                  <Group
                    key={session.id}
                    justify="space-between"
                    p="sm"
                    style={{
                      borderRadius: 8,
                      background: 'var(--mantine-color-default-hover)',
                    }}
                  >
                    <div>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>
                          {session.deviceLabel}
                        </Text>
                        {session.isCurrent && (
                          <Badge size="xs" color="blue">
                            {t('settings.security.sessionCurrent')}
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {session.country} ·{' '}
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          dateStyle: 'medium',
                        })}
                      </Text>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="light"
                        color="red"
                        size="xs"
                        loading={revokeSessionMutation.isPending}
                        onClick={() => revokeSessionMutation.mutate(session.id)}
                      >
                        {t('settings.security.revokeButton')}
                      </Button>
                    )}
                  </Group>
                ))}
              </Stack>
            </div>
          </Stack>
        </Paper>

        {/* ─── Period Model ─── */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={4} mb={4}>
                  {t('settings.periodModel.title')}
                </Title>
                <Text c="dimmed" size="sm">
                  {t('settings.periodModel.description')}
                </Text>
              </div>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconCalendar size={16} />}
                onClick={openPeriodModal}
                disabled={periodModelQuery.isLoading}
              >
                {t('settings.periodModel.editButton')}
              </Button>
            </Group>

            {periodModelQuery.isLoading && <Loader size="sm" />}

            {periodModelQuery.data && (
              <Stack gap="xs">
                <Group gap="sm" wrap="nowrap">
                  <Text size="sm" c="dimmed" style={{ minWidth: LABEL_WIDTH, flexShrink: 0 }}>
                    {t('settings.periodModel.modeLabel')}
                  </Text>
                  <Badge
                    color={periodModelQuery.data.periodMode === 'automatic' ? 'teal' : 'gray'}
                    variant="light"
                  >
                    {periodModelQuery.data.periodMode === 'automatic'
                      ? t('settings.periodModel.modeAutomatic')
                      : t('settings.periodModel.modeManual')}
                  </Badge>
                </Group>

                {periodModelQuery.data.periodMode === 'automatic' &&
                  periodModelQuery.data.periodSchedule && (
                    <>
                      <InfoRow
                        label={t('settings.periodModel.startDayLabel')}
                        value={String(periodModelQuery.data.periodSchedule.startDay)}
                      />
                      <InfoRow
                        label={t('settings.periodModel.durationLabel')}
                        value={`${periodModelQuery.data.periodSchedule.durationValue} ${periodModelQuery.data.periodSchedule.durationUnit}`}
                      />
                      <InfoRow
                        label={t('settings.periodModel.generateAheadLabel')}
                        value={`${periodModelQuery.data.periodSchedule.generateAhead} ${t('settings.periodModel.periods')}`}
                      />
                      <InfoRow
                        label={t('settings.periodModel.namePatternLabel')}
                        value={periodModelQuery.data.periodSchedule.namePattern}
                      />
                    </>
                  )}

                {periodModelQuery.data.periodMode === 'manual' && (
                  <Text size="sm" c="dimmed">
                    {t('settings.periodModel.noSchedule')}
                  </Text>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* ─── Preferences ─── */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb={4}>
                {t('settings.preferences.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('settings.preferences.description')}
              </Text>
            </div>

            {preferencesQuery.isLoading ? (
              <Loader size="sm" />
            ) : (
              <>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      {t('settings.preferences.themeLabel')}
                    </Text>
                  </div>
                  <Select
                    data={themeOptions}
                    value={theme}
                    onChange={(value) => {
                      const next = (value ?? 'auto') as Theme;
                      setTheme(next);
                      setColorScheme(next);
                    }}
                    w={200}
                    size="sm"
                  />
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {t('settings.preferences.dateFormatLabel')}
                  </Text>
                  <Select
                    data={dateFormatOptions}
                    value={dateFormat}
                    onChange={(value) => setDateFormat((value ?? 'DD/MM/YYYY') as DateFormat)}
                    w={200}
                    size="sm"
                  />
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {t('settings.preferences.numberFormatLabel')}
                  </Text>
                  <Select
                    data={numberFormatOptions}
                    value={numberFormat}
                    onChange={(value) => setNumberFormat((value ?? '1,234.56') as NumberFormat)}
                    w={200}
                    size="sm"
                  />
                </Group>

                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      {t('settings.preferences.compactModeLabel')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('settings.preferences.compactModeDescription')}
                    </Text>
                  </div>
                  <Switch
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.currentTarget.checked)}
                  />
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {t('settings.preferences.languageLabel')}
                  </Text>
                  <Select
                    data={languageOptions}
                    value={language}
                    onChange={(value) => setLanguage((value ?? 'en') as Language)}
                    w={200}
                    size="sm"
                  />
                </Group>

                <Group justify="flex-end">
                  <Button
                    onClick={handleSavePreferences}
                    loading={
                      updatePreferencesMutation.isPending || updateSettingsMutation.isPending
                    }
                  >
                    {t('settings.preferences.saveButton')}
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Paper>

        {/* ─── Data & Export ─── */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb={4}>
                {t('settings.dataExport.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('settings.dataExport.description')}
              </Text>
            </div>

            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  {t('settings.dataExport.exportCsvButton')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('settings.dataExport.exportCsvDescription')}
                </Text>
              </div>
              <Button
                variant="default"
                size="sm"
                leftSection={<IconDownload size={16} />}
                disabled
                title={t('settings.dataExport.comingSoon')}
              >
                CSV
              </Button>
            </Group>

            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  {t('settings.dataExport.exportJsonButton')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('settings.dataExport.exportJsonDescription')}
                </Text>
              </div>
              <Button
                variant="default"
                size="sm"
                leftSection={<IconDownload size={16} />}
                disabled
                title={t('settings.dataExport.comingSoon')}
              >
                JSON
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* ─── Danger Zone ─── */}
        <Paper withBorder radius="md" p="xl" style={{ borderColor: 'var(--mantine-color-red-4)' }}>
          <Stack gap="lg">
            <Group gap="sm">
              <IconAlertTriangle size={20} color="var(--mantine-color-red-6)" />
              <div>
                <Title order={4} mb={4} c="red">
                  {t('settings.dangerZone.title')}
                </Title>
                <Text c="dimmed" size="sm">
                  {t('settings.dangerZone.description')}
                </Text>
              </div>
            </Group>

            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  {t('settings.dangerZone.resetStructureButton')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('settings.dangerZone.resetStructureDescription')}
                </Text>
              </div>
              <Button
                color="orange"
                variant="light"
                size="sm"
                leftSection={<IconRefresh size={16} />}
                onClick={() => setResetModalOpened(true)}
              >
                {t('settings.dangerZone.resetStructureButton')}
              </Button>
            </Group>

            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  {t('settings.dangerZone.deleteAccountButton')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('settings.dangerZone.deleteAccountDescription')}
                </Text>
              </div>
              <Button
                color="red"
                variant="light"
                size="sm"
                leftSection={<IconTrash size={16} />}
                onClick={() => setDeleteModalOpened(true)}
              >
                {t('settings.dangerZone.deleteAccountButton')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>

      {/* ─── Edit Profile Modal ─── */}
      <Modal
        opened={profileModalOpened}
        onClose={() => setProfileModalOpened(false)}
        title={t('settings.profile.title')}
      >
        <Stack gap="md">
          <TextInput
            label={t('settings.profile.fullNameLabel')}
            placeholder={t('settings.profile.fullNamePlaceholder')}
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value)}
          />
          <Select
            label={t('settings.profile.timezoneLabel')}
            placeholder={t('settings.profile.timezonePlaceholder')}
            data={timezoneOptions}
            value={editTimezone}
            onChange={(value) => setEditTimezone(value ?? 'UTC')}
            searchable
            maxDropdownHeight={250}
          />
          <Select
            label={t('settings.profile.currencyLabel')}
            placeholder={t('settings.profile.currencyPlaceholder')}
            data={
              currencyOptions.length > 0
                ? currencyOptions
                : [{ value: '', label: t('settings.profile.noCurrencies'), disabled: true }]
            }
            value={editCurrencyId}
            onChange={setEditCurrencyId}
            clearable
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setProfileModalOpened(false)}>
              {t('settings.profile.cancelButton')}
            </Button>
            <Button
              onClick={handleSaveProfile}
              loading={updateProfileMutation.isPending}
              disabled={!editName.trim()}
            >
              {t('settings.profile.saveButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ─── Change Password Modal ─── */}
      <Modal
        opened={passwordModalOpened}
        onClose={() => {
          setPasswordModalOpened(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}
        title={t('settings.security.changePasswordButton')}
      >
        <Stack gap="md">
          <PasswordInput
            label={t('settings.security.currentPasswordLabel')}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label={t('settings.security.newPasswordLabel')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label={t('settings.security.confirmPasswordLabel')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            required
            error={
              confirmPassword && newPassword !== confirmPassword
                ? t('settings.security.passwordsDoNotMatch')
                : undefined
            }
          />
          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              onClick={() => {
                setPasswordModalOpened(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              {t('settings.security.cancelButton')}
            </Button>
            <Button
              onClick={handleChangePassword}
              loading={changePasswordMutation.isPending}
              disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
            >
              {t('settings.security.saveButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ─── Disable 2FA Modal ─── */}
      <Modal
        opened={disableModalOpened}
        onClose={() => {
          setDisableModalOpened(false);
          setDisablePassword('');
          setDisableCode('');
        }}
        title={t('settings.security.disableTwoFactorButton')}
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} title={t('common.warning')} color="red">
            Disabling two-factor authentication will make your account less secure.
          </Alert>
          <PasswordInput
            label={t('settings.security.currentPasswordLabel')}
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.currentTarget.value)}
            required
          />
          <div>
            <Text size="sm" mb="xs">
              Two-Factor Code
            </Text>
            <PinInput
              length={6}
              value={disableCode}
              onChange={setDisableCode}
              placeholder=""
              type="number"
              size="md"
            />
          </div>
          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              onClick={() => {
                setDisableModalOpened(false);
                setDisablePassword('');
                setDisableCode('');
              }}
            >
              {t('settings.security.cancelButton')}
            </Button>
            <Button
              color="red"
              onClick={() =>
                disableTwoFactorMutation.mutate({ password: disablePassword, code: disableCode })
              }
              loading={disableTwoFactorMutation.isPending}
              disabled={!disablePassword || disableCode.length !== 6}
            >
              {t('settings.security.disableTwoFactorButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ─── Period Model Modal ─── */}
      <Modal
        opened={periodModalOpened}
        onClose={() => setPeriodModalOpened(false)}
        title={t('settings.periodModel.title')}
        size="md"
      >
        <Stack gap="md">
          <Select
            label={t('settings.periodModel.modeLabel')}
            data={periodModeOptions}
            value={editPeriodMode}
            onChange={(value) => setEditPeriodMode((value ?? 'manual') as PeriodMode)}
          />

          {editPeriodMode === 'automatic' && (
            <>
              <NumberInput
                label={t('settings.periodModel.startDayLabel')}
                value={editStartDay}
                onChange={(value) => setEditStartDay(Number(value) || 1)}
                min={1}
                max={28}
              />
              <Group grow>
                <NumberInput
                  label={t('settings.periodModel.durationLabel')}
                  value={editDurationValue}
                  onChange={(value) => setEditDurationValue(Number(value) || 1)}
                  min={1}
                />
                <Select
                  label=" "
                  data={durationUnitOptions}
                  value={editDurationUnit}
                  onChange={(value) => setEditDurationUnit(value ?? 'months')}
                />
              </Group>
              <NumberInput
                label={t('settings.periodModel.generateAheadLabel')}
                value={editGenerateAhead}
                onChange={(value) => setEditGenerateAhead(Number(value) || 1)}
                min={1}
                max={24}
              />
              <Select
                label={t('settings.periodModel.saturdayRuleLabel')}
                data={weekendRuleOptions}
                value={editSaturdayAdjustment}
                onChange={(value) =>
                  setEditSaturdayAdjustment((value ?? 'keep') as WeekendAdjustment)
                }
              />
              <Select
                label={t('settings.periodModel.sundayRuleLabel')}
                data={weekendRuleOptions}
                value={editSundayAdjustment}
                onChange={(value) =>
                  setEditSundayAdjustment((value ?? 'keep') as WeekendAdjustment)
                }
              />
              <TextInput
                label={t('settings.periodModel.namePatternLabel')}
                value={editNamePattern}
                onChange={(e) => setEditNamePattern(e.currentTarget.value)}
                placeholder="{MONTH} {YEAR}"
              />
            </>
          )}

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setPeriodModalOpened(false)}>
              {t('settings.periodModel.cancelButton')}
            </Button>
            <Button onClick={handleSavePeriodModel} loading={updatePeriodModelMutation.isPending}>
              {t('settings.periodModel.saveButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ─── Reset Structure Confirmation Modal ─── */}
      <Modal
        opened={resetModalOpened}
        onClose={() => {
          setResetModalOpened(false);
          setResetConfirmText('');
        }}
        title={t('settings.dangerZone.resetConfirmTitle')}
      >
        <Stack gap="md">
          <Alert icon={<IconAlertTriangle size={16} />} color="orange">
            {t('settings.dangerZone.resetConfirmMessage')}
          </Alert>
          <TextInput
            label={t('settings.dangerZone.resetConfirmPrompt')}
            placeholder={t('settings.dangerZone.resetConfirmPlaceholder')}
            value={resetConfirmText}
            onChange={(e) => setResetConfirmText(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setResetModalOpened(false);
                setResetConfirmText('');
              }}
            >
              {t('settings.dangerZone.cancelButton')}
            </Button>
            <Button
              color="orange"
              onClick={handleResetStructure}
              loading={resetStructureMutation.isPending}
              disabled={resetConfirmText !== 'RESET'}
            >
              {t('settings.dangerZone.resetStructureButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ─── Delete Account Confirmation Modal ─── */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setDeleteConfirmText('');
        }}
        title={t('settings.dangerZone.deleteConfirmTitle')}
      >
        <Stack gap="md">
          <Alert icon={<IconAlertTriangle size={16} />} color="red">
            {t('settings.dangerZone.deleteConfirmMessage')}
          </Alert>
          <TextInput
            label={t('settings.dangerZone.deleteConfirmPrompt')}
            placeholder={t('settings.dangerZone.deleteConfirmPlaceholder')}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setDeleteModalOpened(false);
                setDeleteConfirmText('');
              }}
            >
              {t('settings.dangerZone.cancelButton')}
            </Button>
            <Button
              color="red"
              onClick={handleDeleteAccount}
              loading={deleteAccountMutation.isPending}
              disabled={deleteConfirmText !== 'DELETE'}
            >
              {t('settings.dangerZone.deleteAccountButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ─── 2FA Setup Modal ─── */}
      <TwoFactorSetup
        opened={setupModalOpened}
        onClose={() => setSetupModalOpened(false)}
        onSuccess={async () => {
          await queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
        }}
      />
    </Container>
  );
}
