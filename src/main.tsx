import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { ToastViewport } from '@/components/Notifications/ToastViewport';
import { initSentry, Sentry } from '@/lib/sentry';
import { initUmami } from '@/lib/umami';
import App from './App';
import { theme } from './theme';

import './i18n';

initSentry();
initUmami();

dayjs.extend(customParseFormat);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <ToastViewport />
        <Sentry.ErrorBoundary fallback={<div>Something went wrong.</div>}>
          <App />
        </Sentry.ErrorBoundary>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
