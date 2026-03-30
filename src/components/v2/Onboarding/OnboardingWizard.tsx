import { useRef, useState } from 'react';
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
        toast.error({ message: 'Failed to save currency' });
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
        toast.error({ message: 'Failed to set up periods' });
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
            toast.error({ message: `Failed to create account "${acct.name}"` });
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
        toast.error({ message: 'Failed to apply template' });
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
      navigate('/v2/dashboard');
    } catch {
      completionLock.current = false;
      toast.error({ message: 'Failed to complete onboarding' });
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
      navigate('/v2/transactions', { state: { openCreateDrawer: true } });
    } catch {
      completionLock.current = false;
      toast.error({ message: 'Failed to complete onboarding' });
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
    <div className={classes.wrapper}>
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
        PiggyPulse
      </Text>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className={classes.card}>
          <div className={classes.heroImage}>
            <img src={piggyCloud} alt="PiggyPulse mascot" />
          </div>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            Welcome to PiggyPulse
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4}>
            Your financial pulse — calm, clear, and entirely yours.
          </Text>
          <Stack gap="xs" mt="lg">
            <Text fz="sm">
              <Text span fw={600}>
                No judgment
              </Text>{' '}
              — we don&apos;t label spending as good or bad
            </Text>
            <Text fz="sm">
              <Text span fw={600}>
                Just clarity
              </Text>{' '}
              — see your data, understand your patterns
            </Text>
            <Text fz="sm">
              <Text span fw={600}>
                Your rules
              </Text>{' '}
              — you decide what your numbers mean
            </Text>
          </Stack>
          <Text fz="xs" c="dimmed" mt="lg" fs="italic" ta="center">
            &ldquo;PiggyPulse shows you reality through data. We don&apos;t celebrate or criticize —
            you decide what your numbers mean.&rdquo;
          </Text>
          <Button fullWidth mt="xl" size="md" onClick={() => setStep(1)}>
            Let&apos;s get started
          </Button>
        </div>
      )}

      {/* Step 1: Currency */}
      {step === 1 && (
        <div className={classes.card}>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            Choose your currency
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            This is the only required step.
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            All your accounts and transactions will use this currency.
          </Text>
          <TextInput
            placeholder="Search currencies..."
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
            <Button variant="subtle" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!selectedCurrency}>
              Continue
            </Button>
          </div>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            Currently, PiggyPulse don't support multiple currencies. This feature is coming soon.
          </Text>
        </div>
      )}

      {/* Step 2: Periods (informational) */}
      {step === 2 && (
        <div className={classes.card}>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            How PiggyPulse tracks time
          </Text>
          <Text fz="sm" c="dimmed" mt="md">
            Periods are time windows that organize your transactions. Think of them as chapters in
            your financial story — each one has a start date, an end date.
          </Text>
          <Text fz="sm" c="dimmed" mt="sm">
            Transactions fall into periods based on their date — no manual assignment needed.
          </Text>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mt="xl" mb="xs">
            We&apos;ll set you up with the default:
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
              Monthly periods, starting on the 1st
            </Text>
            <Text fz="sm" fw={500}>
              3 periods prepared in advance
            </Text>
          </Stack>
          <Text fz="sm" c="dimmed" mt="sm" ta="center">
            You can change these settings later in Periods → Schedule.
          </Text>
          <div className={classes.navButtons}>
            <Button variant="subtle" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step 3: Accounts (skippable) */}
      {step === 3 && (
        <div className={classes.card}>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            Add your accounts
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            Where does your money live? Accounts represent your real accounts, and are not connected
            to your bank.
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            Add as many as you&apos;d like — or skip and add them later.
          </Text>
          <Stack gap="sm">
            {accounts.map((acct, i) => (
              <div key={acct.key} className={classes.accountEntry}>
                <Group grow mb="xs">
                  <TextInput
                    placeholder="Account name"
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
                  placeholder="Current balance"
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
                  description="Your real-world balance right now"
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
              + Add account
            </Button>
          </Stack>
          <div className={classes.navButtons}>
            <Button variant="subtle" onClick={handleBack}>
              Back
            </Button>
            <div className={classes.navRight}>
              <Button variant="subtle" c="dimmed" onClick={() => setStep(4)}>
                Skip for now
              </Button>
              <Button onClick={handleNext}>Continue</Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Categories (skippable) */}
      {step === 4 && (
        <div className={classes.card}>
          <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)" ta="center">
            Set up categories
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            Categories help you organize your transactions, and set-up targets.
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            Pick a starting template — you can add, remove, or change categories anytime.
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
            Colors auto-assigned by direction + behavior. You can customize categories anytime.
          </Text>
          <div className={classes.navButtons}>
            <Button variant="subtle" onClick={handleBack}>
              Back
            </Button>
            <div className={classes.navRight}>
              <Button variant="subtle" c="dimmed" onClick={() => setStep(5)}>
                Skip for now
              </Button>
              <Button onClick={handleNext} disabled={!selectedTemplate}>
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
            You&apos;re all set!
          </Text>
          <Text fz="sm" c="dimmed" ta="center" mt={4} mb="lg">
            Your dashboard is ready. Here&apos;s what we configured:
          </Text>

          <Stack gap={0}>
            {/* Currency */}
            <div className={classes.summarySection}>
              <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
                Currency
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
                Periods
              </Text>
              <Text fz="sm" fw={500}>
                Monthly, starting on the 1st
              </Text>
              <Text fz="xs" c="dimmed">
                3 periods prepared in advance
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

          <Button fullWidth mt="xl" size="md" onClick={handleComplete} loading={isSubmitting}>
            Go to Dashboard
          </Button>
          <Button
            fullWidth
            mt="xs"
            variant="subtle"
            size="sm"
            onClick={handleGoToTransactions}
            loading={isSubmitting}
          >
            Add your first transaction
          </Button>
        </div>
      )}
    </div>
  );
}
