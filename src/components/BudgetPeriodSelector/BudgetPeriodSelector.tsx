import dayjs from 'dayjs';
import {
  IconAlertTriangle,
  IconCalendarMonth,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useClickOutside, useDisclosure, useMediaQuery } from '@mantine/hooks';
import { BudgetPeriod } from '@/types/budget';
import classes from './BudgetPeriodSelector.module.css';

interface BudgetPeriodSelectorProps {
  periods: BudgetPeriod[];
  selectedPeriodId: string | null;
  onPeriodChange: (id: string) => void;
}

export function BudgetPeriodSelector({
  periods,
  selectedPeriodId,
  onPeriodChange,
}: BudgetPeriodSelectorProps) {
  const { t } = useTranslation();
  const [mobileOpened, { open: openMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop, close: closeDesktop }] = useDisclosure(false);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const desktopDropdownRef = useClickOutside(() => {
    closeDesktop();
  });

  const closePicker = () => {
    closeMobile();
    closeDesktop();
  };

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);
  const hasNoPeriods = periods.length === 0;

  const getPeriodRangeLabel = (period: BudgetPeriod) => {
    const startLabel = dayjs(period.startDate).format('MMM D');
    const endLabel = dayjs(period.endDate).format('MMM D');

    return t('budgetPeriodSelector.range', {
      start: startLabel,
      end: endLabel,
    });
  };

  const getRemainingDaysLabel = (period: BudgetPeriod) => {
    const daysLeft = dayjs(period.endDate).diff(dayjs().startOf('day'), 'day');

    if (daysLeft < 0) {
      return t('budgetPeriodSelector.ended');
    }

    return t('budgetPeriodSelector.daysLeft', { count: daysLeft });
  };

  // Group periods by year
  const sortedPeriods = [...periods].sort(
    (left, right) => dayjs(right.startDate).valueOf() - dayjs(left.startDate).valueOf()
  );

  const groupedPeriods = sortedPeriods.reduce(
    (acc, period) => {
      const year = period.endDate.slice(0, 4).toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(period);
      return acc;
    },
    {} as Record<string, BudgetPeriod[]>
  );

  // Sort years descending (newest first)
  const years = Object.keys(groupedPeriods).sort((a, b) => b.localeCompare(a));

  const handlePeriodSelect = (periodId: string) => {
    onPeriodChange(periodId);
    closePicker();
  };

  const triggerLabel = selectedPeriod
    ? selectedPeriod.name
    : hasNoPeriods
      ? t('budgetPeriodSelector.noPeriods')
      : t('budgetPeriodSelector.selectPeriod');

  const triggerMeta = selectedPeriod
    ? t('budgetPeriodSelector.triggerMeta', {
        range: getPeriodRangeLabel(selectedPeriod),
        days: getRemainingDaysLabel(selectedPeriod),
      })
    : t('budgetPeriodSelector.triggerMetaEmpty');

  const trigger = (
    <Button
      variant="default"
      size="sm"
      radius="md"
      className={classes.triggerButton}
      data-testid="budget-period-trigger"
      leftSection={<IconCalendarMonth size={18} stroke={1.5} />}
      rightSection={
        (isMobile ? mobileOpened : desktopOpened) ? (
          <IconChevronUp size={14} />
        ) : (
          <IconChevronDown size={14} />
        )
      }
      onClick={isMobile ? openMobile : toggleDesktop}
    >
      <span className={classes.triggerContent}>
        <span className={classes.triggerLabel}>{triggerLabel}</span>
        <span className={classes.triggerMeta}>{triggerMeta}</span>
      </span>
    </Button>
  );

  const periodList = (
    <ScrollArea.Autosize mah={300} className={classes.periodList} type="auto">
      <Stack gap="xs">
        {years.map((year) => (
          <div key={year}>
            <Text size="xs" fw={700} c="dimmed" className={classes.yearLabel}>
              {year}
            </Text>
            <Stack gap={6}>
              {groupedPeriods[year].map((period) => {
                const isActive = period.id === selectedPeriodId;

                return (
                  <Button
                    key={period.id}
                    variant={isActive ? 'light' : 'subtle'}
                    color={isActive ? 'cyan' : 'gray'}
                    className={classes.periodButton}
                    onClick={() => handlePeriodSelect(period.id)}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                      <Box className={classes.periodDetails}>
                        <Text size="sm" fw={isActive ? 700 : 500} className={classes.periodName}>
                          {period.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {getPeriodRangeLabel(period)}
                        </Text>
                      </Box>
                      {isActive && (
                        <Badge variant="light" color="cyan" size="xs">
                          {t('budgetPeriodSelector.active')}
                        </Badge>
                      )}
                    </Group>
                  </Button>
                );
              })}
            </Stack>
          </div>
        ))}
      </Stack>
    </ScrollArea.Autosize>
  );

  const warningCard = (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      color="orange"
      variant="light"
      title={t('budgetPeriodSelector.warningTitle')}
      className={classes.warningCard}
    >
      <Text size="sm" className={classes.warningText}>
        {t('budgetPeriodSelector.warningMessage')}
      </Text>
      <Button
        component={Link}
        to="/periods"
        size="xs"
        variant="filled"
        color="orange"
        className={classes.warningAction}
        onClick={closePicker}
      >
        {t('budgetPeriodSelector.fixPeriodGap')}
      </Button>
    </Alert>
  );

  const manageButton = (
    <Button
      component={Link}
      to="/periods"
      variant="light"
      color="cyan"
      fullWidth
      className={classes.manageButton}
      onClick={closePicker}
    >
      {t('budgetPeriodSelector.managePeriods')}
    </Button>
  );

  const pickerContent = (
    <Stack gap="sm" className={classes.dropdownContent}>
      {hasNoPeriods ? warningCard : periodList}
      <Divider />
      {manageButton}
    </Stack>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer
          opened={mobileOpened}
          onClose={closePicker}
          position="bottom"
          size="75%"
          keepMounted
          transitionProps={{ duration: 0 }}
          withCloseButton={false}
          classNames={{
            content: classes.drawerContent,
            body: classes.drawerBody,
          }}
          data-testid="budget-period-drawer"
        >
          <div className={classes.drawerHandle} aria-hidden="true" />
          <Text fw={700} size="sm" mb="sm">
            {t('budgetPeriodSelector.sheetTitle')}
          </Text>
          {pickerContent}
        </Drawer>
      </>
    );
  }

  return (
    <div ref={desktopDropdownRef} className={classes.desktopRoot}>
      {trigger}
      {desktopOpened && (
        <Paper className={classes.dropdown} shadow="md" withBorder>
          {pickerContent}
        </Paper>
      )}
    </div>
  );
}
