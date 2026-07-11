
import { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';
import { StudySession, UserStudyAnalytics } from '@/lib/firebase-schema';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON as string)),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const sessionsSnapshot = await db.collection('study-sessions').where('userId', '==', userId).get();
    const sessions = sessionsSnapshot.docs.map(doc => doc.data() as StudySession);

    const analytics: UserStudyAnalytics = {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
      lifetime: 0,
      currentStreak: 0, // This needs a more complex calculation
      longestStreak: 0, // This needs a more complex calculation
      dailyAverage: 0, // This needs a more complex calculation
      mostStudiedSubject: null, // This needs a more complex calculation
      longestSession: 0,
    };

    const activityCounts: { [key: string]: number } = {};

    for (const session of sessions) {
      const sessionDate = new Date(session.startTime);
      analytics.lifetime += session.duration;

      if (sessionDate >= todayStart) {
        analytics.today += session.duration;
      }
      if (sessionDate >= weekStart) {
        analytics.thisWeek += session.duration;
      }
      if (sessionDate >= monthStart) {
        analytics.thisMonth += session.duration;
      }
      if (sessionDate >= yearStart) {
        analytics.thisYear += session.duration;
      }
      
      if(session.duration > analytics.longestSession) {
          analytics.longestSession = session.duration;
      }
      
      activityCounts[session.activityType] = (activityCounts[session.activityType] || 0) + session.duration;
    }

    const mostStudied = Object.keys(activityCounts).reduce((a, b) => activityCounts[a] > activityCounts[b] ? a : b, '' as string | null);
    analytics.mostStudiedSubject = mostStudied;


    await db.collection('user-analytics').doc(userId).set(analytics, { merge: true });

    res.status(200).json({ message: 'Analytics updated successfully' });
  } catch (error) {
    console.error('Error updating analytics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
