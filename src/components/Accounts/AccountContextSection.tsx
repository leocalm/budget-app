import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Collapse,
  Divider,
  Progress,
  SimpleGrid,
  Skeleton,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useAccountContext } from '@/hooks/useAccountContext';
import { CurrencyResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';

interface Props {
  accountId: string;
  periodId: string | null;
  currency: CurrencyResponse | undefined;
}

export function AccountContextSection({ accountId, periodId, currency }: Props) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const { data, isLoading } = useAccountContext(accountId, periodId, everOpened);

  const handleToggle = () => {
    setOpened((o) => !o);
    if (!everOpened) {
      setEverOpened(true);
    }
  };

  const fmt = (cents: number) => (currency ? formatCurrency(cents, currency) : '—');

  const maxAmount = data?.categoryImpact[0]?.amount ?? 1;

  return (
    <div>
      <Divider mb="md" />
      <UnstyledButton onClick={handleToggle}>
        <Text size="sm" tt="uppercase" c="dimmed">
          {t('accounts.detail.context.toggle')} {opened ? '▴' : '▾'}
        </Text>
      </UnstyledButton>
      <Collapse in={opened}>
        {isLoading ? (
          <Skeleton height={200} mt="md" />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={56} mt="xl">
            <div>
              <Text size="xs" tt="uppercase" c="dimmed" mb="xs">
                {t('accounts.detail.context.categoryImpact')}
              </Text>
              {data?.categoryImpact.map((item) => (
                <div key={item.categoryName} style={{ marginBottom: 12 }}>
                  <SimpleGrid cols={2}>
                    <Text size="sm">{item.categoryName}</Text>
                    <Text size="sm" ta="right">
                      {fmt(item.amount)}
                    </Text>
                  </SimpleGrid>
                  <Progress value={(item.amount / maxAmount) * 100} size="xs" mt={4} />
                </div>
              ))}
            </div>
            <div>
              <Text size="xs" tt="uppercase" c="dimmed" mb="xs">
                {t('accounts.detail.context.stability')}
              </Text>
              {data && (
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.8 }}>
                  {t('accounts.detail.context.closedPositive', {
                    positive: data.stability.periodsClosedPositive,
                    total: data.stability.periodsEvaluated,
                  })}
                  <br />
                  {t('accounts.detail.context.avgClosingBalance', {
                    value: fmt(data.stability.avgClosingBalance),
                  })}
                  <br />
                  {t('accounts.detail.context.highestClosingBalance', {
                    value: fmt(data.stability.highestClosingBalance),
                  })}
                  <br />
                  {t('accounts.detail.context.lowestClosingBalance', {
                    value: fmt(data.stability.lowestClosingBalance),
                  })}
                  <br />
                  {t('accounts.detail.context.largestOutflow', {
                    value: fmt(data.stability.largestSingleOutflow),
                    category: data.stability.largestSingleOutflowCategory,
                  })}
                </Text>
              )}
            </div>
          </SimpleGrid>
        )}
      </Collapse>
    </div>
  );
}
