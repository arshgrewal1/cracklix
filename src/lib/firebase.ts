
/**
 * @fileOverview Institutional Server-Side Firebase Admin Node (NEUTRALIZED).
 * FIXED: Removed firebase-admin to prevent fatal server crashes during pre-rendering
 * and startup in the static Android environment. All data operations are now
 * handled by the Firebase Client SDK.
 */

export const adminDB = null as any;
