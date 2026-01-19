;
// components/transactions/QuickAddTransaction/SuggestionChips.tsx
import { Group, Text, UnstyledButton } from '@mantine/core';
import classes from './SuggestionChips.module.css';


interface Suggestion {
  vendor: string;
  amount: number;
  categoryId: string;
}

interface SuggestionChipsProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
}

export const SuggestionChips = ({ suggestions, onSelect }: SuggestionChipsProps) => {
  if (suggestions.length === 0) {return null;}

  return (
    <Group gap="sm" wrap="wrap">
      <Text size="xs" fw={600} tt="uppercase" c="dimmed" className={classes.label}>
        Recent:
      </Text>

      {suggestions.map((suggestion, index) => (
        <UnstyledButton
          key={`${suggestion.vendor}-${index}`}
          className={classes.chip}
          onClick={() => onSelect(suggestion)}
        >
          <Text size="sm">{suggestion.vendor}</Text>
        </UnstyledButton>
      ))}
    </Group>
  );
};
