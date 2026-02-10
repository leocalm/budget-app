import React, { useEffect, useState } from 'react';

import './PulseLoader.css';

type PulseState = 'loading' | 'success' | 'error';

type PulseLoaderProps = {
  state: PulseState;
  size?: number;
  color?: string;
  speed?: number;
  className?: string;
};

const PULSE_PATH =
  'M2 19.0669H104.047L108.474 13.8381L113.476 25.4273L120.402 2L126.514 25.2688L131.403 13.9513L135.477 18.9536H234.447';
const FLATLINE_PATH = 'M2 20 H238';

export function PulseLoader({
  state,
  size = 120,
  color = 'currentColor',
  speed = 1.4,
  className,
}: PulseLoaderProps) {
  const [successDone, setSuccessDone] = useState(false);

  useEffect(() => {
    if (state !== 'success') {
      setSuccessDone(false);
    }
  }, [state]);

  const isError = state === 'error';
  const isSuccess = state === 'success';

  const pathClass =
    state === 'loading'
      ? 'pulse pulse--loading'
      : isSuccess
        ? successDone
          ? 'pulse pulse--success-done'
          : 'pulse pulse--success'
        : 'pulse pulse--error';

  return (
    <svg viewBox="-2 -3 243 37" width={size} aria-hidden className={className} style={{ color }}>
      <path
        d={isError ? FLATLINE_PATH : PULSE_PATH}
        pathLength={isError ? undefined : 100}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClass}
        style={{ animationDuration: `${speed}s` }}
        onAnimationEnd={() => {
          if (isSuccess) {
            setSuccessDone(true);
          }
        }}
      />
    </svg>
  );
}
