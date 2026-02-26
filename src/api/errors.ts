export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

export class RateLimitError extends Error {
  readonly type = 'rate_limited' as const;

  constructor(
    message: string,
    public retryAfterSeconds: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class AccountLockedError extends Error {
  readonly type = 'account_locked' as const;

  constructor(
    message: string,
    public lockedUntil: string
  ) {
    super(message);
    this.name = 'AccountLockedError';
  }
}
