import { useTranslation } from 'react-i18next';
import { Group, Image, Text, ThemeIcon } from '@mantine/core';

export function Logo() {
  const { t } = useTranslation();

  return (
    <Group gap="xs">
      <ThemeIcon size={40} radius="md" bg="transparent" variant="light">
        <Image src="/assets/icons/png/gradient/piggy-pulse.png" />
      </ThemeIcon>
      <Text size="xl" fw={700} className="brand-text">
        {t('layout.logo.title')}
      </Text>
    </Group>
  );
}
