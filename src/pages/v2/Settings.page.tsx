import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Modal,
  PasswordInput,
  PinInput,
  Select,
  Text,
  TextInput,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { TwoFactorSetupModal } from '@/components/v2/Settings/TwoFactorSetupModal';
import { useAuth } from '@/context/AuthContext';
import { useCurrencies } from '@/hooks/v2/useCurrencies';
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

const SECTIONS: readonly { id: string; tabKey: string; danger?: boolean }[] = [
  { id: 'profile', tabKey: 'settings.tabs.profile' },
  { id: 'appearance', tabKey: 'settings.tabs.appearance' },
  { id: 'security', tabKey: 'settings.tabs.security' },
  { id: 'data', tabKey: 'settings.tabs.data' },
  { id: 'danger', tabKey: 'settings.tabs.dangerZone', danger: true },
];

const COLOR_SCHEMES = [
  { value: 'dark' as const, emoji: '\u{1F319}', key: 'dark' },
  { value: 'light' as const, emoji: '\u2600\uFE0F', key: 'light' },
];

const THEME_ORDER: ColorTheme[] = ['nebula', 'sunrise', 'neon', 'tropical', 'candy_pop', 'moonlit'];

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
  const { data: currencies } = useCurrencies();
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

  // ── Migrate users off removed "system" scheme ──
  useEffect(() => {
    if (scheme === 'system' || (colorScheme as string) === 'auto') {
      void handleSchemeChange('dark');
    }
  }, [scheme, colorScheme, handleSchemeChange]);

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
      await exportTransactionsMut.mutateAsync();
    } catch {
      toast.error({ message: t('settings.data.exportFailed') });
    }
  }, [exportTransactionsMut]);

  const handleExportFull = useCallback(async () => {
    try {
      await exportFullMut.mutateAsync();
    } catch {
      toast.error({ message: t('settings.data.exportAllFailed') });
    }
  }, [exportFullMut]);

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
                        color: 'var(--v2-text)',
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
                        color: 'var(--v2-text)',
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
                  data={(currencies ?? [])
                    .filter((c) => c.code)
                    .map((c) => ({ value: c.code, label: `${c.symbol} ${c.name} (${c.code})` }))}
                  styles={{
                    input: {
                      background: 'var(--v2-elevated)',
                      border: '1px solid var(--v2-border)',
                      borderRadius: 10,
                      color: 'var(--v2-text)',
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
                  const themeAccents = themes[key];
                  return (
                    <button
                      key={key}
                      className={`${classes.themeCard} ${colorTheme === key ? classes.themeCardSelected : ''}`}
                      onClick={() => handleThemeChange(key)}
                    >
                      <div className={classes.themeSwatches}>
                        <div
                          className={classes.themeSwatch}
                          style={{ background: themeAccents.primary }}
                        />
                        <div
                          className={classes.themeSwatch}
                          style={{ background: themeAccents.secondary }}
                        />
                        <div
                          className={classes.themeSwatch}
                          style={{ background: themeAccents.tertiary }}
                        />
                      </div>
                      <div className={classes.themeName}>{themeAccents.label}</div>
                      <div className={classes.themeDesc}>{themeAccents.description}</div>
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
                        color: 'var(--v2-text)',
                      },
                    }}
                  />
                </div>
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
                        color: 'var(--v2-text)',
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
                            color: 'var(--v2-text)',
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
                    data-testid="settings-export-csv-button"
                    variant="default"
                    size="compact-xs"
                    radius={8}
                    loading={exportTransactionsMut.isPending}
                    onClick={handleExportTransactions}
                    styles={{
                      root: {
                        border: '1px solid var(--v2-border)',
                        background: 'transparent',
                        color: 'var(--v2-text)',
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
                    data-testid="settings-export-json-button"
                    variant="default"
                    size="compact-xs"
                    radius={8}
                    loading={exportFullMut.isPending}
                    onClick={handleExportFull}
                    styles={{
                      root: {
                        border: '1px solid var(--v2-border)',
                        background: 'transparent',
                        color: 'var(--v2-text)',
                      },
                    }}
                  >
                    {t('common.export')}
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
