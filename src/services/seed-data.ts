
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine v37.0 (Agniveer Hub Optimized).
 * Features: Hardened Unique Hub Registry with High-Fidelity Official Assets.
 * ReferrerPolicy Hardening is applied at the rendering layer.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Cracklix Global Registry Sync...');

  // High-Fidelity Official Assets
  const psssbSvg = "https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg";
  const ppscJpg = "https://upload.wikimedia.org/wikipedia/en/a/a1/Punjab_Public_Service_Commission.jpg";
  const policeEmblem = "https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png";
  const ssscLogo = "https://highcourtchd.gov.in/images/logo.png";
  const pspclLogo = "https://pspcl.in/assets/images/logo.png";
  const anganwadiLogo = "https://sswcd.punjab.gov.in/sites/default/files/download.png";
  const armyEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Indian_Army_Insignia_circular.png/1280px-Indian_Army_Insignia_circular.png";
  const ibpsLogo = "https://careeravenues.info/wp-content/uploads/2023/05/Introduction.jpg";
  const punjabEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png";

  // 1. BOARDS REGISTRY
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', category: 'STATE_BOARD', iconUrl: psssbSvg },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', region: 'Punjab', category: 'GAZETTED_BOARD', iconUrl: ppscJpg },
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', region: 'Punjab', category: 'DEFENCE_BOARD', iconUrl: policeEmblem },
    { id: 'high-court', abbreviation: 'SSSC', name: 'High Court of Punjab & Haryana (SSSC)', region: 'Punjab/Haryana', category: 'JUDICIAL_BOARD', iconUrl: ssscLogo },
    { id: 'sswcd', abbreviation: 'SSWCD', name: 'Social Security and Women & Child Development', region: 'Punjab', category: 'STATE_BOARD', iconUrl: anganwadiLogo },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'Punjab State Power Corporation Ltd', region: 'Punjab', category: 'TECHNICAL_BOARD', iconUrl: pspclLogo },
    { id: 'ibps', abbreviation: 'IBPS', name: 'Institute of Banking Personnel Selection', region: 'National', category: 'BANKING_BOARD', iconUrl: ibpsLogo },
    { id: 'army', abbreviation: 'ARMY', name: 'Indian Army Recruitment', region: 'National', category: 'CENTRAL_BOARD', iconUrl: armyEmblem },
    { id: 'education', abbreviation: 'EDUCATION', name: 'Education Recruitment Board Punjab', region: 'Punjab', category: 'TEACHING_BOARD', iconUrl: punjabEmblem }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. CANONICAL EXAM MASTER HUBS
  const exams = [
    { id: 'punjab-patwari', boardId: 'psssb', name: 'Revenue Patwari 2026', category: 'STATE', description: 'Prepare for Revenue Patwari, Canal Patwari and Ziladar recruitment.', totalFullMocks: 45, iconUrl: psssbSvg },
    { id: 'psssb-clerk', boardId: 'psssb', name: 'Subordinate Clerk (PSSSB)', category: 'STATE', description: 'Clerical recruitment for multi-departmental Punjab govt posts.', totalFullMocks: 60, iconUrl: psssbSvg },
    { id: 'psssb-excise', boardId: 'psssb', name: 'Excise & Taxation Inspector', category: 'STATE', description: 'Official mock series for PSSSB Excise Inspector recruitment.', totalFullMocks: 25, iconUrl: psssbSvg },
    { id: 'psssb-auditor', boardId: 'psssb', name: 'Junior Auditor', category: 'STATE', description: 'Institutional preparation for Junior Auditor and Accounts posts.', totalFullMocks: 20, iconUrl: psssbSvg },
    { id: 'court-clerk', boardId: 'high-court', name: 'High Court Clerk (SSSC)', category: 'JUDICIAL', description: 'Subordinate Court clerical recruitment for Punjab and Haryana.', totalFullMocks: 35, iconUrl: ssscLogo },
    { id: 'police-si', boardId: 'punjab-police', name: 'Sub-Inspector (Dist/Armed)', category: 'POLICE', description: 'District and Armed Cadre recruitment for Punjab Police.', totalFullMocks: 30, iconUrl: policeEmblem },
    { id: 'police-constable', boardId: 'punjab-police', name: 'Constable Recruitment', category: 'POLICE', description: 'Direct recruitment for Constable posts in Punjab Police.', totalFullMocks: 50, iconUrl: policeEmblem },
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'PCS Executive Prelims', category: 'CIVIL', description: 'Higher Class A & B services including DSP and Tehsildar posts.', totalFullMocks: 20, iconUrl: ppscJpg },
    { id: 'naib-tehsildar', boardId: 'ppsc', name: 'Naib Tehsildar', category: 'CIVIL', description: 'PPSC recruitment series for revenue executive posts.', totalFullMocks: 15, iconUrl: ppscJpg },
    { id: 'punjab-anganwadi', boardId: 'sswcd', name: 'Punjab Anganwadi / NTT', category: 'STATE', description: 'Official syllabus and preparation matrix for Supervisor and NTT posts.', totalFullMocks: 15, iconUrl: anganwadiLogo },
    { id: 'ibps-po-clerk', boardId: 'ibps', name: 'IBPS PO / Clerk', category: 'BANKING', description: 'Complete mock series for Bank Probationary Officers and Clerical posts.', totalFullMocks: 40, iconUrl: ibpsLogo },
    { id: 'pspcl-je', boardId: 'pspcl', name: 'PSPCL Junior Engineer', category: 'TECHNICAL', description: 'Electrical, Civil and IT JE recruitment for Punjab Power Board.', totalFullMocks: 25, iconUrl: pspclLogo },
    { id: 'master-cadre', boardId: 'education', name: 'Master Cadre', category: 'TEACHING', description: 'Subject-wise teacher recruitment for Punjab Government Schools.', totalFullMocks: 40, iconUrl: punjabEmblem },
    { id: 'indian-army', boardId: 'army', name: 'Agniveer GD / Tech', category: 'CENTRAL', description: 'High-fidelity preparation series for Indian Army Agniveer.', totalFullMocks: 10, iconUrl: armyEmblem }
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
