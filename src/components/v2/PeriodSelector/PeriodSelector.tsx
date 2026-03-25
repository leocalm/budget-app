import { IconChevronDown } from '@tabler/icons-react';
import {
  Drawer,
  Group,
  Popover,
  Progress,
  Stack,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetPeriods } from '@/hooks/v2/useBudgetPeriods';
import { useV2Theme } from '@/theme/v2';
import { PeriodDropdown } from './PeriodDropdown';
import { periodDateRange, periodProgress } from './periodUtils';
import classes from './PeriodSelector.module.css';

interface PeriodSelectorProps {
  /** Render as a compact pill (for mobile header) */
  variant?: 'sidebar' | 'pill';
}

export function PeriodSelector({ variant = 'sidebar' }: PeriodSelectorProps) {
  const mantineTheme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${mantineTheme.breakpoints.sm})`);
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const { accents } = useV2Theme();

  const { selectedPeriodId, setSelectedPeriodId } = useBudgetPeriodSelection();
  const { data: periodsData } = useBudgetPeriods({ limit: 20 });

  const periods = periodsData?.data ?? [];
  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);
  const activePeriod = periods.find((p) => p.status === 'active');
  const isInGap = !activePeriod;

  const displayPeriod = selectedPeriod ?? activePeriod;
  const progress = displayPeriod ? periodProgress(displayPeriod) : 0;
  const dateRange = displayPeriod ? periodDateRange(displayPeriod) : '';
  const daysLeft = displayPeriod?.remainingDays;

  const handleSelect = (id: string) => {
    setSelectedPeriodId(id);
    close();
  };

  const dropdownContent = (
    <PeriodDropdown
      periods={periods}
      selectedPeriodId={selectedPeriodId}
      onSelect={handleSelect}
      isInGap={isInGap}
    />
  );

  // Mobile: pill trigger + bottom sheet
  if (variant === 'pill' || isMobile) {
    return (
      <>
        <UnstyledButton
          className={classes.periodPill}
          onClick={open}
          data-testid="period-selector-pill"
          aria-expanded={opened}
          aria-haspopup="dialog"
        >
          <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
            <Text fz="sm" fw={600}>
              {displayPeriod?.name ?? 'No active period'}
            </Text>
            {daysLeft != null && (
              <Text fz="xs" c="dimmed">
                {daysLeft}d left
              </Text>
            )}
          </Group>
          <Progress
            value={progress}
            size="xs"
            radius="xl"
            color={accents.primary}
            style={{ flex: 1, maxWidth: 80 }}
          />
          <IconChevronDown size={14} style={{ opacity: 0.5 }} />
        </UnstyledButton>

        <Drawer
          opened={opened}
          onClose={close}
          position="bottom"
          size="auto"
          title="Select Period"
          data-testid="period-selector-drawer"
        >
          {dropdownContent}
        </Drawer>
      </>
    );
  }

  // Desktop: sidebar trigger + popover
  return (
    <Popover
      opened={opened}
      onChange={(o) => (o ? open() : close())}
      position="bottom-start"
      width={260}
      shadow="md"
    >
      <Popover.Target>
        <UnstyledButton
          className={classes.periodCard}
          onClick={toggle}
          data-testid="period-selector"
          aria-expanded={opened}
          aria-haspopup="dialog"
        >
          <Text fz={10} fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.08em' }}>
            Period
          </Text>
          <Stack gap={4}>
            <Group justify="space-between" wrap="nowrap">
              <Text fz="sm" fw={600}>
                {displayPeriod?.name ?? 'No active period'}
              </Text>
              <IconChevronDown size={14} style={{ opacity: 0.5 }} />
            </Group>
            {displayPeriod && (
              <Text fz="xs" c="dimmed">
                {dateRange} · {daysLeft != null ? `${daysLeft} days left` : 'ended'}
              </Text>
            )}
            {!displayPeriod && isInGap && (
              <Text fz="xs" c="dimmed">
                You're in a gap
              </Text>
            )}
            <Progress value={progress} size={4} radius="xl" color={accents.secondary} />
          </Stack>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown
        p={0}
        style={{ backgroundColor: 'var(--v2-card)', border: '1px solid var(--v2-border)' }}
      >
        {dropdownContent}
      </Popover.Dropdown>
    </Popover>
  );
}
