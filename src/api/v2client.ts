import createClient from 'openapi-fetch';
import type { paths } from './v2';

const baseUrl = import.meta.env.DEV
  ? 'http://localhost:8000/api/v1'
  : 'https://api.piggy-pulse.com/api/v1';

export const apiClient = createClient<paths>({
  baseUrl,
  credentials: 'include', // Sends the `user` session cookie automatically on every request
});
