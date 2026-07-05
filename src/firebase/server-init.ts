/**
 * @fileOverview Institutional Server-Side Admin Node (NEUTRALIZED).
 * FIXED: Removed firebase-admin to prevent fatal crashes in the static Android build environment.
 * All operations must use the Firebase Client SDK.
 */

export const adminDB = null as any;
