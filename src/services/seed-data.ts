
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine v10.0.
 * Features: High-Fidelity Schema for Exams and Pass Nodes.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Cracklix Global Registry Sync...');

  // 1. Boards Registry
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg' },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png' },
    { id: 'punjab-police', abbreviation: 'Police', name: 'Punjab Police Recruitment', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png' }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. Exam Master Hubs (Dynamic Counts)
  const exams = [
    { 
      id: 'punjab-patwari', 
      boardId: 'psssb', 
      name: 'Revenue Patwari', 
      category: 'STATE', 
      description: 'Official prep hub for Revenue, Canal and Ziladar posts.',
      totalFullMocks: 45,
      totalSubjects: 12,
      totalPyqs: 10,
      totalSectional: 24,
      iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg'
    },
    { 
      id: 'police-si', 
      boardId: 'punjab-police', 
      name: 'Police Sub-Inspector', 
      category: 'STATE', 
      description: 'District and Armed Cadre recruitment series.',
      totalFullMocks: 30,
      totalSubjects: 8,
      totalPyqs: 5,
      totalSectional: 15,
      iconUrl: 'https://punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png'
    }
  ];

  for (const e of exams) {
    await setDoc(doc(db, 'exams', e.id), { ...e, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. Pass Registry (Lock/Unlock Logic)
  const passes = [
    { 
      id: 'gold-pass', 
      name: 'Gold Mastery Pass', 
      price: 199, 
      durationDays: 30, 
      active: true, 
      displayOrder: 1, 
      adFree: false, 
      type: 'PREMIUM', 
      allowedExams: ['punjab-patwari', 'psssb-clerk'],
      features: ['All Full Mocks', 'AI Solutions', 'State Ranking']
    },
    { 
      id: 'platinum-pass', 
      name: 'Platinum Elite Pass', 
      price: 499, 
      durationDays: 90, 
      active: true, 
      displayOrder: 2, 
      adFree: true, 
      type: 'PREMIUM', 
      allowedExams: ['punjab-patwari', 'police-si', 'ppsc-pcs'],
      features: ['Everything Unlocked', 'Ad-Free Hub', 'Live Mentorship']
    }
  ];

  for (const p of passes) {
    await setDoc(doc(db, 'passes', p.id), { ...p, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Institutional Registry Sync Complete.');
}
