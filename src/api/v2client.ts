import createClient from 'openapi-fetch';
import type { paths } from './v2';

const baseUrl = import.meta.env.DEV ? '/v2' : 'https://api.piggy-pulse.com/v2';

export const apiClient = createClient<paths>({
  baseUrl,
  credentials: 'include', // Sends the `user` session cookie automatically on every request
});
