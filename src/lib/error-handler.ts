
/**
 * @fileOverview Global Error Handler Utility v2.1
 * FIXED: Purged all Cashfree references and enhanced production logging.
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

    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', errorLog);
    }

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
        'GATEWAY_ERROR',
        'Handshake with payment server failed. Please try again.',
        500,
        error.details
      );
    }

    if (error.code === 'NETWORK_ERROR') {
      return this.createError(
        'NETWORK_ERROR',
        'Check your connection and try again.',
        503
      );
    }

    return this.createError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred during checkout.',
      500
    );
  }

  static handleAuthError(error: any): AppError {
    if (error.code === 'auth/user-not-found') {
      return this.createError('USER_NOT_FOUND', 'Identity node not matched.', 404);
    }
    return this.createError('AUTH_ERROR', error.message || 'Authentication failed', 401);
  }

  static handleFirestoreError(error: any): AppError {
    if (error.code === 'permission-denied') {
      return this.createError('PERMISSION_DENIED', 'Security audit rejected request.', 403);
    }
    return this.createError('DATABASE_ERROR', error.message || 'Database error occurred', 500);
  }
}

export default ErrorHandler;
