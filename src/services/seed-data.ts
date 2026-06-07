
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine v15.1.
 * Features: High-Fidelity Schema for all Punjab Boards, Exams, and Subjects.
 * Updated: PSPCL logo URL corrected.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Cracklix Global Registry Sync...');

  // 1. BOARDS REGISTRY (The Governing Bodies)
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', category: 'STATE_BOARD', iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg' },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', region: 'Punjab', category: 'GAZETTED_BOARD', iconUrl: 'https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png' },
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', region: 'Punjab', category: 'DEFENCE_BOARD', iconUrl: 'https://punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png' },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'Punjab State Power Corporation Ltd', region: 'Punjab', category: 'TECHNICAL_BOARD', iconUrl: 'https://pspcl.in/assets/images/logo.png' },
    { id: 'high-court', abbreviation: 'COURT', name: 'Punjab & Haryana High Court (SSSC)', region: 'Punjab/Haryana', category: 'JUDICIAL_BOARD', iconUrl: 'https://highcourtchd.gov.in/images/hc_logo.png' },
    { id: 'army', abbreviation: 'ARMY', name: 'Indian Army Recruitment', region: 'National', category: 'CENTRAL_BOARD', iconUrl: 'https://www.indianarmy.nic.in/assets/img/logo.png' }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. EXAM MASTER HUBS (Vertical Recruitments)
  const exams = [
    { id: 'punjab-patwari', boardId: 'psssb', name: 'Revenue Patwari 2026', category: 'STATE', totalFullMocks: 45, totalPyqs: 10, iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg' },
    { id: 'psssb-clerk', boardId: 'psssb', name: 'Clerk / Junior Assistant', category: 'STATE', totalFullMocks: 60, totalPyqs: 15, iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg' },
    { id: 'police-si', boardId: 'punjab-police', name: 'Sub-Inspector (Dist/Armed)', category: 'POLICE', totalFullMocks: 30, totalPyqs: 5, iconUrl: 'https://punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png' },
    { id: 'police-constable', boardId: 'punjab-police', name: 'Constable Recruitment', category: 'POLICE', totalFullMocks: 50, totalPyqs: 8, iconUrl: 'https://punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png' },
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'PCS Executive Prelims', category: 'CIVIL', totalFullMocks: 20, totalPyqs: 12, iconUrl: 'https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png' },
    { id: 'pspcl-clerk', boardId: 'pspcl', name: 'PSPCL LDC / Clerk', category: 'STATE', totalFullMocks: 25, totalPyqs: 6, iconUrl: 'https://pspcl.in/assets/images/logo.png' },
    { id: 'court-clerk', boardId: 'high-court', name: 'Subordinate Court Clerk', category: 'JUDICIAL', totalFullMocks: 35, totalPyqs: 10, iconUrl: 'https://highcourtchd.gov.in/images/hc_logo.png' }
  ];

  for (const e of exams) {
    await setDoc(doc(db, 'exams', e.id), { ...e, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. SUBJECT REGISTRY (Canonical Prep Nodes)
  const subjects = [
    { id: 'punjab-gk', name: 'Punjab History & Culture', aliases: ['Punjab GK', 'Virasat'] },
    { id: 'reasoning', name: 'Logical Reasoning & Mental Ability', aliases: ['Reasoning', 'Mental Ability'] },
    { id: 'quant', name: 'Quantitative Aptitude', aliases: ['Maths', 'Aptitude'] },
    { id: 'punjabi-a', name: 'Punjabi (Qualifying - Part A)', aliases: ['Punjabi A', 'Gurmukhi'] },
    { id: 'punjabi-b', name: 'Punjabi (Part B)', aliases: ['Punjabi Grammer'] },
    { id: 'english', name: 'English Language', aliases: ['General English'] },
    { id: 'ict', name: 'Information Technology (ICT)', aliases: ['Computers', 'Digital Literacy'] },
    { id: 'gk-ca', name: 'General Knowledge & Current Affairs', aliases: ['GK', 'Daily Analysis'] },
    { id: 'agriculture', name: 'Agriculture & Economy', aliases: ['Agri', 'Punjab Economy'] }
  ];

  for (const s of subjects) {
    await setDoc(doc(db, 'subjects', s.id), { ...s, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Institutional Registry Sync Complete.');
}
