import { useLocation, useNavigate } from 'react-router-dom';
import { Drawer, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useV2Theme } from '@/theme/v2';
import { bottomNavItems, moreDrawerItems } from './navConfig';
import classes from './AppShell.module.css';

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { accents } = useV2Theme();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <>
      <nav className={classes.bottomNav} data-testid="bottom-nav">
        {bottomNavItems.map((item) => {
          const active = isActive(item.to);
          return (
            <UnstyledButton
              key={item.to}
              className={classes.bottomNavItem}
              onClick={() => navigate(item.to)}
              data-testid={`bottom-nav-${item.label.toLowerCase()}`}
            >
              <Text fz="lg">{item.icon}</Text>
              <Text
                fz={10}
                fw={active ? 600 : 400}
                style={{ color: active ? accents.primary : undefined }}
              >
                {item.label}
              </Text>
            </UnstyledButton>
          );
        })}

        {/* More button */}
        <UnstyledButton
          className={classes.bottomNavItem}
          onClick={openDrawer}
          data-testid="bottom-nav-more"
        >
          <Text fz="lg">•••</Text>
          <Text fz={10}>More</Text>
        </UnstyledButton>
      </nav>

      {/* More drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="bottom"
        size="auto"
        title="More"
        data-testid="more-drawer"
      >
        <Stack gap={0}>
          {moreDrawerItems.map((item) => {
            const active = isActive(item.to);
            return (
              <UnstyledButton
                key={item.to}
                className={classes.drawerItem}
                data-active={active || undefined}
                onClick={() => {
                  navigate(item.to);
                  closeDrawer();
                }}
              >
                <Text fz="md">{item.icon}</Text>
                <Text
                  fz="sm"
                  fw={active ? 500 : 400}
                  style={{ color: active ? accents.primary : undefined }}
                >
                  {item.label}
                </Text>
              </UnstyledButton>
            );
          })}
        </Stack>
      </Drawer>
    </>
  );
}
