import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Modal,
  PasswordInput,
  PinInput,
  Select,
  Switch,
  Text,
  TextInput,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { TwoFactorSetupModal } from '@/components/v2/Settings/TwoFactorSetupModal';
import { useAuth } from '@/context/AuthContext';
import { useAccounts } from '@/hooks/v2/useAccounts';
import {
  useChangePassword,
  useDeleteUserAccount,
  useExportFull,
  useExportTransactions,
  usePreferences,
  useProfile,
  useUpdatePreferences,
  useUpdateProfile,
} from '@/hooks/v2/useSettings';
import { useDisableTwoFactor, useTwoFactorStatus } from '@/hooks/v2/useTwoFactor';
import { toast } from '@/lib/toast';
import { useV2Theme } from '@/theme/v2';
import { themes, type ColorTheme } from '@/theme/v2/tokens';
import classes from './Settings.module.css';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AVATAR_OPTIONS = [
  { emoji: '\u{1F437}', key: 'pig' },
  { emoji: '\u{1F60E}', key: 'cool' },
  { emoji: '\u{1F4DA}', key: 'books' },
  { emoji: '\u{1F634}', key: 'sleepy' },
  { emoji: '\u{1F9E3}', key: 'scarf' },
  { emoji: '\u{1F3A7}', key: 'headphones' },
  { emoji: '\u{1F609}', key: 'wink' },
  { emoji: '\u{1F3A9}', key: 'topHat' },
];

// Widget ID → translation key mapping
const WIDGET_KEY_MAP: Record<string, string> = {
  current_period: 'currentPeriod',
  net_position: 'netPosition',
  variable_categories: 'variableCategories',
  recent_transactions: 'recentTransactions',
  cash_flow: 'cashFlow',
  spending_trend: 'spendingTrend',
  fixed_categories: 'fixedCategories',
  subscriptions: 'subscriptions',
  budget_stability: 'budgetStability',
  top_vendors: 'topVendors',
};

const WIDGET_DEFINITIONS = [
  { id: 'current_period', emoji: '\u{1F4CA}', defaultVisible: true },
  { id: 'net_position', emoji: '\u{1F4B0}', defaultVisible: true },
  { id: 'variable_categories', emoji: '\u{1F4CB}', defaultVisible: true },
  { id: 'recent_transactions', emoji: '\u{1F9FE}', defaultVisible: true },
  { id: 'cash_flow', emoji: '\u{1F4B8}', defaultVisible: true },
  { id: 'spending_trend', emoji: '\u{1F4C8}', defaultVisible: false },
  { id: 'fixed_categories', emoji: '\u2705', defaultVisible: false },
  { id: 'subscriptions', emoji: '\u{1F504}', defaultVisible: false },
  { id: 'budget_stability', emoji: '\u{1F4CA}', defaultVisible: false },
  { id: 'top_vendors', emoji: '\u{1F3EA}', defaultVisible: false },
];

const SECTIONS: readonly { id: string; tabKey: string; danger?: boolean }[] = [
  { id: 'profile', tabKey: 'settings.tabs.profile' },
  { id: 'appearance', tabKey: 'settings.tabs.appearance' },
  { id: 'dashboard', tabKey: 'settings.tabs.dashboard' },
  { id: 'security', tabKey: 'settings.tabs.security' },
  { id: 'data', tabKey: 'settings.tabs.data' },
  { id: 'danger', tabKey: 'settings.tabs.dangerZone', danger: true },
];

const COLOR_SCHEMES = [
  { value: 'dark' as const, emoji: '\u{1F319}', key: 'dark' },
  { value: 'light' as const, emoji: '\u2600\uFE0F', key: 'light' },
  { value: 'system' as const, emoji: '\u{1F4BB}', key: 'system' },
];

const THEME_ORDER: ColorTheme[] = [
  'nebula',
  'sunrise',
  'sage_stone',
  'deep_ocean',
  'warm_rose',
  'moonlit',
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function SettingsV2Page() {
  const { t, i18n } = useTranslation('v2');
  const { user, logout } = useAuth();
  const { colorTheme, setColorTheme } = useV2Theme();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // ── API hooks ──
  const profileQuery = useProfile();
  const preferencesQuery = usePreferences();
  const accountsQuery = useAccounts();
  const twoFactorQuery = useTwoFactorStatus();
  const updateProfileMut = useUpdateProfile();
  const updatePrefsMut = useUpdatePreferences();
  const changePasswordMut = useChangePassword();
  const exportTransactionsMut = useExportTransactions();
  const exportFullMut = useExportFull();
  const deleteAccountMut = useDeleteUserAccount();
  const disableTwoFactorMut = useDisableTwoFactor();

  // ── Local state (profile form) ──
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('\u{1F437}');
  const [currency, setCurrency] = useState('');
  const [profileDirty, setProfileDirty] = useState(false);

  // ── Local state (appearance) ──
  const [scheme, setScheme] = useState<'dark' | 'light' | 'system'>(
    colorScheme === 'auto' ? 'system' : (colorScheme as 'dark' | 'light') || 'dark'
  );
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState<'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'>(
    'DD/MM/YYYY'
  );
  const [numberFormat, setNumberFormat] = useState<'1,234.56' | '1.234,56' | '1 234,56'>(
    '1,234.56'
  );
  const [compactMode, setCompactMode] = useState(false);

  // ── Local state (dashboard widgets) ──
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  // null = show all active accounts (default); string[] = show only these account IDs
  const [visibleAccountIds, setVisibleAccountIds] = useState<string[] | null>(null);

  // ── Local state (security modals) ──
  const [passwordModalOpen, passwordModal] = useDisclosure(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [disable2faModalOpen, disable2faModal] = useDisclosure(false);
  const [disable2faCode, setDisable2faCode] = useState('');
  const [setup2faModalOpen, setup2faModal] = useDisclosure(false);

  const [deleteModalOpen, deleteModal] = useDisclosure(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

  // ── Scroll-spy ──
  const [activeSection, setActiveSection] = useState('profile');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    for (const section of SECTIONS) {
      const el = sectionRefs.current[section.id];
      if (el) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  // ── Hydrate form from API data ──
  useEffect(() => {
    if (profileQuery.data) {
      setDisplayName(profileQuery.data.name ?? '');
      setCurrency(profileQuery.data.currency ?? '');
      setAvatar(profileQuery.data.avatar ?? '\u{1F437}');
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (preferencesQuery.data) {
      const prefs = preferencesQuery.data;
      const themeVal = prefs.theme ?? 'dark';
      setScheme(themeVal === 'system' ? 'system' : (themeVal as 'dark' | 'light'));
      setLanguage(prefs.language ?? 'en');
      void i18n.changeLanguage(prefs.language ?? 'en');
      setDateFormat(prefs.dateFormat ?? 'DD/MM/YYYY');
      setNumberFormat(prefs.numberFormat ?? '1,234.56');
      setCompactMode(prefs.compactMode ?? false);
      if (prefs.colorTheme) {
        setColorTheme(prefs.colorTheme as ColorTheme);
      }
      if (prefs.dashboardLayout) {
        setHiddenWidgets(prefs.dashboardLayout.hiddenWidgets ?? []);
        setWidgetOrder(prefs.dashboardLayout.widgetOrder ?? []);
        setVisibleAccountIds(prefs.dashboardLayout.visibleAccountIds ?? null);
      }
    }
  }, [preferencesQuery.data, setColorTheme]);

  // ── Handlers ──
  const scrollToSection = useCallback((id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSaveProfile = useCallback(async () => {
    try {
      await updateProfileMut.mutateAsync({
        name: displayName,
        currency,
        avatar,
      });
      setProfileDirty(false);
      toast.success({ message: t('settings.profile.saved') });
    } catch {
      toast.error({ message: t('settings.profile.saveFailed') });
    }
  }, [displayName, currency, avatar, updateProfileMut]);

  const handleSchemeChange = useCallback(
    async (value: 'dark' | 'light' | 'system') => {
      setScheme(value);
      setColorScheme(value === 'system' ? 'auto' : value);
      try {
        await updatePrefsMut.mutateAsync({
          theme: value,
          language,
          dateFormat,
          numberFormat,
          colorTheme,
          compactMode,
        });
      } catch {
        toast.error({ message: t('settings.appearance.schemeFailed') });
      }
    },
    [setColorScheme, updatePrefsMut, language, dateFormat, numberFormat, colorTheme, compactMode]
  );

  const handleThemeChange = useCallback(
    async (theme: ColorTheme) => {
      setColorTheme(theme);
      try {
        await updatePrefsMut.mutateAsync({
          theme: scheme,
          language,
          dateFormat,
          numberFormat,
          colorTheme: theme,
          compactMode,
        });
      } catch {
        toast.error({ message: t('settings.appearance.themeFailed') });
      }
    },
    [setColorTheme, updatePrefsMut, scheme, language, dateFormat, numberFormat, compactMode]
  );

  const handlePreferenceChange = useCallback(
    async (
      updates: Partial<{ language: string; dateFormat: typeof dateFormat; compactMode: boolean }>
    ) => {
      if (updates.language !== undefined) {
        setLanguage(updates.language);
        void i18n.changeLanguage(updates.language);
      }
      if (updates.dateFormat !== undefined) {
        setDateFormat(updates.dateFormat);
      }
      if (updates.compactMode !== undefined) {
        setCompactMode(updates.compactMode);
      }
      try {
        await updatePrefsMut.mutateAsync({
          theme: scheme,
          language: updates.language ?? language,
          dateFormat: updates.dateFormat ?? dateFormat,
          numberFormat,
          colorTheme,
          compactMode: updates.compactMode ?? compactMode,
        });
      } catch {
        toast.error({ message: t('settings.appearance.prefsFailed') });
      }
    },
    [scheme, language, dateFormat, numberFormat, colorTheme, compactMode, updatePrefsMut]
  );

  const handleWidgetToggle = useCallback(
    async (widgetId: string) => {
      const isHidden = hiddenWidgets.includes(widgetId);
      const next = isHidden
        ? hiddenWidgets.filter((w) => w !== widgetId)
        : [...hiddenWidgets, widgetId];
      setHiddenWidgets(next);
      try {
        await updatePrefsMut.mutateAsync({
          theme: scheme,
          language,
          dateFormat,
          numberFormat,
          colorTheme,
          compactMode,
          dashboardLayout: {
            widgetOrder,
            hiddenWidgets: next,
            visibleAccountIds: visibleAccountIds ?? undefined,
          },
        });
      } catch {
        toast.error({ message: t('settings.dashboard.layoutFailed') });
      }
    },
    [
      hiddenWidgets,
      widgetOrder,
      visibleAccountIds,
      updatePrefsMut,
      scheme,
      language,
      dateFormat,
      numberFormat,
      colorTheme,
      compactMode,
    ]
  );

  const handleAccountToggle = useCallback(
    async (accountId: string) => {
      const allAccountIds = (accountsQuery.data?.data ?? [])
        .filter((a) => a.status === 'active')
        .map((a) => a.id);
      // If null (show all), start from all active accounts
      const current = visibleAccountIds ?? allAccountIds;
      const isVisible = current.includes(accountId);
      const next = isVisible ? current.filter((id) => id !== accountId) : [...current, accountId];
      setVisibleAccountIds(next);
      try {
        await updatePrefsMut.mutateAsync({
          theme: scheme,
          language,
          dateFormat,
          numberFormat,
          colorTheme,
          compactMode,
          dashboardLayout: { widgetOrder, hiddenWidgets, visibleAccountIds: next },
        });
      } catch {
        toast.error({ message: t('settings.dashboard.accountCardsFailed') });
      }
    },
    [
      visibleAccountIds,
      accountsQuery.data,
      widgetOrder,
      hiddenWidgets,
      updatePrefsMut,
      scheme,
      language,
      dateFormat,
      numberFormat,
      colorTheme,
      compactMode,
    ]
  );

  const handleResetDashboard = useCallback(async () => {
    const defaultHidden = WIDGET_DEFINITIONS.filter((w) => !w.defaultVisible).map((w) => w.id);
    setHiddenWidgets(defaultHidden);
    setWidgetOrder([]);
    setVisibleAccountIds(null);
    try {
      await updatePrefsMut.mutateAsync({
        theme: scheme,
        language,
        dateFormat,
        numberFormat,
        colorTheme,
        compactMode,
        dashboardLayout: { widgetOrder: [], hiddenWidgets: defaultHidden },
      });
      toast.success({ message: t('settings.dashboard.resetSuccess') });
    } catch {
      toast.error({ message: t('settings.dashboard.resetFailed') });
    }
  }, [updatePrefsMut, scheme, language, dateFormat, numberFormat, colorTheme, compactMode]);

  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      toast.error({ message: t('settings.security.passwordMismatch') });
      return;
    }
    try {
      await changePasswordMut.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success({ message: t('settings.security.passwordChanged') });
      passwordModal.close();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error({ message: t('settings.security.passwordFailed') });
    }
  }, [currentPassword, newPassword, confirmPassword, changePasswordMut, passwordModal]);

  const handleDisable2fa = useCallback(async () => {
    try {
      await disableTwoFactorMut.mutateAsync({ code: disable2faCode });
      toast.success({ message: t('settings.security.twoFactorDisabledSuccess') });
      disable2faModal.close();
      setDisable2faCode('');
    } catch {
      toast.error({ message: t('settings.security.disable2faFailed') });
    }
  }, [disable2faCode, disableTwoFactorMut, disable2faModal]);

  const handleExportTransactions = useCallback(async () => {
    try {
      const data = await exportTransactionsMut.mutateAsync();
      const blob = new Blob([data as BlobPart], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `piggy-pulse-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error({ message: t('settings.data.exportFailed') });
    }
  }, [exportTransactionsMut]);

  const handleExportFull = useCallback(async () => {
    try {
      const data = await exportFullMut.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `piggy-pulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error({ message: t('settings.data.exportAllFailed') });
    }
  }, [exportFullMut]);

  const handleImportData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }
      let body: Record<string, unknown>;
      try {
        const text = await file.text();
        body = JSON.parse(text) as Record<string, unknown>;
      } catch {
        toast.error({ message: t('settings.data.importInvalidJson') });
        return;
      }
      try {
        const { apiClient } = await import('@/api/v2client');
        await apiClient.POST('/settings/import/data', { body: body as any });
        toast.success({ message: t('settings.data.importSuccess') });
      } catch {
        toast.error({ message: t('settings.data.importFailed') });
      }
    };
    input.click();
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    try {
      await deleteAccountMut.mutateAsync({ password: deleteConfirmPassword });
      toast.success({ message: t('settings.danger.deleteSuccess') });
      logout();
    } catch {
      toast.error({ message: t('settings.danger.deleteFailed') });
    }
  }, [deleteConfirmPassword, deleteAccountMut, logout]);

  // ── Derived ──
  const twoFactorEnabled = twoFactorQuery.data?.enabled ?? false;

  const emailDisplay = user?.email ?? '';

  // ── Render ──
  return (
    <div className={classes.page}>
      {/* Page header */}
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>{t('settings.title')}</h1>
        <p className={classes.pageDescription}>{t('settings.subtitle')}</p>
      </div>

      <div className={classes.layout}>
        {/* ── Side navigation ── */}
        {!isMobile && (
          <nav className={classes.sideNav}>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                className={`${classes.navItem} ${activeSection === section.id ? classes.navItemActive : ''} ${section.danger ? classes.navItemDanger : ''}`}
                onClick={() => scrollToSection(section.id)}
              >
                {t(section.tabKey)}
              </button>
            ))}
          </nav>
        )}

        {/* ── Content ── */}
        <div className={classes.content}>
          {/* ════════════════════ PROFILE ════════════════════ */}
          <div
            id="profile"
            className={classes.section}
            ref={(el) => {
              sectionRefs.current.profile = el;
            }}
          >
            <h2 className={classes.sectionTitle}>{t('settings.profile.title')}</h2>
            <p className={classes.sectionDescription}>{t('settings.profile.description')}</p>

            <div className={classes.card}>
              {/* Avatar + name display */}
              <div className={classes.avatarDisplay}>
                <div className={classes.avatarCircle}>{avatar}</div>
                <div>
                  <div className={classes.avatarName}>
                    {displayName || user?.name || t('settings.profile.userFallback')}
                  </div>
                  <div className={classes.avatarEmail}>{emailDisplay}</div>
                </div>
              </div>

              {/* Avatar picker */}
              <div style={{ marginTop: 16 }}>
                <div className={classes.label}>{t('settings.profile.avatarLabel')}</div>
                <div className={classes.avatarGrid}>
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.emoji}
                      className={`${classes.avatarOption} ${avatar === opt.emoji ? classes.avatarOptionSelected : ''}`}
                      onClick={() => {
                        setAvatar(opt.emoji);
                        setProfileDirty(true);
                      }}
                      title={t(`settings.avatars.${opt.key}`)}
                    >
                      {opt.emoji}
                    </button>
                  ))}
                </div>
                <p className={classes.hint}>{t('settings.profile.avatarHint')}</p>
              </div>

              <hr className={classes.divider} style={{ margin: '20px 0' }} />

              {/* Name + email */}
              <div className={classes.fieldRow}>
                <div>
                  <div className={classes.label}>{t('settings.profile.displayName')}</div>
                  <TextInput
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.currentTarget.value);
                      setProfileDirty(true);
                    }}
                    styles={{
                      input: {
                        background: 'var(--v2-elevated)',
                        border: '1px solid var(--v2-border)',
                        borderRadius: 10,
                        color: '#e3e0ea',
                      },
                    }}
                  />
                </div>
                <div>
                  <div className={classes.label}>{t('settings.profile.email')}</div>
                  <TextInput
                    value={emailDisplay}
                    readOnly
                    styles={{
                      input: {
                        background: 'var(--v2-elevated)',
                        border: '1px solid var(--v2-border)',
                        borderRadius: 10,
                        color: '#e3e0ea',
                      },
                    }}
                  />
                  <p className={classes.hint}>{t('settings.profile.emailHint')}</p>
                </div>
              </div>

              {/* Currency */}
              <div style={{ marginTop: 12 }}>
                <div className={classes.label}>{t('settings.profile.currency')}</div>
                <Select
                  value={currency}
                  onChange={(val) => {
                    if (val) {
                      setCurrency(val);
                      setProfileDirty(true);
                    }
                  }}
                  data={[
                    { value: 'EUR', label: t('settings.profile.currencyEur') },
                    { value: 'USD', label: t('settings.profile.currencyUsd') },
                    { value: 'GBP', label: t('settings.profile.currencyGbp') },
                    { value: 'BRL', label: t('settings.profile.currencyBrl') },
                  ]}
                  styles={{
                    input: {
                      background: 'var(--v2-elevated)',
                      border: '1px solid var(--v2-border)',
                      borderRadius: 10,
                      color: '#e3e0ea',
                    },
                  }}
                />
                <p className={classes.hint}>{t('settings.profile.currencyHint')}</p>
              </div>

              {/* Save */}
              <div className={classes.saveButton}>
                <Button
                  color="var(--v2-primary)"
                  radius={8}
                  size="compact-sm"
                  disabled={!profileDirty}
                  loading={updateProfileMut.isPending}
                  onClick={handleSaveProfile}
                >
                  {t('common.saveChanges')}
                </Button>
              </div>
            </div>
          </div>

          {/* ════════════════════ APPEARANCE ════════════════════ */}
          <div
            id="appearance"
            className={classes.section}
            ref={(el) => {
              sectionRefs.current.appearance = el;
            }}
          >
            <h2 className={classes.sectionTitle}>{t('settings.appearance.title')}</h2>
            <p className={classes.sectionDescription}>{t('settings.appearance.description')}</p>

            <div className={classes.card}>
              {/* Color scheme */}
              <div className={classes.label}>{t('settings.appearance.colorSchemeLabel')}</div>
              <div className={classes.schemeGrid}>
                {COLOR_SCHEMES.map((s) => (
                  <button
                    key={s.value}
                    className={`${classes.schemeOption} ${scheme === s.value ? classes.schemeOptionSelected : ''}`}
                    onClick={() => handleSchemeChange(s.value)}
                  >
                    <span className={classes.schemeEmoji}>{s.emoji}</span>
                    <span className={classes.schemeLabel}>
                      {t(`settings.colorScheme.${s.key}`)}
                    </span>
                  </button>
                ))}
              </div>

              <hr className={classes.divider} style={{ margin: '20px 0' }} />

              {/* Theme */}
              <div className={classes.label}>{t('settings.appearance.themeLabel')}</div>
              <div className={classes.themeGrid}>
                {THEME_ORDER.map((key) => {
                  const t = themes[key];
                  return (
                    <button
                      key={key}
                      className={`${classes.themeCard} ${colorTheme === key ? classes.themeCardSelected : ''}`}
                      onClick={() => handleThemeChange(key)}
                    >
                      <div className={classes.themeSwatches}>
                        <div className={classes.themeSwatch} style={{ background: t.primary }} />
                        <div className={classes.themeSwatch} style={{ background: t.secondary }} />
                        <div className={classes.themeSwatch} style={{ background: t.tertiary }} />
                      </div>
                      <div className={classes.themeName}>{t.label}</div>
                      <div className={classes.themeDesc}>{t.description}</div>
                    </button>
                  );
                })}
              </div>

              <hr className={classes.divider} style={{ margin: '20px 0' }} />

              {/* Language + Date format */}
              <div className={classes.fieldRow}>
                <div>
                  <div className={classes.label}>{t('settings.appearance.languageLabel')}</div>
                  <Select
                    value={language}
                    onChange={(val) => val && handlePreferenceChange({ language: val })}
                    data={[
                      { value: 'en', label: 'English' },
                      { value: 'pt', label: 'Portugu\u00eas' },
                    ]}
                    styles={{
                      input: {
                        background: 'var(--v2-elevated)',
                        border: '1px solid var(--v2-border)',
                        borderRadius: 10,
                        color: '#e3e0ea',
                      },
                    }}
                  />
                </div>
                <div>
                  <div className={classes.label}>{t('settings.appearance.dateFormatLabel')}</div>
                  <Select
                    value={dateFormat}
                    onChange={(val) =>
                      val && handlePreferenceChange({ dateFormat: val as typeof dateFormat })
                    }
                    data={[
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                    styles={{
                      input: {
                        background: 'var(--v2-elevated)',
                        border: '1px solid var(--v2-border)',
                        borderRadius: 10,
                        color: '#e3e0ea',
                      },
                    }}
                  />
                </div>
              </div>

              <hr className={classes.divider} style={{ margin: '20px 0' }} />

              {/* Compact mode */}
              <div className={classes.toggleRow}>
                <div className={classes.toggleInfo}>
                  <span className={classes.toggleLabel}>
                    {t('settings.appearance.compactMode')}
                  </span>
                  <span className={classes.toggleDescription}>
                    {t('settings.appearance.compactModeDesc')}
                  </span>
                </div>
                <Switch
                  checked={compactMode}
                  onChange={(e) => handlePreferenceChange({ compactMode: e.currentTarget.checked })}
                  color="var(--v2-primary)"
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* ════════════════════ DASHBOARD ════════════════════ */}
          <div
            id="dashboard"
            className={classes.section}
            ref={(el) => {
              sectionRefs.current.dashboard = el;
            }}
          >
            <h2 className={classes.sectionTitle}>{t('settings.dashboard.title')}</h2>
            <p className={classes.sectionDescription}>{t('settings.dashboard.description')}</p>

            <div className={classes.card}>
              <div className={classes.label}>{t('settings.dashboard.defaultWidgets')}</div>
              <p className={classes.hint} style={{ marginTop: 0, marginBottom: 16 }}>
                {t('settings.dashboard.defaultWidgetsHint')}
              </p>

              {WIDGET_DEFINITIONS.map((widget) => (
                <div key={widget.id} className={classes.widgetRow}>
                  <div className={classes.widgetInfo}>
                    <div className={classes.widgetIcon}>{widget.emoji}</div>
                    <div className={classes.widgetMeta}>
                      <span className={classes.widgetName}>
                        {t(`settings.widgets.${WIDGET_KEY_MAP[widget.id]}.name`)}
                      </span>
                      <span className={classes.widgetDesc}>
                        {t(`settings.widgets.${WIDGET_KEY_MAP[widget.id]}.description`)}
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={!hiddenWidgets.includes(widget.id)}
                    onChange={() => handleWidgetToggle(widget.id)}
                    color="var(--v2-primary)"
                    size="md"
                  />
                </div>
              ))}

              <hr className={classes.divider} style={{ margin: '16px 0' }} />

              {/* Account cards */}
              <div className={classes.label} style={{ marginTop: 8 }}>
                {t('settings.dashboard.accountCards')}
              </div>
              <p className={classes.hint} style={{ marginTop: 0, marginBottom: 12 }}>
                {t('settings.dashboard.accountCardsHint')}
                {visibleAccountIds === null ? ` ${t('settings.dashboard.allAccountsShown')}` : ''}
              </p>

              {(accountsQuery.data?.data ?? [])
                .filter((a) => a.status === 'active')
                .map((account) => {
                  const isShown =
                    visibleAccountIds === null || visibleAccountIds.includes(account.id);
                  return (
                    <div key={account.id} className={classes.widgetRow}>
                      <div className={classes.widgetInfo}>
                        <div className={classes.widgetIcon}>
                          {account.type === 'Checking'
                            ? '\u{1F3E6}'
                            : account.type === 'Savings'
                              ? '\u{1F4B0}'
                              : account.type === 'CreditCard'
                                ? '\u{1F4B3}'
                                : '\u{1F3E6}'}
                        </div>
                        <div className={classes.widgetMeta}>
                          <span className={classes.widgetName}>{account.name}</span>
                          <span className={classes.widgetDesc}>
                            {account.type === 'Checking'
                              ? t('settings.dashboard.accountTypeChecking')
                              : account.type === 'Savings'
                                ? t('settings.dashboard.accountTypeSavings')
                                : account.type === 'CreditCard'
                                  ? t('settings.dashboard.accountTypeCreditCard')
                                  : account.type}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={isShown}
                        onChange={() => handleAccountToggle(account.id)}
                        color="var(--v2-primary)"
                        size="md"
                      />
                    </div>
                  );
                })}

              <hr className={classes.divider} style={{ margin: '16px 0' }} />

              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <span className={classes.widgetName}>{t('settings.dashboard.resetLayout')}</span>
                  <br />
                  <span className={classes.toggleDescription}>
                    {t('settings.dashboard.resetLayoutDesc')}
                  </span>
                </div>
                <Button
                  variant="default"
                  size="compact-xs"
                  radius={8}
                  onClick={handleResetDashboard}
                  styles={{
                    root: {
                      border: '1px solid var(--v2-border)',
                      background: 'transparent',
                      color: '#e3e0ea',
                    },
                  }}
                >
                  {t('common.reset')}
                </Button>
              </div>
            </div>
          </div>

          {/* ════════════════════ SECURITY ════════════════════ */}
          <div
            id="security"
            className={classes.section}
            ref={(el) => {
              sectionRefs.current.security = el;
            }}
          >
            <h2 className={classes.sectionTitle}>{t('settings.security.title')}</h2>
            <p className={classes.sectionDescription}>{t('settings.security.description')}</p>

            <div
              className={classes.card}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {/* Password card */}
              <div className={classes.securityCard}>
                <div className={classes.securityHeader}>
                  <span className={classes.securityTitle}>{t('settings.security.password')}</span>
                </div>
                <div className={classes.securityMeta}>{t('settings.security.passwordDesc')}</div>
                <div className={classes.securityActions}>
                  <Button
                    variant="default"
                    size="compact-xs"
                    radius={8}
                    onClick={passwordModal.open}
                    styles={{
                      root: {
                        border: '1px solid var(--v2-border)',
                        background: 'transparent',
                        color: '#e3e0ea',
                      },
                    }}
                  >
                    {t('settings.security.changePassword')}
                  </Button>
                </div>
              </div>

              {/* 2FA card */}
              <div className={classes.securityCard}>
                <div className={classes.securityHeader}>
                  <span className={classes.securityTitle}>{t('settings.security.twoFactor')}</span>
                  {twoFactorEnabled && (
                    <span className={classes.enabledBadge}>{t('common.enabled')}</span>
                  )}
                </div>
                <div className={classes.securityMeta}>
                  {twoFactorEnabled
                    ? t('settings.security.twoFactorEnabled')
                    : t('settings.security.twoFactorDisabled')}
                </div>
                <div className={classes.securityActions}>
                  {twoFactorEnabled ? (
                    <>
                      <Button
                        variant="default"
                        size="compact-xs"
                        radius={8}
                        onClick={() =>
                          toast.info({ message: t('settings.security.reconfigureHint') })
                        }
                        styles={{
                          root: {
                            border: '1px solid var(--v2-border)',
                            background: 'transparent',
                            color: '#e3e0ea',
                          },
                        }}
                      >
                        {t('settings.security.reconfigure')}
                      </Button>
                      <Button
                        variant="default"
                        size="compact-xs"
                        radius={8}
                        onClick={disable2faModal.open}
                        styles={{
                          root: {
                            border: '1px solid rgba(212,86,78,0.3)',
                            background: 'transparent',
                            color: '#d4564e',
                          },
                        }}
                      >
                        {t('settings.security.disable2fa')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      color="var(--v2-primary)"
                      size="compact-xs"
                      radius={8}
                      onClick={setup2faModal.open}
                    >
                      {t('settings.security.enable2fa')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════ DATA ════════════════════ */}
          <div
            id="data"
            className={classes.section}
            ref={(el) => {
              sectionRefs.current.data = el;
            }}
          >
            <h2 className={classes.sectionTitle}>{t('settings.data.title')}</h2>
            <p className={classes.sectionDescription}>{t('settings.data.description')}</p>

            <div className={classes.card}>
              <div className={classes.sectionLabel}>{t('settings.data.export')}</div>

              <div className={classes.exportRow}>
                <div className={classes.exportInfo}>
                  <span className={classes.exportTitle}>
                    {t('settings.data.exportTransactions')}
                  </span>
                  <span className={classes.exportDesc}>
                    {t('settings.data.exportTransactionsDesc')}
                  </span>
                </div>
                <div className={classes.exportActions}>
                  <span className={classes.formatBadge}>CSV</span>
                  <Button
                    variant="default"
                    size="compact-xs"
                    radius={8}
                    loading={exportTransactionsMut.isPending}
                    onClick={handleExportTransactions}
                    styles={{
                      root: {
                        border: '1px solid var(--v2-border)',
                        background: 'transparent',
                        color: '#e3e0ea',
                      },
                    }}
                  >
                    {t('common.export')}
                  </Button>
                </div>
              </div>

              <div className={classes.exportRow} style={{ marginTop: 10 }}>
                <div className={classes.exportInfo}>
                  <span className={classes.exportTitle}>{t('settings.data.exportAll')}</span>
                  <span className={classes.exportDesc}>{t('settings.data.exportAllDesc')}</span>
                </div>
                <div className={classes.exportActions}>
                  <span className={classes.formatBadge}>JSON</span>
                  <Button
                    variant="default"
                    size="compact-xs"
                    radius={8}
                    loading={exportFullMut.isPending}
                    onClick={handleExportFull}
                    styles={{
                      root: {
                        border: '1px solid var(--v2-border)',
                        background: 'transparent',
                        color: '#e3e0ea',
                      },
                    }}
                  >
                    {t('common.export')}
                  </Button>
                </div>
              </div>

              <hr className={classes.divider} style={{ margin: '20px 0' }} />

              <div className={classes.sectionLabel}>{t('settings.data.import')}</div>

              <div className={classes.exportRow}>
                <div className={classes.exportInfo}>
                  <span className={classes.exportTitle}>{t('settings.data.importData')}</span>
                  <span className={classes.exportDesc}>{t('settings.data.importDataDesc')}</span>
                </div>
                <div className={classes.exportActions}>
                  <span className={classes.formatBadge}>JSON</span>
                  <Button
                    variant="default"
                    size="compact-xs"
                    radius={8}
                    onClick={handleImportData}
                    styles={{
                      root: {
                        border: '1px solid var(--v2-border)',
                        background: 'transparent',
                        color: '#e3e0ea',
                      },
                    }}
                  >
                    {t('common.import')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════ DANGER ZONE ════════════════════ */}
          <div
            id="danger"
            className={classes.section}
            ref={(el) => {
              sectionRefs.current.danger = el;
            }}
          >
            <h2 className={`${classes.sectionTitle} ${classes.sectionTitleDanger}`}>
              {t('settings.danger.title')}
            </h2>
            <p className={classes.sectionDescription}>{t('settings.danger.description')}</p>

            <div className={classes.dangerCard}>
              <div className={classes.dangerTitle}>{t('settings.danger.deleteAccount')}</div>
              <p className={classes.dangerDescription}>{t('settings.danger.deleteAccountDesc')}</p>
              <div className={classes.dangerWarning}>
                {t('settings.danger.deleteAccountWarning')}
              </div>
              <div style={{ marginTop: 16 }}>
                <Button color="red" radius={8} size="compact-sm" onClick={deleteModal.open}>
                  {t('settings.danger.deleteMyAccount')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Change Password */}
      <Modal
        opened={passwordModalOpen}
        onClose={passwordModal.close}
        title={t('settings.security.changePassword')}
        centered
      >
        <PasswordInput
          label={t('settings.security.currentPassword')}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.currentTarget.value)}
          mb="sm"
        />
        <PasswordInput
          label={t('settings.security.newPassword')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          mb="sm"
        />
        <PasswordInput
          label={t('settings.security.confirmNewPassword')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          mb="md"
        />
        <Button
          fullWidth
          color="var(--v2-primary)"
          loading={changePasswordMut.isPending}
          onClick={handleChangePassword}
        >
          {t('settings.security.changePassword')}
        </Button>
      </Modal>

      {/* Disable 2FA */}
      <Modal
        opened={disable2faModalOpen}
        onClose={disable2faModal.close}
        title={t('settings.security.disable2faTitle')}
        centered
      >
        <Text size="sm" c="dimmed" mb="md">
          {t('settings.security.disable2faDesc')}
        </Text>
        <PinInput
          length={6}
          type="number"
          value={disable2faCode}
          onChange={setDisable2faCode}
          oneTimeCode
          style={{ justifyContent: 'center', marginBottom: 16 }}
        />
        <Button
          fullWidth
          color="red"
          loading={disableTwoFactorMut.isPending}
          onClick={handleDisable2fa}
          disabled={disable2faCode.length < 6}
        >
          {t('settings.security.disable2fa')}
        </Button>
      </Modal>

      {/* Delete Account */}
      <Modal
        opened={deleteModalOpen}
        onClose={deleteModal.close}
        title={t('settings.danger.deleteConfirmTitle')}
        centered
      >
        <Text size="sm" c="dimmed" mb="md">
          {t('settings.danger.deleteConfirmDesc')}
        </Text>
        <PasswordInput
          label={t('settings.danger.passwordLabel')}
          value={deleteConfirmPassword}
          onChange={(e) => setDeleteConfirmPassword(e.currentTarget.value)}
          mb="md"
        />
        <Button
          fullWidth
          color="red"
          loading={deleteAccountMut.isPending}
          onClick={handleDeleteAccount}
          disabled={!deleteConfirmPassword}
        >
          {t('settings.danger.permanentlyDelete')}
        </Button>
      </Modal>

      {/* 2FA Setup */}
      <TwoFactorSetupModal opened={setup2faModalOpen} onClose={setup2faModal.close} />
    </div>
  );
}
