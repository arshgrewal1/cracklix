import { generateReferralCode } from '@/lib/referral';

describe('generateReferralCode', () => {
  it('generates code from first 6 chars of userId', () => {
    const code = generateReferralCode('abc123xyz');
    expect(code).toBe('REF-ABC123');
  });

  it('uppercases the userId slice', () => {
    const code = generateReferralCode('lowercaseid');
    expect(code).toBe('REF-LOWERC');
  });

  it('returns REF-GUEST for empty string', () => {
    expect(generateReferralCode('')).toBe('REF-GUEST');
  });

  it('handles userId shorter than 6 chars', () => {
    const code = generateReferralCode('ab');
    expect(code).toBe('REF-AB');
  });

  it('handles userId of exactly 6 chars', () => {
    const code = generateReferralCode('abcdef');
    expect(code).toBe('REF-ABCDEF');
  });
});
