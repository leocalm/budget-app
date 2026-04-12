import createClient from 'openapi-fetch';
import type { paths } from './v2';

export const v2BaseUrl = import.meta.env.DEV ? '/api/v2' : 'https://api.piggy-pulse.com/v2';

export const apiClient = createClient<paths>({
  baseUrl: v2BaseUrl,
  credentials: 'include', // Sends the `user` session cookie automatically on every request
});
