
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine v18.0.
 * Features: High-Fidelity STABLE Asset Registry.
 * Updated: PSSSB official SVG integrated per management request.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Cracklix Global Registry Sync...');

  // Stable Institutional Assets
  const punjabGovLogo = "https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg";
  const stateEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png";
  const policeEmblem = "https://upload.wikimedia.org/wikipedia/commons/3/3a/Logo_of_Punjab_Police_India.png";
  const armyEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Indian_Army_Logo.png/400px-Indian_Army_Logo.png";
  const courtEmblem = "https://highcourtchd.gov.in/sub_pages/left_menu/images/logo_new.png";

  // 1. BOARDS REGISTRY (The Governing Bodies)
  const boards = [
    { 
      id: 'psssb', 
      abbreviation: 'PSSSB', 
      name: 'Punjab Subordinate Services Selection Board', 
      region: 'Punjab', 
      category: 'STATE_BOARD', 
      iconUrl: punjabGovLogo
    },
    { 
      id: 'ppsc', 
      abbreviation: 'PPSC', 
      name: 'Punjab Public Service Commission', 
      region: 'Punjab', 
      category: 'GAZETTED_BOARD', 
      iconUrl: stateEmblem
    },
    { 
      id: 'punjab-police', 
      abbreviation: 'POLICE', 
      name: 'Punjab Police Recruitment Board', 
      region: 'Punjab', 
      category: 'DEFENCE_BOARD', 
      iconUrl: policeEmblem
    },
    { 
      id: 'pspcl', 
      abbreviation: 'PSPCL', 
      name: 'Punjab State Power Corporation Ltd', 
      region: 'Punjab', 
      category: 'TECHNICAL_BOARD', 
      iconUrl: 'https://pspcl.in/assets/images/logo.png' 
    },
    { 
      id: 'high-court', 
      abbreviation: 'COURT', 
      name: 'Punjab & Haryana High Court (SSSC)', 
      region: 'Punjab/Haryana', 
      category: 'JUDICIAL_BOARD', 
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Emblem_of_India.svg/200px-Emblem_of_India.svg.png'
    },
    { 
      id: 'army', 
      abbreviation: 'ARMY', 
      name: 'Indian Army Recruitment', 
      region: 'National', 
      category: 'CENTRAL_BOARD', 
      iconUrl: armyEmblem
    }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. EXAM MASTER HUBS (Vertical Recruitments)
  const exams = [
    { id: 'punjab-patwari', boardId: 'psssb', name: 'Revenue Patwari 2026', category: 'STATE', totalFullMocks: 45, totalPyqs: 10, iconUrl: punjabGovLogo },
    { id: 'psssb-clerk', boardId: 'psssb', name: 'Subordinate Clerk (PSSSB)', category: 'STATE', totalFullMocks: 60, totalPyqs: 15, iconUrl: punjabGovLogo },
    { id: 'police-si', boardId: 'punjab-police', name: 'Sub-Inspector (Dist/Armed)', category: 'POLICE', totalFullMocks: 30, totalPyqs: 5, iconUrl: policeEmblem },
    { id: 'police-constable', boardId: 'punjab-police', name: 'Constable Recruitment', category: 'POLICE', totalFullMocks: 50, totalPyqs: 8, iconUrl: policeEmblem },
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'PCS Executive Prelims', category: 'CIVIL', totalFullMocks: 20, totalPyqs: 12, iconUrl: stateEmblem },
    { id: 'pspcl-clerk', boardId: 'pspcl', name: 'PSPCL LDC / Clerk', category: 'STATE', totalFullMocks: 25, totalPyqs: 6, iconUrl: 'https://pspcl.in/assets/images/logo.png' },
    { id: 'court-clerk', boardId: 'high-court', name: 'Subordinate Court Clerk', category: 'JUDICIAL', totalFullMocks: 35, totalPyqs: 10, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Emblem_of_India.svg/200px-Emblem_of_India.svg.png' },
    { id: 'indian-army', boardId: 'army', name: 'Agniveer Recruitment', category: 'CENTRAL', totalFullMocks: 10, totalPyqs: 5, iconUrl: armyEmblem }
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
