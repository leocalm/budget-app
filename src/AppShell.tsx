import {
  IconCategory,
  IconChartBar,
  IconHome,
  IconLockDollar,
  IconMoon,
  IconReceiptEuro,
  IconSun,
} from '@tabler/icons-react';
import cx from 'clsx';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  ActionIcon,
  AppShell,
  Burger,
  Flex,
  Grid,
  Group,
  NavLink,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Budget.module.css';

const pageNames: Record<string, string> = {
  '/': '',
  '/accounts': 'Accounts',
  '/categories': 'Categories',
  '/budget': 'Budget',
  '/transactions': 'Transactions',
};

export function BasicAppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const location = useLocation();
  const pageName = pageNames[location.pathname] || 'Budget App';

  const { setColorScheme } = useMantineColorScheme();
  const { colorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  const desktopWidth = desktopOpened ? 200 : 80; // 80px “icon rail” when closed

  // Helper to conditionally wrap with Tooltip when navbar is slim
  const WithMaybeTooltip = ({ label, children }: { label: string; children: React.ReactNode }) =>
    desktopOpened ? (
      <>{children}</>
    ) : (
      <Tooltip label={label} position="top" withArrow>
        {children}
      </Tooltip>
    );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: desktopWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      footer={{ height: 60, collapsed: false }}
      padding="md"
      layout="alt"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          <Title order={3}>{pageName}</Title>
          <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
          >
            <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
            <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
          </ActionIcon>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <WithMaybeTooltip label="Home">
          <NavLink
            to="/"
            component={RouterLink}
            label={desktopOpened || mobileOpened ? 'Home' : undefined}
            leftSection={<IconHome size={24} stroke={1.5} />}
            px="md" // keep the same horizontal padding in both states
            h={42}
          />
        </WithMaybeTooltip>

        <WithMaybeTooltip label="Accounts">
          <NavLink
            to="/accounts"
            component={RouterLink}
            label={desktopOpened || mobileOpened ? 'Accounts' : undefined}
            leftSection={<IconLockDollar size={24} stroke={1.5} />}
            px="md" // keep the same horizontal padding in both states
            h={42}
          />
        </WithMaybeTooltip>

        <WithMaybeTooltip label="Categories">
          <NavLink
            to="/categories"
            component={RouterLink}
            label={desktopOpened || mobileOpened ? 'Categories' : undefined}
            leftSection={<IconCategory size={24} stroke={1.5} />}
            px="md" // keep the same horizontal padding in both states
            h={42}
          />
        </WithMaybeTooltip>

        <WithMaybeTooltip label="Budget">
          <NavLink
            to="/budget"
            component={RouterLink}
            label={desktopOpened || mobileOpened ? 'Budget' : undefined}
            leftSection={<IconChartBar size={24} stroke={1.5} />}
            px="md" // keep the same horizontal padding in both states
            h={42}
          />
        </WithMaybeTooltip>

        <WithMaybeTooltip label="Transactions">
          <NavLink
            to="/transactions"
            component={RouterLink}
            label={desktopOpened || mobileOpened ? 'Transactions' : undefined}
            leftSection={<IconReceiptEuro size={24} stroke={1.5} />}
            px="md" // keep the same horizontal padding in both states
            h={42}
          />
        </WithMaybeTooltip>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Footer hiddenFrom="sm" p="xs">
        <Grid columns={10} justify="center" align="center">
          <Grid.Col span={2}>
            <Flex justify="center" align="center">
              <Tooltip label="Home" position="top" withArrow>
                <RouterLink to="/" style={{ textDecoration: 'none' }}>
                  <ActionIcon
                    size={42}
                    variant="transparent"
                    radius="md"
                    aria-label="Transactions"
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                  >
                    <IconHome size={24} stroke={1.5} />
                  </ActionIcon>
                </RouterLink>
              </Tooltip>
            </Flex>
          </Grid.Col>

          <Grid.Col span={2}>
            <Flex justify="center" align="center">
              <Tooltip label="Accounts" position="top" withArrow>
                <RouterLink to="/accounts" style={{ textDecoration: 'none' }}>
                  <ActionIcon
                    size={42}
                    variant="transparent"
                    radius="md"
                    aria-label="Transactions"
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                  >
                    <IconLockDollar size={24} stroke={1.5} />
                  </ActionIcon>
                </RouterLink>
              </Tooltip>
            </Flex>
          </Grid.Col>

          <Grid.Col span={2}>
            <Flex justify="center" align="center">
              <Tooltip label="Categories" position="top" withArrow>
                <RouterLink to="/categories" style={{ textDecoration: 'none' }}>
                  <ActionIcon
                    size={42}
                    variant="transparent"
                    radius="md"
                    aria-label="Transactions"
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                  >
                    <IconCategory size={24} stroke={1.5} />
                  </ActionIcon>
                </RouterLink>
              </Tooltip>
            </Flex>
          </Grid.Col>

          <Grid.Col span={2}>
            <Flex justify="center" align="center">
              <Tooltip label="Budget" position="top" withArrow>
                <RouterLink to="/budget" style={{ textDecoration: 'none' }}>
                  <ActionIcon
                    size={42}
                    variant="transparent"
                    radius="md"
                    aria-label="Transactions"
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                  >
                    <IconChartBar size={24} stroke={1.5} />
                  </ActionIcon>
                </RouterLink>
              </Tooltip>
            </Flex>
          </Grid.Col>

          <Grid.Col span={2}>
            <Flex justify="center" align="center">
              <Tooltip label="Transactions" position="top" withArrow>
                <RouterLink to="/transactions" style={{ textDecoration: 'none' }}>
                  <ActionIcon
                    size={42}
                    variant="transparent"
                    radius="md"
                    aria-label="Transactions"
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                  >
                    <IconReceiptEuro size={24} stroke={1.5} />
                  </ActionIcon>
                </RouterLink>
              </Tooltip>
            </Flex>
          </Grid.Col>
        </Grid>
      </AppShell.Footer>
    </AppShell>
  );
}
