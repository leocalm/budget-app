import { Text } from '@mantine/core';
import classes from './Auth.module.css';

const SEGMENT_COLORS = ['#9aa0cc', '#7ca8c4', '#8b7ec8', '#8b7ec8'];
const LABELS = ['Very weak', 'Weak', 'Fair', 'Strong enough', 'Very strong'];

interface PasswordStrengthBarProps {
  score: number; // 0-4
}

export function PasswordStrengthBar({ score }: PasswordStrengthBarProps) {
  return (
    <>
      <div className={classes.strengthBar}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={classes.strengthSegment}
            style={i < score ? { backgroundColor: SEGMENT_COLORS[i] } : undefined}
          />
        ))}
      </div>
      <Text fz={11} c="dimmed" mt={2}>
        {LABELS[score]}
      </Text>
    </>
  );
}
