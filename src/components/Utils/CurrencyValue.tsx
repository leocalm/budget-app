import { CurrencyResponse } from '@/types/account';

interface CurrencyValueProps {
  currency: CurrencyResponse | undefined;
  value: number;
}

export const CurrencyValue = ({ currency, value }: CurrencyValueProps) => {
  const currencySymbol = currency?.symbol ?? '€';

  return (
    <>
      {currencySymbol}
      &nbsp;
      {value}
    </>
  );
};
