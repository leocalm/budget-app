import { Progress, Stack, Text } from '@mantine/core';
import { PasswordStrengthResult } from '@/hooks/usePasswordStrength';

interface PasswordStrengthIndicatorProps {
  result: PasswordStrengthResult | null;
}

export function PasswordStrengthIndicator({ result }: PasswordStrengthIndicatorProps) {
  if (!result) {
    return null;
  }

  const colors = ['red', 'orange', 'yellow', 'lime', 'green'];
  const color = colors[result.score];

  return (
    <Stack gap="xs">
      <Progress
        value={(result.score + 1) * 20}
        color={color}
        size="sm"
        aria-label="Password strength"
      />
      <Text size="sm" c={color} fw={500}>
        {result.feedback}
      </Text>
      {result.suggestions.length > 0 && (
        <Stack gap="xs">
          <Text size="xs" c="dimmed" fw={500}>
            Suggestions:
          </Text>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: 'var(--mantine-font-size-xs)' }}>
            {result.suggestions.map((suggestion, index) => (
              <li key={index} style={{ color: 'var(--mantine-color-gray-6)' }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </Stack>
      )}
    </Stack>
  );
}
