
/**
 * @fileOverview Institutional Analytics Update Node (NEUTRALIZED).
 * FIXED: Removed Firebase Admin SDK dependency to prevent Vercel build crashes 
 * caused by missing or invalid service account environment variables.
 * Logic: All session analytics are now handled via the client-side useStudyAnalytics hook
 * to ensure compatibility with static Android APK exports.
 */

export default async function handler(req: any, res: any) {
  res.status(404).json({ 
    success: false, 
    message: "Deprecated endpoint. Analytics processing has been migrated to client-side session engine for PWA/APK stability." 
  });
}
