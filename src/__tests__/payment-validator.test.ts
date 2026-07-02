import { PaymentValidator } from '@/lib/payment-validator';

describe('PaymentValidator', () => {
  describe('validateAmount', () => {
    it('accepts valid numeric amount', () => {
      expect(PaymentValidator.validateAmount(500)).toEqual({ isValid: true });
    });

    it('accepts zero amount', () => {
      expect(PaymentValidator.validateAmount(0)).toEqual({ isValid: true });
    });

    it('accepts string numeric amount', () => {
      expect(PaymentValidator.validateAmount('250')).toEqual({ isValid: true });
    });

    it('rejects negative amount', () => {
      const result = PaymentValidator.validateAmount(-100);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount cannot be negative');
    });

    it('rejects amount exceeding 100000', () => {
      const result = PaymentValidator.validateAmount(100001);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount exceeds maximum limit');
    });

    it('accepts boundary amount of 100000', () => {
      expect(PaymentValidator.validateAmount(100000)).toEqual({ isValid: true });
    });

    it('rejects non-numeric string', () => {
      const result = PaymentValidator.validateAmount('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid amount');
    });

    it('rejects boolean input', () => {
      const result = PaymentValidator.validateAmount(true);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a number');
    });

    it('rejects null input', () => {
      const result = PaymentValidator.validateAmount(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a number');
    });

    it('rejects undefined input', () => {
      const result = PaymentValidator.validateAmount(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a number');
    });
  });

  describe('validatePhone', () => {
    it('accepts valid 10-digit Indian phone number', () => {
      const result = PaymentValidator.validatePhone('9876543210');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('9876543210');
    });

    it('accepts phone with country code prefix', () => {
      const result = PaymentValidator.validatePhone('+919876543210');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('9876543210');
    });

    it('accepts phone with spaces/dashes', () => {
      const result = PaymentValidator.validatePhone('98765-43210');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('9876543210');
    });

    it('rejects phone starting with digit < 6', () => {
      const result = PaymentValidator.validatePhone('1234567890');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid phone number format');
    });

    it('rejects phone that is too short', () => {
      const result = PaymentValidator.validatePhone('98765');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number too short');
    });

    it('rejects phone that is too long (>15 digits)', () => {
      const result = PaymentValidator.validatePhone('1234567890123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number too long');
    });

    it('rejects empty string', () => {
      const result = PaymentValidator.validatePhone('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    it('rejects null input', () => {
      const result = PaymentValidator.validatePhone(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    it('rejects non-string input', () => {
      const result = PaymentValidator.validatePhone(9876543210);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });
  });

  describe('validateEmail', () => {
    it('accepts valid email', () => {
      expect(PaymentValidator.validateEmail('user@example.com')).toEqual({ isValid: true });
    });

    it('accepts email with subdomain', () => {
      expect(PaymentValidator.validateEmail('user@mail.example.com')).toEqual({ isValid: true });
    });

    it('rejects email without @', () => {
      const result = PaymentValidator.validateEmail('userexample.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('rejects email without domain', () => {
      const result = PaymentValidator.validateEmail('user@');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('rejects empty string', () => {
      const result = PaymentValidator.validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('rejects null', () => {
      const result = PaymentValidator.validateEmail(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });
  });

  describe('validateUTR', () => {
    it('accepts valid 12-digit UTR', () => {
      const result = PaymentValidator.validateUTR('123456789012');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('123456789012');
    });

    it('strips non-digit characters and validates', () => {
      const result = PaymentValidator.validateUTR('1234-5678-9012');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('123456789012');
    });

    it('rejects UTR with wrong digit count', () => {
      const result = PaymentValidator.validateUTR('12345678');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('UTR must be 12 digits');
    });

    it('rejects empty string', () => {
      const result = PaymentValidator.validateUTR('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('UTR is required');
    });

    it('rejects null', () => {
      const result = PaymentValidator.validateUTR(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('UTR is required');
    });
  });

  describe('validatePaymentData', () => {
    const validData = {
      amount: 499,
      phone: '9876543210',
      email: 'student@cracklix.com',
    };

    it('validates complete valid payment data', () => {
      const result = PaymentValidator.validatePaymentData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toBeDefined();
      expect(result.sanitized!.amount).toBe(499);
      expect(result.sanitized!.phone).toBe('9876543210');
      expect(result.sanitized!.email).toBe('student@cracklix.com');
    });

    it('validates payment data with optional UTR', () => {
      const result = PaymentValidator.validatePaymentData({
        ...validData,
        utr: '123456789012',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized!.utr).toBe('123456789012');
    });

    it('collects all errors for fully invalid data', () => {
      const result = PaymentValidator.validatePaymentData({
        amount: -1,
        phone: '123',
        email: 'bad',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
      expect(result.sanitized).toBeUndefined();
    });

    it('rejects invalid UTR while keeping other fields valid', () => {
      const result = PaymentValidator.validatePaymentData({
        ...validData,
        utr: '12345',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('UTR must be 12 digits');
    });

    it('rejects email with leading/trailing whitespace', () => {
      const result = PaymentValidator.validatePaymentData({
        ...validData,
        email: '  User@Example.COM  ',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('lowercases and trims email in sanitized output', () => {
      const result = PaymentValidator.validatePaymentData({
        ...validData,
        email: 'User@Example.COM',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized!.email).toBe('user@example.com');
    });

    it('parses string amount to number in sanitized output', () => {
      const result = PaymentValidator.validatePaymentData({
        ...validData,
        amount: '299',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized!.amount).toBe(299);
    });
  });
});
