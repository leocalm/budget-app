import { useTranslation } from 'react-i18next';
import { Badge } from '@mantine/core';

export function ScopeChip() {
  const { t } = useTranslation();

  return (
    <Badge variant="outline" color="gray" radius="sm" size="sm">
      {t('layout.scope.allAccounts')}
    </Badge>
  );
}
