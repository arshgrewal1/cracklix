
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine v9.0.
 * Features: High-Fidelity Subject Master Registry with Aliases.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Global Institutional Registry Sync...');

  // 1. Boards Registry (Authorities)
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg' },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png' },
    { id: 'punjab-police', abbreviation: 'Police', name: 'Punjab Police Recruitment', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png' },
    { id: 'edu-dept', abbreviation: 'Education', name: 'Punjab Education Department', region: 'Punjab', category: 'TEACHING', iconUrl: 'https://pstet.pseb.ac.in/img/main-logo-2.png' },
    { id: 'high-court-board', abbreviation: 'High Court', name: 'Punjab & Haryana High Court', region: 'Punjab', category: 'PUNJAB_STATE', iconUrl: 'https://highcourtchd.gov.in/images/newlogo.png' },
    { id: 'defense-army', abbreviation: 'ARMY', name: 'Indian Army', region: 'National', category: 'CENTRAL', iconUrl: 'https://pbs.twimg.com/profile_images/2054486939102035969/AE8RcJUh_400x400.jpg' }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. Exam Verticals
  const exams = [
    { id: 'ctet-p1', boardId: 'ctet-board', name: 'CTET Paper 1', category: 'TEACHING', description: 'Primary Stage (Classes I-V)' },
    { id: 'pstet-p1', boardId: 'edu-dept', name: 'PSTET Paper 1', category: 'TEACHING', description: 'Punjab State Teacher Eligibility Test' },
    { id: 'psssb-clerk', boardId: 'psssb', name: 'PSSSB Clerk', category: 'STATE', description: 'General and Technical Recruitment' },
    { id: 'punjab-patwari', boardId: 'psssb', name: 'Revenue Patwari', category: 'STATE', description: 'Revenue Department' },
    { id: 'police-si', boardId: 'punjab-police', name: 'Police SI', category: 'STATE', description: 'Sub-Inspector Recruitment' }
  ];

  for (const e of exams) {
    await setDoc(doc(db, 'exams', e.id), { ...e, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. Subject Master Registry (Normalized Nodes)
  const subjects = [
    { 
      id: 'punjab-gk', 
      name: 'Punjab GK & History', 
      aliases: ['Punjab History', 'Punjab Culture', 'Punjab General Knowledge', 'State GK'] 
    },
    { 
      id: 'punjabi-language', 
      name: 'Punjabi Language', 
      aliases: ['Punjabi', 'Punjabi Grammar', 'Punjabi B', 'Standard Punjabi'] 
    },
    { 
      id: 'punjabi-qualifying', 
      name: 'Punjabi Qualifying (Paper A)', 
      aliases: ['Qualifying Punjabi', 'Paper A Punjabi', 'Mandatory Punjabi'] 
    },
    { 
      id: 'ict-computers', 
      name: 'ICT / Computers', 
      aliases: ['ICT', 'Computers', 'Computer Basics', 'Digital Literacy', 'IT'] 
    },
    { 
      id: 'quant-aptitude', 
      name: 'Quantitative Aptitude', 
      aliases: ['Maths', 'Numerical Ability', 'Mathematics', 'Quant'] 
    },
    { 
      id: 'mental-ability', 
      name: 'Mental Ability & Reasoning', 
      aliases: ['Reasoning', 'Logical Reasoning', 'General Intelligence'] 
    },
    { 
      id: 'child-pedagogy', 
      name: 'Child Development & Pedagogy', 
      aliases: ['CDP', 'Child Psychology', 'Pedagogy', 'Teaching Methodology'] 
    },
    { 
      id: 'english-lang', 
      name: 'English Language', 
      aliases: ['English', 'English Grammar', 'English Comprehension'] 
    },
    { 
      id: 'current-affairs', 
      name: 'Current Affairs', 
      aliases: ['Daily News', 'CA', 'Events'] 
    }
  ];

  for (const s of subjects) {
    await setDoc(doc(db, 'subjects', s.id), { ...s, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Institutional Registry Sync Complete.');
}
