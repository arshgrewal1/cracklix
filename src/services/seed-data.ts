
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine v24.0.
 * Features: Hardened Unique Hub Registry with support for ARMY, DEFENSE and TECHNICAL IDs.
 * Updated: SSWCD (Anganwadi) official asset node integrated.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Cracklix Global Registry Sync...');

  // Stable Institutional Assets
  const psssbSvg = "https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg";
  const ppscJpg = "https://upload.wikimedia.org/wikipedia/en/a/a1/Punjab_Public_Service_Commission.jpg";
  const policeEmblem = "https://upload.wikimedia.org/wikipedia/commons/3/3a/Logo_of_Punjab_Police_India.png";
  const armyEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Indian_Army_Logo.png/400px-Indian_Army_Logo.png";
  const courtEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Emblem_of_India.svg/200px-Emblem_of_India.svg.png";
  const pspclLogo = "https://pspcl.in/assets/images/logo.png";
  const anganwadiLogo = "https://sswcd.punjab.gov.in/sites/default/files/download.png";

  // 1. BOARDS REGISTRY (The Governing Bodies)
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', category: 'STATE_BOARD', iconUrl: psssbSvg },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', region: 'Punjab', category: 'GAZETTED_BOARD', iconUrl: ppscJpg },
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', region: 'Punjab', category: 'DEFENCE_BOARD', iconUrl: policeEmblem },
    { id: 'sswcd', abbreviation: 'SSWCD', name: 'Social Security and Women & Child Development', region: 'Punjab', category: 'STATE_BOARD', iconUrl: anganwadiLogo },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'Punjab State Power Corporation Ltd', region: 'Punjab', category: 'TECHNICAL_BOARD', iconUrl: pspclLogo },
    { id: 'high-court', abbreviation: 'COURT', name: 'Punjab & Haryana High Court (SSSC)', region: 'Punjab/Haryana', category: 'JUDICIAL_BOARD', iconUrl: courtEmblem },
    { id: 'army', abbreviation: 'ARMY', name: 'Indian Army Recruitment', region: 'National', category: 'CENTRAL_BOARD', iconUrl: armyEmblem },
    { id: 'INDIAN-ARMY', abbreviation: 'ARMY', name: 'Indian Army Defense Node', region: 'National', category: 'DEFENCE_BOARD', iconUrl: armyEmblem }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. CANONICAL EXAM MASTER HUBS
  const exams = [
    { id: 'punjab-patwari', boardId: 'psssb', name: 'Revenue Patwari 2026', category: 'STATE', description: 'Prepare for Revenue Patwari, Canal Patwari and Ziladar recruitment.', totalFullMocks: 45, iconUrl: psssbSvg },
    { id: 'psssb-clerk', boardId: 'psssb', name: 'Subordinate Clerk (PSSSB)', category: 'STATE', description: 'Clerical recruitment for multi-departmental Punjab govt posts.', totalFullMocks: 60, iconUrl: psssbSvg },
    { id: 'punjab-anganwadi', boardId: 'sswcd', name: 'Punjab Anganwadi / NTT', category: 'STATE', description: 'Official syllabus and preparation matrix for Supervisor and NTT posts.', totalFullMocks: 15, iconUrl: anganwadiLogo },
    { id: 'police-si', boardId: 'punjab-police', name: 'Sub-Inspector (Dist/Armed)', category: 'POLICE', description: 'District and Armed Cadre recruitment for Punjab Police.', totalFullMocks: 30, iconUrl: policeEmblem },
    { id: 'police-constable', boardId: 'punjab-police', name: 'Constable Recruitment', category: 'POLICE', description: 'Direct recruitment for Constable posts in Punjab Police.', totalFullMocks: 50, iconUrl: policeEmblem },
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'PCS Executive Prelims', category: 'CIVIL', description: 'Higher Class A & B services including DSP and Tehsildar posts.', totalFullMocks: 20, iconUrl: ppscJpg },
    { id: 'pspcl-clerk', boardId: 'pspcl', name: 'PSPCL LDC / Clerk', category: 'TECHNICAL', description: 'Clerical recruitment for Punjab State Power Corporation.', totalFullMocks: 25, iconUrl: pspclLogo },
    { id: 'court-clerk', boardId: 'high-court', name: 'High Court Clerk', category: 'JUDICIAL', description: 'Subordinate Court clerical recruitment (SSSC).', totalFullMocks: 35, iconUrl: courtEmblem },
    { id: 'indian-army', boardId: 'INDIAN-ARMY', name: 'Agniveer GD / Tech', category: 'CENTRAL', description: 'High-fidelity preparation series for Indian Army Agniveer.', totalFullMocks: 10, iconUrl: armyEmblem }
  ];

  for (const e of exams) {
    await setDoc(doc(db, 'exams', e.id), { ...e, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. SUBJECT REGISTRY
  const subjects = [
    { id: 'punjab-gk', name: 'Punjab History & Culture', aliases: ['Punjab GK', 'Virasat'] },
    { id: 'reasoning', name: 'Logical Reasoning & Mental Ability', aliases: ['Reasoning', 'Mental Ability'] },
    { id: 'quant', name: 'Quantitative Aptitude', aliases: ['Maths', 'Aptitude'] },
    { id: 'punjabi-a', name: 'Punjabi (Qualifying - Part A)', aliases: ['Punjabi A', 'Gurmukhi'] },
    { id: 'punjabi-b', name: 'Punjabi (Part B)', aliases: ['Punjabi Grammer'] },
    { id: 'english', name: 'English Language', aliases: ['General English'] },
    { id: 'ict', name: 'Information Technology (ICT)', aliases: ['Computers', 'Digital Literacy'] },
    { id: 'gk-ca', name: 'General Knowledge & Current Affairs', aliases: ['GK', 'Daily Analysis'] }
  ];

  for (const s of subjects) {
    await setDoc(doc(db, 'subjects', s.id), { ...s, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Institutional Registry Sync Complete.');
}
