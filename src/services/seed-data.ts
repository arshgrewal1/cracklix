import { Firestore, doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Synchronizes binary access passes, official board registry, and platform settings.
 * Optimized for Testbook-style "Select Board" logic with high-fidelity logos.
 * Hardcoded to Wikimedia and Government URLs to ensure Cross-Origin (CORS) compatibility.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[REGISTRY] Initializing Global Punjab Access Registry Sync...');

  // 1. Initial Pass Registry (Monetization Hub)
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
      price: 99, 
      durationDays: 30, 
      active: true, 
      displayOrder: 2, 
      type: 'PREMIUM',
      description: 'Unlock all subject-wise mastery tests.',
      features: ['Subject Mocks', 'PYQ PDFs', 'Performance Stats']
    },
    { 
      id: 'gold_pass', 
      name: 'Gold Pass', 
      price: 199, 
      durationDays: 30, 
      active: true, 
      displayOrder: 3, 
      recommended: true,
      type: 'PREMIUM',
      description: 'Complete institutional preparation vault.',
      features: ['500+ Full Mocks', 'AI Rationalizations', 'Readiness Score', 'Priority Alerts']
    }
  ];

  for (const p of passes) {
    await setDoc(doc(db, 'passes', p.id), { ...p, updatedAt: serverTimestamp() });
  }

  // 2. Master Authority Registry with Official Government & Wikimedia URLs
  const stateEmblem = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png';
  const psssbOfficialLogo = 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg';
  const policeEmblem = 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Punjab_Police_India_Logo.png';

  const boards = [
    {
      id: 'psssb',
      abbreviation: 'PSSSB',
      name: 'Punjab Subordinate Services Selection Board',
      iconUrl: psssbOfficialLogo,
      description: 'Official board for Group B and C posts.'
    },
    {
      id: 'ppsc',
      abbreviation: 'PPSC',
      name: 'Punjab Public Service Commission',
      iconUrl: stateEmblem,
      description: 'Authority for Class A and B civil services.'
    },
    {
      id: 'punjab-police',
      abbreviation: 'Police',
      name: 'Punjab Police Recruitment Board',
      iconUrl: policeEmblem,
      description: 'District and Armed cadre recruitments.'
    },
    {
      id: 'pseb',
      abbreviation: 'Education',
      name: 'Punjab School Education Board',
      iconUrl: stateEmblem,
      description: 'ETT, Master Cadre, and PSTET recruitments.'
    },
    {
      id: 'pspcl',
      abbreviation: 'PSPCL',
      name: 'Punjab State Power Corporation Limited',
      iconUrl: stateEmblem,
      description: 'Technical and clerical power sector nodes.'
    },
    {
      id: 'pstcl',
      abbreviation: 'PSTCL',
      name: 'Punjab State Transmission Corporation',
      iconUrl: stateEmblem,
      description: 'Transmission sector recruitment hub.'
    },
    {
      id: 'high-court',
      abbreviation: 'High Court',
      name: 'Punjab & Haryana High Court',
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Scale_of_justice_2.svg/512px-Scale_of_justice_2.svg.png',
      description: 'Judicial and clerical court recruitments.'
    }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() });
  }

  // 3. Subject Registry
  const subjects = [
    { id: 'punjab-gk', name: 'Punjab GK & Culture' },
    { id: 'mental-ability', name: 'Mental Ability / Reasoning' },
    { id: 'quant-aptitude', name: 'Quantitative Aptitude' },
    { id: 'english', name: 'English Language' },
    { id: 'punjabi', name: 'Punjabi Language' },
    { id: 'punjabi-qualifying', name: 'Punjabi Qualifying (Paper A)' },
    { id: 'ict-computers', name: 'ICT / Computers' },
    { id: 'evs-education', name: 'Environmental Studies (EVS)' },
    { id: 'child-pedagogy', name: 'Child Development & Pedagogy' },
    { id: 'static-gk', name: 'Indian GK & Static Hub' }
  ];

  for (const s of subjects) {
    await setDoc(doc(db, 'subjects', s.id), { ...s, updatedAt: serverTimestamp() });
  }

  // 4. Exam Hub Hierarchy
  const exams = [
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
      id: 'pspcl-clerk',
      boardId: 'pspcl',
      name: 'PSPCL LDC / Clerk',
      category: 'Technical',
      totalMocks: 12,
      activeQuestions: 1500,
      description: 'Preparation for Power Corporation clerical nodes.'
    },
    {
      id: 'pstet-p1',
      boardId: 'pseb',
      name: 'PSTET Paper 1 (EVS)',
      category: 'Teaching',
      totalMocks: 10,
      activeQuestions: 1200,
      description: 'Specialized PSTET node with focus on EVS and Pedagogy.'
    },
    {
      id: 'punjab-police-si',
      boardId: 'punjab-police',
      name: 'Sub-Inspector (SI)',
      category: 'Police',
      totalMocks: 15,
      activeQuestions: 1800,
      description: 'Complete series for District and Armed SI.'
    }
  ];

  for (const e of exams) {
    await setDoc(doc(db, 'exams', e.id), { ...e, updatedAt: serverTimestamp() });
  }

  // 5. System Configuration
  await setDoc(doc(db, 'settings', 'global'), {
    platformName: "Cracklix",
    announcement: "🔥 Official Punjab 2026 Recruitment Calendar Live.",
    showAnnouncement: true,
    upiId: "arshdeepgrewal1122@okaxis",
    supportPhone: "+91 98881 88602",
    supportEmail: "cracklixhelp@gmail.com",
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('[REGISTRY] Institutional Registry Sync Complete.');
}
