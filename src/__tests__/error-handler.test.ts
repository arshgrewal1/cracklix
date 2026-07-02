import { ErrorHandler } from '@/lib/error-handler';

describe('ErrorHandler', () => {
  describe('createError', () => {
    it('creates an AppError with required fields', () => {
      const error = ErrorHandler.createError('TEST_ERROR', 'Something went wrong');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.timestamp).toBeDefined();
      expect(new Date(error.timestamp).getTime()).not.toBeNaN();
    });

    it('uses provided statusCode', () => {
      const error = ErrorHandler.createError('NOT_FOUND', 'Not found', 404);
      expect(error.statusCode).toBe(404);
    });

    it('includes optional details', () => {
      const details = { field: 'email', reason: 'invalid' };
      const error = ErrorHandler.createError('VALIDATION', 'Bad input', 400, details);
      expect(error.details).toEqual(details);
    });

    it('defaults statusCode to 500 when not provided', () => {
      const error = ErrorHandler.createError('INTERNAL', 'Server error');
      expect(error.statusCode).toBe(500);
    });

    it('generates ISO timestamp', () => {
      const error = ErrorHandler.createError('TEST', 'msg');
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('handlePaymentError', () => {
    it('maps PAYMENT_GATEWAY_ERROR to GATEWAY_ERROR', () => {
      const result = ErrorHandler.handlePaymentError({
        code: 'PAYMENT_GATEWAY_ERROR',
        details: { gateway: 'razorpay' },
      });
      expect(result.code).toBe('GATEWAY_ERROR');
      expect(result.statusCode).toBe(500);
      expect(result.message).toContain('payment server');
      expect(result.details).toEqual({ gateway: 'razorpay' });
    });

    it('maps NETWORK_ERROR', () => {
      const result = ErrorHandler.handlePaymentError({ code: 'NETWORK_ERROR' });
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.statusCode).toBe(503);
      expect(result.message).toContain('connection');
    });

    it('maps unknown errors to UNKNOWN_ERROR', () => {
      const result = ErrorHandler.handlePaymentError({ code: 'SOME_RANDOM' });
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.statusCode).toBe(500);
      expect(result.message).toContain('unexpected error');
    });

    it('handles error with no code property', () => {
      const result = ErrorHandler.handlePaymentError({});
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('handleAuthError', () => {
    it('maps auth/user-not-found to USER_NOT_FOUND', () => {
      const result = ErrorHandler.handleAuthError({ code: 'auth/user-not-found' });
      expect(result.code).toBe('USER_NOT_FOUND');
      expect(result.statusCode).toBe(404);
    });

    it('maps generic auth errors to AUTH_ERROR', () => {
      const result = ErrorHandler.handleAuthError({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      });
      expect(result.code).toBe('AUTH_ERROR');
      expect(result.statusCode).toBe(401);
      expect(result.message).toBe('Wrong password');
    });

    it('provides fallback message when none exists', () => {
      const result = ErrorHandler.handleAuthError({ code: 'auth/unknown' });
      expect(result.code).toBe('AUTH_ERROR');
      expect(result.message).toBe('Authentication failed');
    });
  });

  describe('handleFirestoreError', () => {
    it('maps permission-denied to PERMISSION_DENIED', () => {
      const result = ErrorHandler.handleFirestoreError({ code: 'permission-denied' });
      expect(result.code).toBe('PERMISSION_DENIED');
      expect(result.statusCode).toBe(403);
    });

    it('maps generic firestore errors to DATABASE_ERROR', () => {
      const result = ErrorHandler.handleFirestoreError({
        code: 'unavailable',
        message: 'Service unavailable',
      });
      expect(result.code).toBe('DATABASE_ERROR');
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Service unavailable');
    });

    it('provides fallback message when none exists', () => {
      const result = ErrorHandler.handleFirestoreError({ code: 'unknown' });
      expect(result.code).toBe('DATABASE_ERROR');
      expect(result.message).toBe('Database error occurred');
    });
  });
});
