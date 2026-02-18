import { ReactNode } from 'react';
import { Text } from '@mantine/core';
import { PulseLoader } from '@/components/PulseLoader';
import classes from './LoadingState.module.css';

export type LoadingStateVariant =
  | 'spinner'
  | 'dots'
  | 'bars'
  | 'progress'
  | 'inline'
  | 'overlay'
  | 'fullscreen';
export type LoadingStateSize = 'sm' | 'md' | 'lg';

export interface LoadingStateProps {
  /** Visual variant of the loading state */
  variant?: LoadingStateVariant;
  /** Size of the loading indicator */
  size?: LoadingStateSize;
  /** Text to display with loading indicator */
  text?: string;
  /** Progress percentage (0-100) for progress variant */
  progress?: number;
  /** Whether progress is indeterminate */
  indeterminate?: boolean;
  /** Children to wrap (for overlay variant) */
  children?: ReactNode;
  /** Whether loading is active (for overlay variant) */
  loading?: boolean;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * LoadingState component for displaying loading indicators.
 * Supports multiple variants for different contexts.
 */
export function LoadingState({
  variant = 'spinner',
  size = 'md',
  text,
  progress,
  indeterminate = false,
  children,
  loading = true,
  'data-testid': testId,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: {
      dot: classes.dotSm,
      bar: classes.barSm,
    },
    md: {
      dot: classes.dotMd,
      bar: classes.barMd,
    },
    lg: {
      dot: classes.dotLg,
      bar: classes.barLg,
    },
  };

  const pulseSizes: Record<LoadingStateSize, number> = {
    sm: 130,
    md: 180,
    lg: 220,
  };

  // Spinner variant
  if (variant === 'spinner') {
    return (
      <div className={classes.loadingContainer} data-testid={testId}>
        <PulseLoader
          state="loading"
          size={pulseSizes[size]}
          color="var(--accent-primary)"
          speed={1.3}
        />
        {text && <Text className={classes.loadingText}>{text}</Text>}
      </div>
    );
  }

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className={classes.loadingContainer} data-testid={testId}>
        <div className={classes.dotsContainer}>
          <div className={`${classes.dot} ${sizeClasses[size].dot}`} />
          <div className={`${classes.dot} ${sizeClasses[size].dot}`} />
          <div className={`${classes.dot} ${sizeClasses[size].dot}`} />
        </div>
        {text && <Text className={classes.loadingText}>{text}</Text>}
      </div>
    );
  }

  // Bars variant
  if (variant === 'bars') {
    return (
      <div className={classes.loadingContainer} data-testid={testId}>
        <div className={classes.barsContainer}>
          <div className={`${classes.bar} ${sizeClasses[size].bar}`} />
          <div className={`${classes.bar} ${sizeClasses[size].bar}`} />
          <div className={`${classes.bar} ${sizeClasses[size].bar}`} />
          <div className={`${classes.bar} ${sizeClasses[size].bar}`} />
          <div className={`${classes.bar} ${sizeClasses[size].bar}`} />
        </div>
        {text && <Text className={classes.loadingText}>{text}</Text>}
      </div>
    );
  }

  // Progress variant
  if (variant === 'progress') {
    const displayProgress = indeterminate ? undefined : Math.min(Math.max(progress || 0, 0), 100);

    return (
      <div className={classes.loadingContainer} data-testid={testId}>
        <div className={classes.progressContainer}>
          <div className={classes.progressLabel}>
            <span className={classes.progressText}>{text || 'Loading...'}</span>
            {!indeterminate && displayProgress !== undefined && (
              <span className={classes.progressPercentage}>{Math.round(displayProgress)}%</span>
            )}
          </div>
          <div className={classes.progressBar}>
            <div
              className={`${classes.progressFill} ${indeterminate ? classes.progressIndeterminate : ''}`}
              style={!indeterminate ? { width: `${displayProgress}%` } : undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={classes.inlineContainer} data-testid={testId}>
        <PulseLoader
          state="loading"
          size={84}
          color="var(--accent-primary)"
          speed={1.2}
          className={classes.inlinePulse}
        />
        {text && <span className={classes.inlineText}>{text}</span>}
      </div>
    );
  }

  // Overlay variant
  if (variant === 'overlay') {
    return (
      <div className={classes.overlayContainer} data-testid={testId}>
        {children}
        {loading && (
          <div className={classes.overlayBackdrop}>
            <div className={classes.overlayContent}>
              <PulseLoader
                state="loading"
                size={500}
                color="var(--accent-primary)"
                speed={1.2}
                className={classes.overlayPulse}
              />
              {text && <div className={classes.overlayText}>{text}</div>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fullscreen variant
  if (variant === 'fullscreen') {
    return (
      <div className={classes.fullscreenContainer} data-testid={testId}>
        <div className={classes.fullscreenLogo}>💰</div>
        <div className={classes.fullscreenText}>{text || 'Loading PiggyPulse...'}</div>
        <div className={classes.fullscreenSubtext}>Just a moment</div>
      </div>
    );
  }

  return null;
}
