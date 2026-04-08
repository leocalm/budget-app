import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { Text } from '@mantine/core';
import piggyWhite from '@/assets/images/piggy-pulse-white.svg';
import classes from './Auth.module.css';

const PAGE_TAGLINE_KEYS: Record<string, string> = {
  login: 'auth.tagline.login',
  register: 'auth.tagline.register',
  'forgot-password': 'auth.tagline.forgotPassword',
  'reset-password': 'auth.tagline.resetPassword',
  unlock: 'auth.tagline.unlock',
  'emergency-2fa-disable': 'auth.tagline.emergency2faDisable',
};

export function V2AuthLayout() {
  const { t } = useTranslation('v2');
  const location = useLocation();
  const page = location.pathname.split('/').pop() ?? '';
  const taglineKey = PAGE_TAGLINE_KEYS[page] ?? 'auth.tagline.default';
  const tagline = t(taglineKey);
  return (
    <div className={classes.splitLayout}>
      {/* Left: gradient branding panel */}
      <div className={classes.brandPanel}>
        <img src={piggyWhite} alt={t('common.piggyPulse')} className={classes.brandLogo} />
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)" c="white">
          {t('common.piggyPulse')}
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
