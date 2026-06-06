
import { Firestore, doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine v6.0.
 * Orchestrates strict isolation for Teaching, Punjab State, and Central verticals.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Global Institutional Registry Sync...');

  // 1. Boards Registry (Authorities)
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg' },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png' },
    { id: 'punjab-police', abbreviation: 'Police', name: 'Punjab Police Recruitment', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png' },
    { id: 'edu-dept', abbreviation: 'Education', name: 'Punjab Education Department', region: 'Punjab', category: 'TEACHING', iconUrl: 'https://pstet.pseb.ac.in/img/main-logo-2.png' },
    { id: 'ctet-board', abbreviation: 'CTET', name: 'Central Teacher Eligibility Board', region: 'National', category: 'TEACHING', iconUrl: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png' },
    { id: 'high-court-board', abbreviation: 'High Court', name: 'Punjab & Haryana High Court', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://highcourtchd.gov.in/images/newlogo.png' },
    { id: 'central-ssc', abbreviation: 'SSC', name: 'Staff Selection Commission', region: 'National', category: 'CENTRAL', iconUrl: 'https://ssc.gov.in/assets/sscLogo.webp' },
    { id: 'defense-army', abbreviation: 'ARMY', name: 'Indian Army', region: 'National', category: 'CENTRAL', iconUrl: 'https://pbs.twimg.com/profile_images/2054486939102035969/AE8RcJUh_400x400.jpg' }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. Exam Verticals (Strict Isolation)
  const exams = [
    // Teaching Registry
    { id: 'ctet-p1', boardId: 'ctet-board', name: 'CTET Paper 1', category: 'TEACHING', description: 'Primary Stage (Classes I-V)' },
    { id: 'ctet-p2', boardId: 'ctet-board', name: 'CTET Paper 2', category: 'TEACHING', description: 'Elementary Stage (Classes VI-VIII)' },
    { id: 'pstet-p1', boardId: 'edu-dept', name: 'PSTET Paper 1', category: 'TEACHING', description: 'Punjab State Teacher Eligibility Test P1' },
    { id: 'pstet-p2', boardId: 'edu-dept', name: 'PSTET Paper 2', category: 'TEACHING', description: 'Punjab State Teacher Eligibility Test P2' },
    { id: 'ett-cadre', boardId: 'edu-dept', name: 'ETT Cadre', category: 'TEACHING', description: 'Elementary Teacher Training Recruitment' },
    { id: 'master-cadre', boardId: 'edu-dept', name: 'Master Cadre', category: 'TEACHING', description: 'Secondary Teaching Recruitment' },
    { id: 'lecturer-cadre', boardId: 'edu-dept', name: 'Lecturer Cadre', category: 'TEACHING', description: 'Higher Secondary Recruitment' },
    { id: 'punjab-anganwadi', boardId: 'psssb', name: 'Anganwadi Supervisor', category: 'TEACHING', description: 'Social Security & Child Development' },

    // Punjab State Registry
    { id: 'psssb-clerk', boardId: 'psssb', name: 'PSSSB Clerk', category: 'STATE', description: 'General, IT, and Accounts Verticals' },
    { id: 'punjab-patwari', boardId: 'psssb', name: 'Revenue Patwari', category: 'STATE', description: 'Revenue and Canal Department' },
    { id: 'police-si', boardId: 'punjab-police', name: 'Police SI', category: 'STATE', description: 'Sub-Inspector Technical & District' },
    { id: 'pspcl-clerk', boardId: 'psssb', name: 'PSPCL LDC', category: 'STATE', description: 'Punjab Power Lower Division Clerk' },
    { id: 'high-court-clerk', boardId: 'high-court-board', name: 'High Court Clerk', category: 'STATE', description: 'SSSC Judicial Recruitment' },

    // Central Registry
    { id: 'ssc-cgl', boardId: 'central-ssc', name: 'SSC CGL', category: 'CENTRAL', description: 'Combined Graduate Level' },
    { id: 'army-agniveer', boardId: 'defense-army', name: 'Army Agniveer', category: 'CENTRAL', description: 'Defense Recruitment' },
    { id: 'banking-ibps', boardId: 'central-ssc', name: 'IBPS PO/Clerk', category: 'CENTRAL', description: 'Banking Personnel Selection' }
  ];

  for (const e of exams) {
    await setDoc(doc(db, 'exams', e.id), { ...e, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. Subjects Registry
  const subjects = [
    { id: 'punjab-gk', name: 'Punjab GK' },
    { id: 'punjabi-paper-a', name: 'Punjabi Paper A' },
    { id: 'mental-ability', name: 'Reasoning' },
    { id: 'quant', name: 'Quantitative Aptitude' },
    { id: 'ict', name: 'ICT / Computers' }
  ];

  for (const s of subjects) {
    await setDoc(doc(db, 'subjects', s.id), { ...s, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Institutional Registry Sync Complete.');
}
