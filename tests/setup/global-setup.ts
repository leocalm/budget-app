import { e2eEnv } from './env';

async function waitForHealthcheck(url: string, maxAttempts = 30): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until max attempts.
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 1_000);
    });
  }

  throw new Error(`Healthcheck did not succeed after ${maxAttempts} attempts: ${url}`);
}

async function globalSetup(): Promise<void> {
  if (e2eEnv.apiMode !== 'real') {
    return;
  }

  const apiHealthUrl = `${e2eEnv.apiUrl}${e2eEnv.apiHealthPath}`;
  await waitForHealthcheck(apiHealthUrl);
}

export default globalSetup;
