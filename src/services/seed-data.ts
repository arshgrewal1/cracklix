
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Synchronizes dynamic passes and platform settings.
 */
export async function seedInitialData(db: Firestore) {
  console.log('Initializing Global Punjab Dynamic Registry Sync...');

  // 1. Initial Dynamic Pass Registry
  const passes = [
    { 
      id: 'aspirant_free', 
      name: 'Aspirant Free', 
      price: 0, 
      durationDays: 365, 
      active: true, 
      displayOrder: 1, 
      type: 'FREE',
      description: 'Start your journey with verified patterns.',
      features: ['Limited Mocks', 'Daily Analysis', 'Exam Calendar']
    },
    { 
      id: 'silver_pass', 
      name: 'Silver Pass', 
      price: 199, 
      durationDays: 30, 
      active: true, 
      displayOrder: 2, 
      type: 'PREMIUM',
      description: 'Targeted subject mastery for state exams.',
      features: ['Subject Mocks', 'All PYQs', 'Daily Analysis Hub']
    },
    { 
      id: 'gold_pass', 
      name: 'Gold Pass', 
      price: 499, 
      durationDays: 30, 
      active: true, 
      displayOrder: 3, 
      recommended: true,
      type: 'PREMIUM',
      description: 'The standard for serious preparation.',
      features: ['Full Length Mocks', 'AI Rationalizations', 'Performance Dashboard', 'Revision Vault']
    },
    { 
      id: 'platinum_pass', 
      name: 'Platinum Pass', 
      price: 999, 
      durationDays: 30, 
      active: true, 
      displayOrder: 4, 
      type: 'PREMIUM',
      description: 'Full institutional access to the elite vault.',
      features: ['Everything in Gold', 'Live Mentorship', 'Advance Video Courses', 'Dedicated Support']
    },
  ];

  for (const p of passes) {
    await setDoc(doc(db, 'passes', p.id), { ...p, updatedAt: serverTimestamp() });
  }

  // 2. Initial System Config
  await setDoc(doc(db, 'settings', 'global'), {
    platformName: "Cracklix",
    announcement: "🔥 Official Punjab 2026 Recruitment Calendar Live.",
    showAnnouncement: true,
    upiId: "arshdeepgrewal1122@okaxis",
    supportPhone: "+91 98881 88602",
    supportEmail: "cracklixhelp@gmail.com",
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('Dynamic Registry Sync Complete.');
}
