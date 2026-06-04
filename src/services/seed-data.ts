
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Synchronizes binary access passes and platform settings.
 */
export async function seedInitialData(db: Firestore) {
  console.log('Initializing Global Punjab Access Registry Sync...');

  // 1. Initial Pass Registry (FREE/PREMIUM Model)
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
      id: 'premium_monthly', 
      name: 'Premium Monthly', 
      price: 299, 
      durationDays: 30, 
      active: true, 
      displayOrder: 2, 
      type: 'PREMIUM',
      description: 'Full access to the official practice vault.',
      features: ['All Premium Mocks', 'All PYQs', 'AI Rationalizations', 'Readiness Score']
    },
    { 
      id: 'premium_yearly', 
      name: 'Premium Yearly', 
      price: 999, 
      durationDays: 365, 
      active: true, 
      displayOrder: 3, 
      recommended: true,
      type: 'PREMIUM',
      description: 'Maximum value for long-term preparation.',
      features: ['Everything in Monthly', 'Lifetime Updates', 'Mentorship Access', 'Priority Support']
    },
    { 
      id: 'lifetime_access', 
      name: 'Lifetime Hub', 
      price: 2499, 
      durationDays: 3650, 
      active: true, 
      displayOrder: 4, 
      type: 'PREMIUM',
      description: 'One-time investment for ultimate preparation.',
      features: ['Unlimited Access', 'All Future Hubs', 'VVIP Support']
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

  console.log('Access Registry Sync Complete.');
}
