import { IconAlertTriangle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { Alert, Anchor, Stack, Text } from '@mantine/core';

export function PeriodGapWarning() {
  return (
    <Stack gap="sm" data-testid="period-gap-warning">
      <Alert icon={<IconAlertTriangle size={16} />} color="yellow" variant="light" p="xs">
        <Text fz="xs">Today doesn't fall within any period</Text>
      </Alert>
      <Anchor
        component={Link}
        to="/v2/periods?create=true"
        fz="sm"
        ta="center"
        data-testid="period-create-link"
      >
        Create a period
      </Anchor>
    </Stack>
  );
}
