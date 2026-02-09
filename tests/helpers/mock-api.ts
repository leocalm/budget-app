import type { BrowserContext, Route } from 'playwright/test';
import type { TestUserCredentials } from './test-data';

interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface MockSession {
  token: string;
  userId: string;
}

interface MockApiResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
}

interface MockVendor {
  id: string;
  name: string;
  transaction_count: number;
}

const SESSION_COOKIE_NAME = 'budget_session';

export class MockApiServer {
  private users = new Map<string, MockUser>();
  private sessions = new Map<string, MockSession>();
  private vendors: MockVendor[] = [
    {
      id: 'vendor-1',
      name: 'Demo Vendor',
      transaction_count: 0,
    },
  ];
  private readonly defaultPeriod = {
    id: 'period-1',
    name: 'February 2026',
    start_date: '2026-02-01',
    end_date: '2026-02-28',
    transaction_count: 0,
    budget_used_percentage: 0,
  };
  private readonly defaultCurrency = {
    id: 'currency-eur',
    name: 'Euro',
    symbol: '€',
    currency: 'EUR',
    decimal_places: 2,
  };
  private readonly defaultAccount = {
    id: 'account-1',
    name: 'Checking Account',
    color: '#0088cc',
    icon: 'wallet',
    account_type: 'Checking',
    currency: {
      id: 'currency-eur',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimal_places: 2,
    },
    balance: 250000,
    balance_per_day: [],
    balance_change_this_period: 0,
    transaction_count: 0,
  };
  private readonly routeHandler = async (route: Route): Promise<void> => {
    const url = new URL(route.request().url());
    if (!this.shouldHandlePath(url.pathname)) {
      await route.continue();
      return;
    }

    await this.handleRoute(route);
  };

  async install(context: BrowserContext): Promise<void> {
    await context.route('**/*', this.routeHandler);
  }

  async uninstall(context: BrowserContext): Promise<void> {
    await context.unroute('**/*', this.routeHandler);
  }

  createUser(credentials: TestUserCredentials): MockUser {
    const existing = this.users.get(credentials.email.toLowerCase());
    if (existing) {
      return existing;
    }

    const newUser: MockUser = {
      id: `mock-user-${this.users.size + 1}`,
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    };

    this.users.set(credentials.email.toLowerCase(), newUser);
    return newUser;
  }

  private async handleRoute(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const path = this.normalizeApiPath(url.pathname);
    const method = request.method().toUpperCase();
    const cookieHeader = await request.headerValue('cookie');
    const authUser = this.findAuthenticatedUser(cookieHeader);

    if (method === 'POST' && path === '/users/register') {
      const body = this.parseBody(request.postData());
      const response = this.handleRegister(body);
      await this.fulfill(route, response);
      return;
    }

    if (method === 'POST' && path === '/users/login') {
      const body = this.parseBody(request.postData());
      const response = this.handleLogin(body);
      await this.fulfill(route, response);
      return;
    }

    if (method === 'GET' && path === '/users/me') {
      if (!authUser) {
        await this.fulfill(route, {
          status: 401,
          body: { message: 'Unauthorized' },
        });
        return;
      }

      await this.fulfill(route, {
        body: {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
        },
      });
      return;
    }

    if (method === 'POST' && path === '/users/logout') {
      const sessionToken = this.extractSessionToken(cookieHeader);
      if (sessionToken) {
        this.sessions.delete(sessionToken);
      }

      await this.fulfill(route, {
        body: { success: true },
        headers: {
          'set-cookie': `${SESSION_COOKIE_NAME}=deleted; Path=/; Max-Age=0`,
        },
      });
      return;
    }

    if (!authUser) {
      await this.fulfill(route, {
        status: 401,
        body: { message: 'Unauthorized' },
      });
      return;
    }

    const body = this.parseBody(request.postData());
    const response = this.resolveAuthenticatedRoute(method, path, body);
    await this.fulfill(route, response);
  }

  private resolveAuthenticatedRoute(
    method: string,
    path: string,
    payload?: Record<string, unknown>
  ): MockApiResponse {
    if (method === 'GET' && path === '/budget_period/current') {
      return { body: this.defaultPeriod };
    }

    if (method === 'GET' && path === '/budget_period') {
      return { body: [this.defaultPeriod] };
    }

    if (method === 'GET' && path === '/budget_period/gaps') {
      return {
        body: {
          unassigned_count: 0,
          transactions: [],
        },
      };
    }

    if (method === 'GET' && path === '/budget_period/schedule') {
      return {
        status: 404,
        body: {
          message: 'Not Found',
        },
      };
    }

    if (method === 'GET' && path === '/accounts') {
      return { body: [this.defaultAccount] };
    }

    if (method === 'GET' && path === '/categories') {
      return {
        body: [
          {
            id: 'category-1',
            name: 'Food',
            color: '#2f9e44',
            icon: 'food',
            parent_id: null,
            category_type: 'Outgoing',
            used_in_period: 0,
            difference_vs_average_percentage: 0,
            transaction_count: 0,
          },
        ],
      };
    }

    if (method === 'GET' && path === '/categories/not-in-budget') {
      return { body: [] };
    }

    if (method === 'GET' && path === '/vendors') {
      return { body: this.vendors };
    }

    if (method === 'POST' && path === '/vendors') {
      const name = typeof payload?.name === 'string' ? payload.name.trim() : '';
      if (!name) {
        return {
          status: 422,
          body: { message: 'Vendor name is required' },
        };
      }

      const existing = this.vendors.find(
        (vendor) => vendor.name.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        return {
          status: 409,
          body: { message: 'Vendor already exists' },
        };
      }

      const createdVendor: MockVendor = {
        id: `vendor-${this.vendors.length + 1}`,
        name,
        transaction_count: 0,
      };

      this.vendors.push(createdVendor);
      return { status: 201, body: createdVendor };
    }

    if (method === 'GET' && path === '/transactions') {
      return { body: [] };
    }

    if (method === 'GET' && path === '/budgets') {
      return {
        body: [
          {
            id: 'budget-1',
            name: 'Main Budget',
            start_day: 1,
          },
        ],
      };
    }

    if (method === 'GET' && path === '/budget-categories') {
      return { body: [] };
    }

    if (method === 'GET' && path === '/dashboard/spent-per-category') {
      return { body: [] };
    }

    if (method === 'GET' && path === '/dashboard/monthly-burn-in') {
      return {
        body: {
          total_budget: 500000,
          spent_budget: 0,
          current_day: 1,
          days_in_period: 28,
        },
      };
    }

    if (method === 'GET' && path === '/dashboard/month-progress') {
      return {
        body: {
          current_date: '2026-02-01',
          days_in_period: 28,
          remaining_days: 27,
          days_passed_percentage: 3.57,
        },
      };
    }

    if (method === 'GET' && path === '/dashboard/recent-transactions') {
      return { body: [] };
    }

    if (method === 'GET' && path === '/dashboard/budget-per-day') {
      return {
        body: [
          {
            account_name: this.defaultAccount.name,
            date: '2026-02-01',
            balance: this.defaultAccount.balance,
          },
        ],
      };
    }

    if (method === 'GET' && path === '/dashboard/total-assets') {
      return {
        body: {
          total_assets: this.defaultAccount.balance,
        },
      };
    }

    if (method === 'GET' && path === '/overlays') {
      return { body: [] };
    }

    if (method === 'GET' && path === '/currencies') {
      return { body: [this.defaultCurrency] };
    }

    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      return { status: 200, body: {} };
    }

    return {
      status: 404,
      body: { message: `Unhandled mock route: ${method} ${path}` },
    };
  }

  private handleRegister(payload: Record<string, unknown>): MockApiResponse {
    const email = typeof payload.email === 'string' ? payload.email : '';
    const name = typeof payload.name === 'string' ? payload.name : '';
    const password = typeof payload.password === 'string' ? payload.password : '';

    if (!email || !name || !password) {
      return {
        status: 422,
        body: { message: 'Invalid registration payload' },
      };
    }

    const existing = this.users.get(email.toLowerCase());
    if (existing) {
      return {
        status: 409,
        body: { message: 'User already exists' },
      };
    }

    const user = this.createUser({ name, email, password });
    return {
      status: 201,
      body: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  private handleLogin(payload: Record<string, unknown>): MockApiResponse {
    const email = typeof payload.email === 'string' ? payload.email : '';
    const password = typeof payload.password === 'string' ? payload.password : '';

    const user = this.users.get(email.toLowerCase());
    if (!user || user.password !== password) {
      return {
        status: 401,
        body: { message: 'Invalid email or password' },
      };
    }

    const token = `mock-session-${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
    this.sessions.set(token, {
      token,
      userId: user.id,
    });

    return {
      status: 200,
      body: { success: true },
      headers: {
        'set-cookie': `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly`,
      },
    };
  }

  private findAuthenticatedUser(rawCookieHeader: string | null): MockUser | null {
    const token = this.extractSessionToken(rawCookieHeader);
    if (!token) {
      return null;
    }

    const session = this.sessions.get(token);
    if (!session) {
      return null;
    }

    for (const user of this.users.values()) {
      if (user.id === session.userId) {
        return user;
      }
    }

    return null;
  }

  private extractSessionToken(rawCookieHeader: string | null): string | null {
    if (!rawCookieHeader) {
      return null;
    }

    const cookiePairs = rawCookieHeader.split(';').map((part) => part.trim());
    const sessionCookie = cookiePairs.find((entry) =>
      entry.toLowerCase().startsWith(`${SESSION_COOKIE_NAME}=`)
    );

    if (!sessionCookie) {
      return null;
    }

    const [, value] = sessionCookie.split('=', 2);
    return value || null;
  }

  private normalizeApiPath(pathname: string): string {
    if (pathname.startsWith('/api/v1/')) {
      return pathname.slice('/api/v1'.length);
    }

    if (pathname === '/api/v1') {
      return '/';
    }

    if (pathname.startsWith('/api/')) {
      return pathname.slice('/api'.length);
    }

    if (pathname === '/api') {
      return '/';
    }

    return pathname;
  }

  private shouldHandlePath(pathname: string): boolean {
    return pathname === '/api' || pathname.startsWith('/api/');
  }

  private parseBody(rawBody: string | null): Record<string, unknown> {
    if (!rawBody) {
      return {};
    }

    try {
      const parsed = JSON.parse(rawBody) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }

  private async fulfill(route: Route, response: MockApiResponse): Promise<void> {
    const status = response.status ?? 200;
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...response.headers,
    };

    await route.fulfill({
      status,
      headers,
      body: JSON.stringify(response.body ?? {}),
    });
  }
}
