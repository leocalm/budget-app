import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Stack, Text, Title } from '@mantine/core';

/**
 * Temporary placeholder page for v2 routes that aren't built yet.
 * Shows the current route path so we can verify navigation works.
 */
export function PlaceholderPage() {
  const { t } = useTranslation('v2');
  const { pathname } = useLocation();
  const pageName = pathname.split('/').pop() ?? 'Page';

  return (
    <Stack align="center" justify="center" mih={400} gap="sm">
      <Title order={2} style={{ textTransform: 'capitalize' }}>
        {pageName}
      </Title>
      <Text c="dimmed" fz="sm">
        {t('placeholder.comingSoon')}
      </Text>
    </Stack>
  );
}
