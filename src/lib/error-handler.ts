/**
 * @fileOverview Global Error Handler Utility v2.0
 * FIXED: Comprehensive error catching and logging for production
 */

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: string;
  userId?: string;
  context?: string;
}

export class ErrorHandler {
  static createError(code: string, message: string, statusCode: number = 500, details?: any): AppError {
    return {
      code,
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static async logError(error: AppError, userId?: string, context?: string): Promise<void> {
    const errorLog = {
      ...error,
      userId,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', errorLog);
    }

    // Send to error tracking service
    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog),
      });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  static handlePaymentError(error: any): AppError {
    if (error.code === 'PAYMENT_GATEWAY_ERROR') {
      return this.createError(
        'CASHFREE_ERROR',
        'Payment gateway error. Please try again.',
        500,
        error.details
      );
    }

    if (error.code === 'NETWORK_ERROR') {
      return this.createError(
        'NETWORK_ERROR',
        'Network error. Check your connection.',
        503
      );
    }

    if (error.code === 'VALIDATION_ERROR') {
      return this.createError(
        'VALIDATION_ERROR',
        error.message,
        400
      );
    }

    return this.createError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred',
      500
    );
  }

  static handleAuthError(error: any): AppError {
    if (error.code === 'auth/user-not-found') {
      return this.createError(
        'USER_NOT_FOUND',
        'User not found. Please register.',
        404
      );
    }

    if (error.code === 'auth/wrong-password') {
      return this.createError(
        'INVALID_PASSWORD',
        'Invalid password. Please try again.',
        401
      );
    }

    if (error.code === 'auth/too-many-requests') {
      return this.createError(
        'TOO_MANY_ATTEMPTS',
        'Too many attempts. Please try later.',
        429
      );
    }

    return this.createError(
      'AUTH_ERROR',
      error.message || 'Authentication failed',
      401
    );
  }

  static handleFirestoreError(error: any): AppError {
    if (error.code === 'permission-denied') {
      return this.createError(
        'PERMISSION_DENIED',
        'You do not have permission to access this resource.',
        403
      );
    }

    if (error.code === 'not-found') {
      return this.createError(
        'NOT_FOUND',
        'Resource not found.',
        404
      );
    }

    if (error.code === 'unavailable') {
      return this.createError(
        'DATABASE_ERROR',
        'Database temporarily unavailable. Please try again.',
        503
      );
    }

    return this.createError(
      'DATABASE_ERROR',
      error.message || 'Database error occurred',
      500
    );
  }
}

export default ErrorHandler;
