import { useTranslation } from 'react-i18next';
import { Button, Group, Paper, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const BOTTOM_NAV_HEIGHT = 60;

export function CookieBanner() {
  const { t } = useTranslation();
  const { consent, accept, reject } = useCookieConsent();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  if (consent !== null) {
    return null;
  }

  return (
    <Paper
      data-testid="cookie-banner"
      aria-label="Cookie consent"
      role="region"
      shadow="md"
      p="md"
      style={{
        position: 'fixed',
        bottom: isMobile ? BOTTOM_NAV_HEIGHT : 0,
        left: 0,
        right: 0,
        zIndex: 200,
        borderRadius: 0,
        borderTop: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Text size="sm" style={{ flex: 1, minWidth: 200 }}>
          {t('cookieBanner.message')}
        </Text>
        <Group gap="sm" wrap="nowrap">
          <Button variant="outline" size="sm" onClick={reject}>
            {t('cookieBanner.reject')}
          </Button>
          <Button data-testid="cookie-accept" variant="filled" size="sm" onClick={accept}>
            {t('cookieBanner.accept')}
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
