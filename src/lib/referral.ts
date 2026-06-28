/**
 * @fileOverview Referral Identity Utilities.
 */

export function generateReferralCode(userId: string): string {
  if (!userId) return "REF-GUEST";
  return "REF-" + userId.slice(0, 6).toUpperCase();
}
