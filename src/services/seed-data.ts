
import { Firestore, doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Synchronizes binary access passes, official board registry, and platform settings.
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
    }
  ];

  for (const p of passes) {
    await setDoc(doc(db, 'passes', p.id), { ...p, updatedAt: serverTimestamp() });
  }

  // 2. Official Board Registry with High-Fidelity Logos
  const boards = [
    {
      id: 'psssb',
      abbreviation: 'PSSSB',
      name: 'Punjab Subordinate Services Selection Board',
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png',
      description: 'Official recruitment board for Group B and C posts in Punjab.'
    },
    {
      id: 'ppsc',
      abbreviation: 'PPSC',
      name: 'Punjab Public Service Commission',
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png',
      description: 'Official authority for Class A and B civil services.'
    },
    {
      id: 'punjab-police',
      abbreviation: 'Police',
      name: 'Punjab Police Recruitment Board',
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png',
      description: 'District and Armed cadre recruitments.'
    }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() });
  }

  // 3. Exam Hub Hierarchy
  const exams = [
    {
      id: 'psssb-excise',
      boardId: 'psssb',
      name: 'Excise & Taxation Inspector',
      category: 'PSSSB',
      totalMocks: 12,
      activeQuestions: 1500,
      description: 'High-fidelity preparation for Excise Inspector recruitment.'
    },
    {
      id: 'psssb-patwari',
      boardId: 'psssb',
      name: 'Revenue Patwari',
      category: 'PSSSB',
      totalMocks: 20,
      activeQuestions: 2500,
      description: 'Official pattern mocks for Revenue and Canal Patwari.'
    },
    {
      id: 'punjab-police-si',
      boardId: 'punjab-police',
      name: 'Sub-Inspector (SI)',
      category: 'Police',
      totalMocks: 15,
      activeQuestions: 1800,
      description: 'Complete series for District, Armed and Intelligence SI.'
    }
  ];

  for (const e of exams) {
    await setDoc(doc(db, 'exams', e.id), { ...e, updatedAt: serverTimestamp() });
  }

  // 4. Initial System Config
  await setDoc(doc(db, 'settings', 'global'), {
    platformName: "Cracklix",
    announcement: "🔥 Official Punjab 2026 Recruitment Calendar Live.",
    showAnnouncement: true,
    upiId: "arshdeepgrewal1122@okaxis",
    supportPhone: "+91 98881 88602",
    supportEmail: "cracklixhelp@gmail.com",
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('Institutional Registry Sync Complete.');
}
