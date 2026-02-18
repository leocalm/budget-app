import {
  IconArrowsExchange,
  IconCalendar,
  IconDots,
  IconLayoutDashboard,
  IconWallet,
  IconTag,
  IconBuildingStore,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Group, Paper, Text, ThemeIcon, UnstyledButton, Popover, Stack, NavLink, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export function BottomNavigation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { open, close }] = useDisclosure(false);

  const items = [
    {
      icon: <IconLayoutDashboard size={22} />,
      label: t('layout.navigation.dashboard'),
      route: '/dashboard' as string | null,
    },
    {
      icon: <IconArrowsExchange size={22} />,
      label: t('layout.navigation.transactions'),
      route: '/transactions' as string | null,
    },
    {
      icon: <IconCalendar size={22} />,
      label: t('layout.navigation.periods'),
      route: '/periods' as string | null,
    },
    {
      icon: <IconDots size={22} />,
      label: t('layout.navigation.more'),
      route: null as string | null,
    },
  ];

  return (
    <Paper
      pos="fixed"
      bottom={0}
      left={0}
      right={0}
      h={80}
      style={{
        zIndex: 100,
        borderTop: '1px solid var(--border-medium)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      radius={0}
    >
      <Group justify="space-around" align="center" h="100%" px="xs" gap={0}>
        {items.map((item) => {
          const isActive =
            item.route !== null &&
            (location.pathname === item.route ||
              (item.route === '/dashboard' && location.pathname === '/'));

          if (item.route === null) {
            return (
              <Popover
                key={item.label}
                opened={opened}
                onChange={(o) => (o ? open() : close())}
                onClose={close}
                position="top"
                withArrow
                trapFocus={false}
              >
                <Popover.Target>
                <UnstyledButton
                    onClick={() => open()}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                      height: '100%',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? 'var(--mantine-color-cyan-6)' : 'var(--mantine-color-dimmed)' }}>
                      {item.icon}
                    </span>
                    <Text size="xs" mt={4} c={isActive ? 'cyan' : 'dimmed'} fw={500}>
                      {item.label}
                    </Text>
                  </UnstyledButton>
                </Popover.Target>

                <Popover.Dropdown p={0} style={{
                  backgroundColor: 'var(--mantine-color-body)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 12,
                  minWidth: 220,
                }}>
                  <Stack gap={0}>
                    {(() => {
                      const route = '/accounts';
                      const active = location.pathname === route;
                      return (
                        <>
                          <NavLink
                            label={t('layout.navigation.accounts')}
                            leftSection={
                              <ThemeIcon
                                variant={active ? 'light' : 'transparent'}
                                color={active ? 'cyan' : 'gray'}
                                size="lg"
                                radius="md"
                              >
                                <IconWallet size={22} />
                              </ThemeIcon>
                            }
                            onClick={() => {
                              navigate(route);
                              close();
                            }}
                            variant="light"
                            styles={{
                              label: {
                                color: active ? 'var(--mantine-color-cyan-6)' : 'var(--mantine-color-dimmed)',
                                fontSize: 14,
                                fontWeight: 500,
                              },
                            }}
                            style={{ padding: '8px 12px' }}
                          />
                          <Divider />
                        </>
                      );
                    })()}

                    {(() => {
                      const route = '/categories';
                      const active = location.pathname === route;
                      return (
                        <>
                          <NavLink
                            label={t('layout.navigation.categories')}
                            leftSection={
                              <ThemeIcon
                                variant={active ? 'light' : 'transparent'}
                                color={active ? 'cyan' : 'gray'}
                                size="lg"
                                radius="md"
                              >
                                <IconTag size={22} />
                              </ThemeIcon>
                            }
                            onClick={() => {
                              navigate(route);
                              close();
                            }}
                            variant="light"
                            styles={{
                              label: {
                                color: active ? 'var(--mantine-color-cyan-6)' : 'var(--mantine-color-dimmed)',
                                fontSize: 14,
                                fontWeight: 500,
                              },
                            }}
                            style={{ padding: '8px 12px' }}
                          />
                          <Divider />
                        </>
                      );
                    })()}

                    {(() => {
                      const route = '/vendors';
                      const active = location.pathname === route;
                      return (
                        <>
                          <NavLink
                            label={t('layout.navigation.vendors')}
                            leftSection={
                              <ThemeIcon
                                variant={active ? 'light' : 'transparent'}
                                color={active ? 'cyan' : 'gray'}
                                size="lg"
                                radius="md"
                              >
                                <IconBuildingStore size={22} />
                              </ThemeIcon>
                            }
                            onClick={() => {
                              navigate(route);
                              close();
                            }}
                            variant="light"
                            styles={{
                              label: {
                                color: active ? 'var(--mantine-color-cyan-6)' : 'var(--mantine-color-dimmed)',
                                fontSize: 14,
                                fontWeight: 500,
                              },
                            }}
                            style={{ padding: '8px 12px' }}
                          />
                        </>
                      );
                    })()}

                    {/* Settings intentionally removed from mobile More popover per request */}
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            );
          }

          return (
            <UnstyledButton
              key={item.label}
              onClick={() => {
                navigate(item.route as string);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
              }}
            >
              <ThemeIcon
                variant={isActive ? 'light' : 'transparent'}
                color={isActive ? 'cyan' : 'gray'}
                size="lg"
                radius="md"
              >
                {item.icon}
              </ThemeIcon>
              <Text size="xs" mt={4} c={isActive ? 'cyan' : 'dimmed'} fw={500}>
                {item.label}
              </Text>
            </UnstyledButton>
          );
        })}
      </Group>
    </Paper>
  );
}
