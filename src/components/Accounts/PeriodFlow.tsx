import { useTranslation } from 'react-i18next';
import { SimpleGrid, Skeleton, Text } from '@mantine/core';
import { AccountDetail, CurrencyResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';

interface Props {
  detail: AccountDetail | undefined;
  currency: CurrencyResponse | undefined;
  isLoading: boolean;
}

export function PeriodFlow({ detail, currency, isLoading }: Props) {
  const { t } = useTranslation();

  if (isLoading) {
    return <Skeleton height={80} mb="xl" />;
  }

  const fmt = (cents: number) => (currency ? formatCurrency(cents, currency) : '—');

  const rows = [
    { label: t('accounts.detail.periodFlow.inflows'), value: detail?.inflows ?? 0 },
    { label: t('accounts.detail.periodFlow.outflows'), value: detail?.outflows ?? 0 },
    { label: t('accounts.detail.periodFlow.net'), value: detail?.net ?? 0, bold: true },
  ];

  return (
    <div style={{ marginBottom: 36 }}>
      <Text size="xs" tt="uppercase" c="dimmed" mb="xs">
        {t('accounts.detail.periodFlow.title')}
      </Text>
      {rows.map(({ label, value, bold }) => (
        <SimpleGrid key={label} cols={2} style={{ marginBottom: 4 }}>
          <Text fw={bold ? 700 : undefined}>{label}</Text>
          <Text ta="right" fw={bold ? 700 : undefined}>
            {fmt(value)}
          </Text>
        </SimpleGrid>
      ))}
    </div>
  );
}
