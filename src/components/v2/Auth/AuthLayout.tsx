import { Outlet, useLocation } from 'react-router-dom';
import { Text } from '@mantine/core';
import piggyWhite from '@/assets/images/piggy-pulse-white.svg';
import classes from './Auth.module.css';

const PAGE_TAGLINES: Record<string, string> = {
  login: 'Welcome back. Your data is right where you left it.',
  register: 'Start your journey toward financial clarity.',
  'forgot-password': 'No worries — we will help you get back in.',
  'reset-password': 'Almost there. Choose a new password.',
  unlock: 'Verify your identity to continue.',
};

const DEFAULT_TAGLINE = 'Your financial pulse — calm, clear, and entirely yours.';

export function V2AuthLayout() {
  const location = useLocation();
  const page = location.pathname.split('/').pop() ?? '';
  const tagline = PAGE_TAGLINES[page] ?? DEFAULT_TAGLINE;
  return (
    <div className={classes.splitLayout}>
      {/* Left: gradient branding panel */}
      <div className={classes.brandPanel}>
        <img src={piggyWhite} alt="PiggyPulse" className={classes.brandLogo} />
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)" c="white">
          PiggyPulse
        </Text>
        <Text
          fz="sm"
          c="rgba(255,255,255,0.85)"
          ta="center"
          maw={300}
          className={classes.brandTagline}
        >
          {tagline}
        </Text>
      </div>

      {/* Right: form content */}
      <div className={classes.formPanel}>
        <div className={classes.formContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
