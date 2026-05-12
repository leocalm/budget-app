import { Client } from 'pg';

export async function clearRateLimits(): Promise<void> {
  const client = new Client({
    host: 'localhost',
    port: 5434,
    user: 'postgres',
    password: 'example',
    database: 'piggy_pulse_test_db',
  });

  try {
    await client.connect();
    await client.query('DELETE FROM login_rate_limits');
    await client.query('DELETE FROM two_factor_rate_limits');
  } finally {
    await client.end().catch(() => {});
  }
}
