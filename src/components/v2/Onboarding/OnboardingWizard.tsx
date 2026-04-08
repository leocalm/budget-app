import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import piggyCloud from '@/assets/icons/png/gradient/piggy-pulse-cloud.svg';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useAuth } from '@/context/AuthContext';
import { useCreateAccount } from '@/hooks/v2/useAccounts';
import { useCreatePeriodSchedule } from '@/hooks/v2/useBudgetPeriods';
import { useCurrencies } from '@/hooks/v2/useCurrencies';
import {
  useApplyTemplate,
  useCategoryTemplates,
  useCompleteOnboarding,
} from '@/hooks/v2/useOnboarding';
import { useProfile, useUpdateProfile } from '@/hooks/v2/useSettings';
import { toast } from '@/lib/toast';
import classes from './Onboarding.module.css';

type AccountType = 'Checking' | 'Savings' | 'Wallet';

interface AccountEntry {
  key: number;
  name: string;
  type: AccountType;
  balance: number | string;
}

const STEPS = ['Welcome', 'Currency', 'Periods', 'Accounts', 'Categories'];

export function OnboardingWizard() {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { data: currencies } = useCurrencies();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const createAccount = useCreateAccount();
  const createSchedule = useCreatePeriodSchedule();
  const completeOnboarding = useCompleteOnboarding();
  const { data: templates } = useCategoryTemplates();
  const applyTemplate = useApplyTemplate();

  const [step, setStep] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');
  const [accounts, setAccounts] = useState<AccountEntry[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completionLock = useRef(false);
  const accountIdCounter = useRef(0);

  const handleNext = async () => {
    if (step === 1) {
      // Save currency via profile update, preserving existing name/avatar
      if (!selectedCurrency) {
        return;
      }
      try {
        await updateProfile.mutateAsync({
          name: profile?.name ?? '',
          currency: selectedCurrency,
          avatar: profile?.avatar ?? '🐷',
        });
      } catch {
        toast.error({ message: t('onboarding.currency.saveFailed') });
        return;
      }
    }

    if (step === 2) {
      // Create default monthly schedule (1st of month, 30 days, 3 ahead)
      try {
        await createSchedule.mutateAsync({
          scheduleType: 'automatic',
          recurrenceMethod: 'dayOfMonth',
          startDayOfTheMonth: 1,
          periodDuration: 1,
          durationUnit: 'months',
          generateAhead: 3,
          saturdayPolicy: 'keep',
          sundayPolicy: 'keep',
          namePattern: '{MONTH} {YEAR}',
        });
      } catch {
        toast.error({ message: t('onboarding.periods.setupFailed') });
        return;
      }
    }

    if (step === 3) {
      // Create accounts — stop on first failure
      let failed = false;
      for (const acct of accounts) {
        if (acct.name.trim()) {
          try {
            await createAccount.mutateAsync({
              name: acct.name.trim(),
              type: acct.type,
              color: '#8B7EC8',
              initialBalance: Math.round(Number(acct.balance) * 100),
              currencyId: currencies?.find((c) => c.code === selectedCurrency)?.id ?? '',
            });
          } catch {
            toast.error({ message: t('onboarding.accounts.createFailed', { name: acct.name }) });
            failed = true;
            break;
          }
        }
      }
      if (failed) {
        return;
      }
    }

    if (step === 4 && selectedTemplate) {
      // Apply template
      try {
        const cats = await applyTemplate.mutateAsync(selectedTemplate);
        setAppliedCategories((cats ?? []).map((c) => c.name));
      } catch {
        toast.error({ message: t('onboarding.categories.applyFailed') });
      }
    }

    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const handleComplete = async () => {
    if (completionLock.current) {
      return;
    }
    completionLock.current = true;
    setIsSubmitting(true);
    try {
      await completeOnboarding.mutateAsync();
      await refreshUser();
      navigate('/dashboard');
    } catch {
      completionLock.current = false;
      toast.error({ message: t('onboarding.complete.completeFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToTransactions = async () => {
    if (completionLock.current) {
      return;
    }
    completionLock.current = true;
    setIsSubmitting(true);
    try {
      await completeOnboarding.mutateAsync();
      await refreshUser();
      navigate('/transactions', { state: { openCreateDrawer: true } });
    } catch {
      completionLock.current = false;
      toast.error({ message: t('onboarding.complete.completeFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCurrencies = (currencies ?? []).filter(
    (c) =>
      !currencySearch ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const selectedCurrencyData = currencies?.find((c) => c.code === selectedCurrency);
  const selectedTemplateData = (templates ?? []).find((t) => t.id === selectedTemplate);

  return (
    <div className={classes.wrapper} data-testid="onboarding-wizard">
      {/* Stepper — shown on steps 1-4 */}
      {step >= 1 && step <= 4 && (
        <div className={classes.stepper}>
          {STEPS.map((label, i) => (
            <div key={label} className={classes.stepDot}>
              <span
                className={
                  i < step ? classes.dotCompleted : i === step ? classes.dotActive : classes.dot
                }
              />
              <Text
                fz={10}
                fw={700}
                tt="uppercase"
                c={i === step ? undefined : 'dimmed'}
                style={{ letterSpacing: '0.5px' }}
              >
                {label}
              </Text>
            </div>
          ))}
        </div>
      )}

      {/* Logo */}
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center" mb="md">
        {t('onboarding.appName')}
      </Text>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className={classes.card}>
          <div className={classes.heroImage}>
            <img src={piggyCloud} alt="PiggyPulse mascot" />
          </div>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            {t('onboarding.welcome.title')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4}>
            {t('onboarding.welcome.subtitle')}
          </Text>
          <Stack gap="xs" mt="lg">
            <Text fz="sm">
              <Text span fw={600}>
                {t('onboarding.welcome.noJudgment')}
              </Text>{' '}
              — we don&apos;t label spending as good or bad
            </Text>
            <Text fz="sm">
              <Text span fw={600}>
                {t('onboarding.welcome.justClarity')}
              </Text>{' '}
              — see your data, understand your patterns
            </Text>
            <Text fz="sm">
              <Text span fw={600}>
                {t('onboarding.welcome.yourRules')}
              </Text>{' '}
              — you decide what your numbers mean
            </Text>
          </Stack>
          <Text fz="xs" c="dimmed" mt="lg" fs="italic" ta="center">
            {t('onboarding.welcome.quote')}
          </Text>
          <Button
            data-testid="onboarding-next"
            fullWidth
            mt="xl"
            size="md"
            onClick={() => setStep(1)}
          >
            {t('onboarding.welcome.getStarted')}
          </Button>
        </div>
      )}

      {/* Step 1: Currency */}
      {step === 1 && (
        <div className={classes.card}>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            {t('onboarding.currency.title')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            {t('onboarding.currency.requiredStep')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            {t('onboarding.currency.description')}
          </Text>
          <TextInput
            placeholder={t('onboarding.currency.searchPlaceholder')}
            value={currencySearch}
            onChange={(e) => setCurrencySearch(e.currentTarget.value)}
            mb="sm"
          />
          <div className={classes.currencyList}>
            {filteredCurrencies.map((c) => (
              <div
                key={c.id}
                className={
                  selectedCurrency === c.code
                    ? classes.currencyOptionActive
                    : classes.currencyOption
                }
                onClick={() => setSelectedCurrency(c.code)}
                role="radio"
                aria-checked={selectedCurrency === c.code}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCurrency(c.code);
                  }
                }}
              >
                <Text
                  fz="sm"
                  fw={600}
                  ff="var(--mantine-font-family-monospace)"
                  style={{ width: 40 }}
                >
                  {c.symbol}
                </Text>
                <Text fz="sm">{c.name}</Text>
                <Text fz="xs" c="dimmed" ml="auto">
                  {c.code}
                </Text>
              </div>
            ))}
          </div>
          <div className={classes.navButtons}>
            <Button data-testid="onboarding-back" variant="subtle" onClick={handleBack}>
              {t('common.back')}
            </Button>
            <Button data-testid="onboarding-next" onClick={handleNext} disabled={!selectedCurrency}>
              {t('common.continue')}
            </Button>
          </div>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            {t('onboarding.currency.multiCurrencyNote')}
          </Text>
        </div>
      )}

      {/* Step 2: Periods (informational) */}
      {step === 2 && (
        <div className={classes.card}>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            {t('onboarding.periods.title')}
          </Text>
          <Text fz="sm" c="dimmed" mt="md">
            {t('onboarding.periods.description1')}
          </Text>
          <Text fz="sm" c="dimmed" mt="sm">
            {t('onboarding.periods.description2')}
          </Text>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mt="xl" mb="xs">
            {t('onboarding.periods.defaultLabel')}
          </Text>
          <Stack
            gap="xs"
            p="md"
            style={{
              border: '1px solid var(--v2-border)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <Text fz="sm" fw={500}>
              {t('onboarding.periods.defaultMonthly')}
            </Text>
            <Text fz="sm" fw={500}>
              {t('onboarding.periods.defaultAhead')}
            </Text>
          </Stack>
          <Text fz="sm" c="dimmed" mt="sm" ta="center">
            {t('onboarding.periods.changeHint')}
          </Text>
          <div className={classes.navButtons}>
            <Button data-testid="onboarding-back" variant="subtle" onClick={handleBack}>
              {t('common.back')}
            </Button>
            <Button data-testid="onboarding-next" onClick={handleNext}>
              {t('common.continue')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Accounts (skippable) */}
      {step === 3 && (
        <div className={classes.card}>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            {t('onboarding.accounts.title')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            {t('onboarding.accounts.description1')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            {t('onboarding.accounts.description2')}
          </Text>
          <Stack gap="sm">
            {accounts.map((acct, i) => (
              <div key={acct.key} className={classes.accountEntry}>
                <Group grow mb="xs">
                  <TextInput
                    placeholder={t('onboarding.accounts.accountNamePlaceholder')}
                    value={acct.name}
                    onChange={(e) => {
                      const next = [...accounts];
                      next[i] = { ...next[i], name: e.currentTarget.value };
                      setAccounts(next);
                    }}
                    size="sm"
                  />
                  <Select
                    data={[
                      { value: 'Checking', label: 'Checking' },
                      { value: 'Savings', label: 'Savings' },
                      { value: 'Wallet', label: 'Wallet' },
                    ]}
                    value={acct.type}
                    onChange={(v) => {
                      const next = [...accounts];
                      next[i] = { ...next[i], type: (v as AccountType) ?? 'Checking' };
                      setAccounts(next);
                    }}
                    size="sm"
                  />
                </Group>
                <NumberInput
                  placeholder={t('onboarding.accounts.currentBalance')}
                  value={acct.balance}
                  onChange={(v) => {
                    const next = [...accounts];
                    next[i] = { ...next[i], balance: v };
                    setAccounts(next);
                  }}
                  decimalScale={2}
                  fixedDecimalScale
                  prefix={selectedCurrencyData?.symbol ? `${selectedCurrencyData.symbol} ` : ''}
                  size="sm"
                  description={t('onboarding.accounts.balanceDesc')}
                />
              </div>
            ))}
            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                accountIdCounter.current += 1;
                setAccounts([
                  ...accounts,
                  { key: accountIdCounter.current, name: '', type: 'Checking', balance: 0 },
                ]);
              }}
            >
              {t('onboarding.accounts.addAccount')}
            </Button>
          </Stack>
          <div className={classes.navButtons}>
            <Button data-testid="onboarding-back" variant="subtle" onClick={handleBack}>
              {t('common.back')}
            </Button>
            <div className={classes.navRight}>
              <Button
                data-testid="onboarding-skip"
                variant="subtle"
                c="dimmed"
                onClick={() => setStep(4)}
              >
                {t('common.skipForNow')}
              </Button>
              <Button data-testid="onboarding-next" onClick={handleNext}>
                {t('common.continue')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Categories (skippable) */}
      {step === 4 && (
        <div className={classes.card}>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            {t('onboarding.categories.title')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            {t('onboarding.categories.description1')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            {t('onboarding.categories.description2')}
          </Text>
          <div className={classes.templateGrid}>
            {(templates ?? []).map((t) => (
              <div
                key={t.id}
                className={
                  selectedTemplate === t.id ? classes.templateCardActive : classes.templateCard
                }
                onClick={() => setSelectedTemplate(t.id)}
                role="radio"
                aria-checked={selectedTemplate === t.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTemplate(t.id);
                  }
                }}
              >
                <Text fz="sm" fw={600}>
                  {t.name}
                </Text>
                <Text fz="xs" c="dimmed">
                  {t.description}
                </Text>
              </div>
            ))}
          </div>
          {selectedTemplateData && (
            <div className={classes.categoryPreview}>
              {selectedTemplateData.categories.map((cat) => (
                <div key={cat.name} className={classes.categoryPreviewItem}>
                  <Text fz="sm">{cat.icon}</Text>
                  <Text fz="sm" fw={500}>
                    {cat.name}
                  </Text>
                  <Text fz="xs" c="dimmed" ml="auto">
                    {cat.type === 'income' ? 'In' : 'Out'} · {cat.behavior ?? 'Variable'}
                  </Text>
                </div>
              ))}
            </div>
          )}
          <Text fz="xs" c="dimmed" mt="sm" ta="center">
            {t('onboarding.categories.colorHint')}
          </Text>
          <div className={classes.navButtons}>
            <Button data-testid="onboarding-back" variant="subtle" onClick={handleBack}>
              {t('common.back')}
            </Button>
            <div className={classes.navRight}>
              <Button
                data-testid="onboarding-skip"
                variant="subtle"
                c="dimmed"
                onClick={() => setStep(5)}
              >
                {t('common.skipForNow')}
              </Button>
              <Button
                data-testid="onboarding-next"
                onClick={handleNext}
                disabled={!selectedTemplate}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Summary / Completion */}
      {step === 5 && (
        <div className={classes.card}>
          <div className={classes.heroImage}>
            <img src={piggyCloud} alt="PiggyPulse mascot" />
          </div>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            {t('onboarding.complete.title')}
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            {t('onboarding.complete.subtitle')}
          </Text>

          <Stack gap={0}>
            {/* Currency */}
            <div className={classes.summarySection}>
              <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
                {t('onboarding.complete.currency')}
              </Text>
              <Text fz="sm" fw={500}>
                {selectedCurrencyData
                  ? `${selectedCurrencyData.code} — ${selectedCurrencyData.name}`
                  : selectedCurrency}
              </Text>
            </div>

            {/* Periods */}
            <div className={classes.summarySection}>
              <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
                {t('onboarding.complete.periods')}
              </Text>
              <Text fz="sm" fw={500}>
                {t('onboarding.complete.periodsDefault')}
              </Text>
              <Text fz="xs" c="dimmed">
                {t('onboarding.periods.defaultAhead')}
              </Text>
            </div>

            {/* Accounts */}
            {accounts.filter((a) => a.name.trim()).length > 0 && (
              <div className={classes.summarySection}>
                <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
                  Accounts
                </Text>
                {accounts
                  .filter((a) => a.name.trim())
                  .map((a) => (
                    <Text key={a.key} fz="sm" fw={500}>
                      {a.name} · {a.type} ·{' '}
                      <CurrencyValue cents={Math.round(Number(a.balance) * 100)} />
                    </Text>
                  ))}
              </div>
            )}

            {/* Categories */}
            {appliedCategories.length > 0 && (
              <div className={classes.summarySection}>
                <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
                  Categories
                </Text>
                <Text fz="sm" fw={500}>
                  {selectedTemplateData?.name ?? 'Custom'} ({appliedCategories.length})
                </Text>
                <Text fz="xs" c="dimmed">
                  {appliedCategories.join(', ')}
                </Text>
              </div>
            )}
          </Stack>

          <Button
            data-testid="onboarding-go-to-dashboard"
            fullWidth
            mt="xl"
            size="md"
            onClick={handleComplete}
            loading={isSubmitting}
          >
            {t('onboarding.complete.goToDashboard')}
          </Button>
          <Button
            fullWidth
            mt="xs"
            variant="subtle"
            size="sm"
            onClick={handleGoToTransactions}
            loading={isSubmitting}
          >
            {t('onboarding.complete.addFirstTransaction')}
          </Button>
        </div>
      )}
    </div>
  );
}
