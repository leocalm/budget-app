import React from 'react';
import { Group, NumberFormatter, Paper, Progress, Text } from '@mantine/core';
import { MonthProgress } from '@/types/dashboard';

type MonthProgressCardProps = {
  data: MonthProgress | undefined;
};

export const MonthProgressCard = ({ data }: MonthProgressCardProps) => {
  if (!data) {
    return (
      <Paper
        shadow="md"
        radius="lg"
        p="lg"
        style={{
          background: 'var(--bg-card)',
        }}
      >
        Error
      </Paper>
    );
  }

  const date = data.currentDate;
  const remainingDays = data.remainingDays;
  const progress = data.daysPassedPercentage;

  return (
    <Paper
      shadow="md"
      radius="lg"
      p="lg"
      h="100%"
      style={{
        background: 'var(--bg-card)',
      }}
    >
      <Group justify="space-between" align="center">
        <div>
          <Text size="lg" fw={600}>
            Month Progress
          </Text>
          <Text size="lg" fw={600}>
            {date}
          </Text>
          <Text size="sm" c="dimmed">
            {remainingDays} days remaining
          </Text>
        </div>
        <div style={{ width: 140 }}>
          <Progress value={progress} radius="xl" size="xl" striped color="blue" />
          <Text mt={8} size="sm" c="blue">
            <NumberFormatter value={remainingDays} />
          </Text>
        </div>
      </Group>
    </Paper>
  );
};
