import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { UI } from '@/constants';

export function ToastViewport() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Notifications
      limit={UI.TOAST_STACK_LIMIT}
      position={isMobile ? 'bottom-center' : 'bottom-right'}
      containerWidth={isMobile ? `calc(100vw - ${UI.TOAST_MOBILE_SIDE_MARGIN_PX * 2}px)` : 420}
      style={
        isMobile
          ? {
              left: UI.TOAST_MOBILE_SIDE_MARGIN_PX,
              right: UI.TOAST_MOBILE_SIDE_MARGIN_PX,
              bottom: UI.TOAST_MOBILE_BOTTOM_OFFSET_PX,
            }
          : undefined
      }
    />
  );
}
