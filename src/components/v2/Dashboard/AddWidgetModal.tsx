import { useTranslation } from 'react-i18next';
import { Modal, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { WIDGET_DEFINITIONS } from './widgetDefinitions';
import classes from './DashboardCustomize.module.css';

type AccountResponse = components['schemas']['AccountResponse'];

interface AddWidgetModalProps {
  opened: boolean;
  onClose: () => void;
  activeWidgetIds: Set<string>;
  accounts: AccountResponse[];
  activeAccountIds: Set<string>;
  onAddWidget: (id: string) => void;
  onAddAccount: (id: string) => void;
}

export function AddWidgetModal({
  opened,
  onClose,
  activeWidgetIds,
  accounts,
  activeAccountIds,
  onAddWidget,
  onAddAccount,
}: AddWidgetModalProps) {
  const { t } = useTranslation('v2');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('dashboard.addWidget')}
      size="lg"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Text fz="sm" c="dimmed" mb="md">
        {t('dashboard.addWidgetHint')}
      </Text>

      <div className={classes.widgetGrid}>
        {WIDGET_DEFINITIONS.map((w) => {
          const isActive = activeWidgetIds.has(w.id);
          return (
            <div
              key={w.id}
              className={isActive ? classes.widgetOptionDisabled : classes.widgetOption}
              onClick={() => {
                if (!isActive) {
                  onAddWidget(w.id);
                  onClose();
                }
              }}
              role="button"
              tabIndex={isActive ? -1 : 0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isActive) {
                  e.preventDefault();
                  onAddWidget(w.id);
                  onClose();
                }
              }}
            >
              <Text fz={24}>{w.emoji}</Text>
              <Text fz="sm" fw={600}>
                {t(w.nameKey)}
              </Text>
              <Text fz="xs" c="dimmed">
                {isActive ? t('dashboard.alreadyAdded') : t(w.descKey)}
              </Text>
            </div>
          );
        })}

        {/* Individual account cards */}
        {accounts.map((acct) => {
          const isActive = activeAccountIds.has(acct.id);
          return (
            <div
              key={acct.id}
              className={isActive ? classes.widgetOptionDisabled : classes.widgetOption}
              onClick={() => {
                if (!isActive) {
                  onAddAccount(acct.id);
                  onClose();
                }
              }}
              role="button"
              tabIndex={isActive ? -1 : 0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isActive) {
                  e.preventDefault();
                  onAddAccount(acct.id);
                  onClose();
                }
              }}
            >
              <Text fz={24}>🏦</Text>
              <Text fz="sm" fw={600}>
                {acct.name}
              </Text>
              <Text fz="xs" c="dimmed">
                {isActive ? t('dashboard.alreadyAdded') : t('dashboard.accountCard')}
              </Text>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
