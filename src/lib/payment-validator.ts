/**
 * @fileOverview Payment Safety Utilities v1.0
 * FIXED: Input validation and sanitization for payment flows
 */

export interface PaymentValidation {
  isValid: boolean;
  errors: string[];
  sanitized?: {
    amount: number;
    phone: string;
    email: string;
    utr?: string;
  };
}

export class PaymentValidator {
  static validateAmount(amount: any): { isValid: boolean; error?: string } {
    if (typeof amount !== 'number' && typeof amount !== 'string') {
      return { isValid: false, error: 'Amount must be a number' };
    }

    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) {
      return { isValid: false, error: 'Invalid amount' };
    }

    if (num < 0) {
      return { isValid: false, error: 'Amount cannot be negative' };
    }

    if (num > 100000) {
      return { isValid: false, error: 'Amount exceeds maximum limit' };
    }

    return { isValid: true };
  }

  static validatePhone(phone: any): { isValid: boolean; sanitized?: string; error?: string } {
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, error: 'Phone number is required' };
    }

    const sanitized = phone.replace(/\D/g, '');

    if (sanitized.length < 10) {
      return { isValid: false, error: 'Phone number too short' };
    }

    if (sanitized.length > 15) {
      return { isValid: false, error: 'Phone number too long' };
    }

    const lastTen = sanitized.slice(-10);
    if (!/^[6-9]\d{9}$/.test(lastTen)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    return { isValid: true, sanitized: lastTen };
  }

  static validateEmail(email: any): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  static validateUTR(utr: any): { isValid: boolean; sanitized?: string; error?: string } {
    if (!utr || typeof utr !== 'string') {
      return { isValid: false, error: 'UTR is required' };
    }

    const sanitized = utr.replace(/\D/g, '');

    if (sanitized.length !== 12) {
      return { isValid: false, error: 'UTR must be 12 digits' };
    }

    return { isValid: true, sanitized };
  }

  static validatePaymentData(data: any): PaymentValidation {
    const errors: string[] = [];
    const sanitized: any = {};

    // Validate amount
    const amountValidation = this.validateAmount(data.amount);
    if (!amountValidation.isValid) {
      errors.push(amountValidation.error || 'Invalid amount');
    } else {
      sanitized.amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    }

    // Validate phone
    const phoneValidation = this.validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.error || 'Invalid phone');
    } else {
      sanitized.phone = phoneValidation.sanitized;
    }

    // Validate email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error || 'Invalid email');
    } else {
      sanitized.email = data.email.toLowerCase().trim();
    }

    // Validate UTR if provided
    if (data.utr) {
      const utrValidation = this.validateUTR(data.utr);
      if (!utrValidation.isValid) {
        errors.push(utrValidation.error || 'Invalid UTR');
      } else {
        sanitized.utr = utrValidation.sanitized;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined,
    };
  }
}

export default PaymentValidator;
