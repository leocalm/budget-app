import { useTranslation } from 'react-i18next';
import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';

export function UserMenu() {
  const { t } = useTranslation();
  return (
    <Menu shadow="md" width={200} position="right-end">
      <Menu.Target>
        <UnstyledButton
          w="100%"
          p="xs"
          style={{ borderRadius: '8px', transition: 'background-color 0.2s' }}
        >
          <Group>
            <Avatar radius="xl" color="cyan">
              JD
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {t('layout.userMenu.userName')}
              </Text>
              <Text c="dimmed" size="xs">
                {t('layout.userMenu.userEmail')}
              </Text>
            </div>
            <span style={{ fontSize: 14 }}>➡️</span>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('layout.userMenu.application')}</Menu.Label>
        <Menu.Item leftSection={<span style={{ fontSize: 14 }}>👤</span>}>
          {t('layout.userMenu.profile')}
        </Menu.Item>
        <Menu.Item leftSection={<span style={{ fontSize: 14 }}>⚙️</span>}>
          {t('layout.userMenu.settings')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<span style={{ fontSize: 14 }}>🚪</span>}>
          {t('layout.userMenu.logout')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
