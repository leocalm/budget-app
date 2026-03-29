import { Outlet } from 'react-router-dom';
import { Text } from '@mantine/core';
import piggyWhite from '@/assets/images/piggy-pulse-white.svg';
import classes from './Auth.module.css';

interface V2AuthLayoutProps {
  tagline?: string;
}

export function V2AuthLayout({ tagline }: V2AuthLayoutProps) {
  return (
    <div className={classes.splitLayout}>
      {/* Left: gradient branding panel */}
      <div className={classes.brandPanel}>
        <img src={piggyWhite} alt="PiggyPulse" className={classes.brandLogo} />
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)" c="white">
          PiggyPulse
        </Text>
        <Text fz="sm" c="rgba(255,255,255,0.7)" ta="center" maw={300}>
          {tagline ?? 'Your financial pulse — calm, clear, and entirely yours.'}
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
