import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CloseButton, Text, UnstyledButton } from '@mantine/core';
import { useAccounts } from '@/hooks/v2/useAccounts';
import { useBudgetPeriods } from '@/hooks/v2/useBudgetPeriods';
import { useCategories } from '@/hooks/v2/useCategories';
import { usePageHint } from '@/hooks/v2/usePageHints';
import { useHasAnyTransactions } from '@/hooks/v2/useTransactions';
import classes from './GettingStartedCard.module.css';

const HINT_ID = 'getting-started';

interface Step {
  key: string;
  complete: boolean;
  route: string;
}

export function GettingStartedCard(_props: { periodId: string }) {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();
  const { isVisible, dismissHint } = usePageHint(HINT_ID);

  const { data: accountsData } = useAccounts();
  const { data: periodsData } = useBudgetPeriods({ limit: 1 });
  const { data: categoriesData } = useCategories({ limit: 1 });
  const { data: hasAnyTransactions } = useHasAnyTransactions();

  const hasAccounts = (accountsData?.data?.length ?? 0) > 0;
  const hasPeriods = (periodsData?.data?.length ?? 0) > 0;
  const hasCategories = (categoriesData?.data?.length ?? 0) > 0;
  const hasTransactions = hasAnyTransactions ?? false;

  const steps: Step[] = [
    { key: 'createAccount', complete: hasAccounts, route: '/accounts' },
    { key: 'createPeriod', complete: hasPeriods, route: '/periods' },
    { key: 'setCategories', complete: hasCategories, route: '/categories' },
    { key: 'addTransaction', complete: hasTransactions, route: '/transactions' },
  ];

  const completedCount = steps.filter((s) => s.complete).length;
  const allComplete = completedCount === steps.length;

  // Don't show if dismissed or all steps complete
  if (!isVisible || allComplete) {
    return null;
  }

  return (
    <div className={classes.card} data-testid="getting-started-card">
      <div className={classes.header}>
        <div>
          <Text fz="lg" fw={700} ff="var(--mantine-font-family-headings)">
            {t('gettingStarted.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('gettingStarted.subtitle')}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text fz="xs" c="dimmed" className={classes.progressText}>
            {completedCount}/{steps.length}
          </Text>
          <CloseButton size="sm" onClick={dismissHint} aria-label="Dismiss getting started" />
        </div>
      </div>

      <div className={classes.stepList}>
        {steps.map((step) => (
          <UnstyledButton
            key={step.key}
            className={classes.step}
            onClick={() => navigate(step.route)}
          >
            <div
              className={`${classes.stepIcon} ${step.complete ? classes.stepComplete : classes.stepIncomplete}`}
            >
              {step.complete ? <IconCheck size={14} /> : null}
            </div>
            <div className={classes.stepContent}>
              <Text
                fz="sm"
                fw={500}
                td={step.complete ? 'line-through' : undefined}
                c={step.complete ? 'dimmed' : undefined}
              >
                {t(`gettingStarted.steps.${step.key}.title`)}
              </Text>
              <Text fz="xs" c="dimmed">
                {t(`gettingStarted.steps.${step.key}.description`)}
              </Text>
            </div>
          </UnstyledButton>
        ))}
      </div>
    </div>
  );
}
