import { IconAlertTriangle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Alert, Anchor, Stack, Text } from '@mantine/core';

export function PeriodGapWarning() {
  const navigate = useNavigate();

  return (
    <Stack gap="sm" data-testid="period-gap-warning">
      <Alert icon={<IconAlertTriangle size={16} />} color="yellow" variant="light" p="xs">
        <Text fz="xs">Today doesn't fall within any period</Text>
      </Alert>
      <Anchor
        fz="sm"
        ta="center"
        onClick={() => navigate('/v2/periods?create=true')}
        data-testid="period-create-link"
      >
        Create a period
      </Anchor>
    </Stack>
  );
}
