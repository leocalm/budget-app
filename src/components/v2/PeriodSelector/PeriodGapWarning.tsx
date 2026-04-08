import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Alert, Anchor, Stack, Text } from '@mantine/core';

export function PeriodGapWarning() {
  const { t } = useTranslation('v2');
  return (
    <Stack gap="sm" data-testid="period-gap-warning">
      <Alert icon={<IconAlertTriangle size={16} />} color="yellow" variant="light" p="xs">
        <Text fz="xs">{t('periodSelector.gapWarning')}</Text>
      </Alert>
      <Anchor
        component={Link}
        to="/periods?create=true"
        fz="sm"
        ta="center"
        data-testid="period-create-link"
      >
        {t('periodSelector.createPeriod')}
      </Anchor>
    </Stack>
  );
}
