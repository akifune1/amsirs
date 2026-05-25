/**
 * Error handling utilities for Student Support module
 * Provides consistent error responses and logging
 */

export class StudentSupportError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'StudentSupportError';
  }
}

export class AuthenticationError extends StudentSupportError {
  constructor(message: string = 'User not authenticated') {
    super('AUTH_REQUIRED', message, 401);
  }
}

export class AuthorizationError extends StudentSupportError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTH_FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends StudentSupportError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ValidationError extends StudentSupportError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class DatabaseError extends StudentSupportError {
  constructor(message: string = 'Database operation failed') {
    super('DB_ERROR', message, 500);
  }
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Safely handle errors and return consistent response format
 */
export function handleError(error: unknown): ErrorResponse {
  console.error('[StudentSupport Error]', error);

  if (error instanceof StudentSupportError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  if (error instanceof Error) {
    const code = error.message.includes('Unauthorized')
      ? 'AUTH_REQUIRED'
      : error.message.includes('permission')
      ? 'AUTH_FORBIDDEN'
      : 'UNKNOWN_ERROR';

    return {
      success: false,
      error: {
        code,
        message: error.message,
        statusCode: 500,
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
  };
}
