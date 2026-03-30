import { IconInfoCircle } from '@tabler/icons-react';
import { Alert, CloseButton, Text } from '@mantine/core';
import { usePageHint } from '@/hooks/v2/usePageHints';

export interface PageHintProps {
  /** Unique identifier for this hint (used as localStorage key) */
  hintId: string;
  /** The hint message to display */
  message: string;
}

/**
 * A dismissible inline hint banner for providing contextual guidance on a page.
 * Once dismissed, it stays hidden permanently (stored in localStorage).
 */
export function PageHint({ hintId, message }: PageHintProps) {
  const { isVisible, dismissHint } = usePageHint(hintId);

  if (!isVisible) {
    return null;
  }

  return (
    <Alert
      icon={<IconInfoCircle size={18} />}
      radius="md"
      styles={{
        root: {
          backgroundColor: 'var(--v2-surface)',
          border: '1px solid var(--v2-border)',
        },
        icon: {
          color: 'var(--v2-primary)',
        },
      }}
      data-testid={`page-hint-${hintId}`}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Text fz="sm" style={{ flex: 1 }}>
          {message}
        </Text>
        <CloseButton size="sm" onClick={dismissHint} aria-label="Dismiss hint" />
      </div>
    </Alert>
  );
}
