import { Firestore, doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Synchronizes binary access passes, official board registry, and platform settings.
 * Updated: Official High-Fidelity URLs for all Punjab Boards including PSPCL.
 */
export async function seedInitialData(db: Firestore) {
  console.log('Initializing Global Punjab Access Registry Sync...');

  // 1. Initial Pass Registry
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

  // 2. Official Board Registry with Verified High-Fidelity URLs
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
      iconUrl: 'https://ppsc.gov.in/assets/images/logo.png',
      description: 'Official authority for Class A and B civil services.'
    },
    {
      id: 'punjab-police',
      abbreviation: 'Police',
      name: 'Punjab Police Recruitment Board',
      iconUrl: 'https://1000logos.net/wp-content/uploads/2022/12/Punjab-Police-Logo.png',
      description: 'District and Armed cadre recruitments.'
    },
    {
      id: 'pseb',
      abbreviation: 'Education',
      name: 'Punjab School Education Board (Teaching)',
      iconUrl: 'https://www.pseb.ac.in/images/logo-punjabi.png',
      description: 'ETT, Master Cadre, PSTET and Teaching recruitments.'
    },
    {
      id: 'high-court',
      abbreviation: 'High Court',
      name: 'Punjab & Haryana High Court',
      iconUrl: 'https://highcourtchd.gov.in/sub_pages/left_menu/images/logo1.png',
      description: 'Judicial and clerical recruitments for subordinate courts.'
    },
    {
      id: 'pspcl',
      abbreviation: 'PSPCL',
      name: 'Punjab State Power Corporation Limited',
      iconUrl: 'https://pspcl.in/images/logo.png',
      description: 'Technical and clerical recruitment for power corporations.'
    }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() });
  }

  // 3. Subject Registry Expansion (Added EVS for PSTET/CTET)
  const subjects = [
    { id: 'punjab-gk', name: 'Punjab GK & Culture' },
    { id: 'mental-ability', name: 'Mental Ability / Reasoning' },
    { id: 'quant-aptitude', name: 'Quantitative Aptitude' },
    { id: 'english', name: 'English Language' },
    { id: 'punjabi', name: 'Punjabi Language' },
    { id: 'punjabi-qualifying', name: 'Punjabi Qualifying (Paper A)' },
    { id: 'ict-computers', name: 'ICT / Computers' },
    { id: 'general-knowledge', name: 'Static GK & India' },
    { id: 'evs-education', name: 'Environmental Studies (EVS)' },
    { id: 'child-pedagogy', name: 'Child Development & Pedagogy' }
  ];

  for (const s of subjects) {
    await setDoc(doc(db, 'subjects', s.id), { ...s, updatedAt: serverTimestamp() });
  }

  // 4. Exam Hub Hierarchy
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
    },
    {
      id: 'pstet-p1',
      boardId: 'pseb',
      name: 'PSTET Paper 1 (EVS Focus)',
      category: 'Teaching',
      totalMocks: 10,
      activeQuestions: 1200,
      description: 'Specialized nodes for Punjab State Teacher Eligibility.'
    }
  ];

  for (const e of exams) {
    await setDoc(doc(db, 'exams', e.id), { ...e, updatedAt: serverTimestamp() });
  }

  // 5. Initial System Config
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
