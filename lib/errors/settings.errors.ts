// lib/errors/settings.errors.ts
export class SettingsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'SettingsError'
  }
}

export class ValidationError extends SettingsError {
  constructor(message: string, public details?: any[]) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class UniqueConstraintError extends SettingsError {
  constructor(field: string) {
    super(`${field} is already taken`, 'UNIQUE_CONSTRAINT_ERROR', 400)
  }
}

export class UnauthorizedError extends SettingsError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED_ERROR', 401)
  }
}

export class NotFoundError extends SettingsError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404)
  }
}

export class RateLimitError extends SettingsError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429)
  }
}