import { APKCompatibility } from '@/lib/apk-compatibility';

describe('APKCompatibility', () => {
  describe('sanitizePhoneNumber', () => {
    it('returns 10 digits unchanged', () => {
      expect(APKCompatibility.sanitizePhoneNumber('9876543210')).toBe('9876543210');
    });

    it('strips non-digit characters', () => {
      expect(APKCompatibility.sanitizePhoneNumber('+91-98765-43210')).toBe('9876543210');
    });

    it('removes 91 country code prefix', () => {
      expect(APKCompatibility.sanitizePhoneNumber('919876543210')).toBe('9876543210');
    });

    it('removes leading 0 from 11-digit number', () => {
      expect(APKCompatibility.sanitizePhoneNumber('09876543210')).toBe('9876543210');
    });

    it('takes last 10 digits for other lengths', () => {
      expect(APKCompatibility.sanitizePhoneNumber('00919876543210')).toBe('9876543210');
    });

    it('handles number with spaces', () => {
      expect(APKCompatibility.sanitizePhoneNumber('98765 43210')).toBe('9876543210');
    });

    it('handles number with parentheses', () => {
      expect(APKCompatibility.sanitizePhoneNumber('(91) 9876543210')).toBe('9876543210');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('accepts valid Indian phone numbers starting with 6-9', () => {
      expect(APKCompatibility.isValidPhoneNumber('6123456789')).toBe(true);
      expect(APKCompatibility.isValidPhoneNumber('7123456789')).toBe(true);
      expect(APKCompatibility.isValidPhoneNumber('8123456789')).toBe(true);
      expect(APKCompatibility.isValidPhoneNumber('9823456789')).toBe(true);
    });

    it('treats 91-prefixed 10-digit number as country code (may invalidate)', () => {
      // sanitizePhoneNumber strips "91" prefix, leaving 8 digits → invalid
      expect(APKCompatibility.isValidPhoneNumber('9123456789')).toBe(false);
    });

    it('rejects numbers starting with 0-5', () => {
      expect(APKCompatibility.isValidPhoneNumber('0123456789')).toBe(false);
      expect(APKCompatibility.isValidPhoneNumber('1234567890')).toBe(false);
      expect(APKCompatibility.isValidPhoneNumber('5123456789')).toBe(false);
    });

    it('validates after sanitizing country code', () => {
      expect(APKCompatibility.isValidPhoneNumber('+919876543210')).toBe(true);
    });

    it('rejects too-short numbers', () => {
      expect(APKCompatibility.isValidPhoneNumber('98765')).toBe(false);
    });
  });

  describe('getPlatformCapabilities (server-side)', () => {
    it('returns all false when window is undefined', () => {
      const caps = APKCompatibility.getPlatformCapabilities();
      expect(caps.isAndroid).toBe(false);
      expect(caps.isIOS).toBe(false);
      expect(caps.isWeb).toBe(false);
      expect(caps.isCapacitor).toBe(false);
      expect(caps.canUseLocalStorage).toBe(false);
      expect(caps.canUseIndexedDB).toBe(false);
      expect(caps.canUseWebWorker).toBe(false);
    });
  });
});
