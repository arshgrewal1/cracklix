import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine v56.0.
 * Features: High-Fidelity Verified Official Logos for Punjab & National Exam Hubs.
 * UPDATED: Corrected CTET Logo and Hardened mandatory logos for all verticals.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Cracklix Global Registry Sync...');

  // High-Fidelity Official Assets (Verified Nodes)
  const psssbLogo = "https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg";
  const psebOfficialLogo = "https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png";
  const ppscJpg = "https://upload.wikimedia.org/wikipedia/en/a/a1/Punjab_Public_Service_Commission.jpg";
  const policeEmblem = "https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png";
  const ctetLogo = "https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png";
  const pstetLogo = "https://pstet.pseb.ac.in/img/main-logo-2.png";
  const ssscLogo = "https://highcourtchd.gov.in/images/logo.png";
  const pspclLogo = "https://pspcl.in/assets/images/logo.png";
  const armyEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Indian_Army_Insignia_circular.png/1280px-Indian_Army_Insignia_circular.png";
  const ibpsLogo = "https://upload.wikimedia.org/wikipedia/en/b/b3/Institute_of_Banking_Personnel_Selection_Logo.png";
  const sscLogo = "https://ssc.gov.in/assets/sscLogo.webp";

  // 1. BOARDS REGISTRY
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', category: 'STATE_BOARD', iconUrl: psssbLogo },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', region: 'Punjab', category: 'GAZETTED_BOARD', iconUrl: ppscJpg },
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', region: 'Punjab', category: 'DEFENCE_BOARD', iconUrl: policeEmblem },
    { id: 'high-court', abbreviation: 'SSSC', name: 'High Court of Punjab & Haryana (SSSC)', region: 'Punjab/Haryana', category: 'JUDICIAL_BOARD', iconUrl: ssscLogo },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'Punjab State Power Corporation Ltd', region: 'Punjab', category: 'TECHNICAL_BOARD', iconUrl: pspclLogo },
    { id: 'army', abbreviation: 'ARMY', name: 'Indian Army Recruitment', region: 'National', category: 'CENTRAL_BOARD', iconUrl: armyEmblem },
    { id: 'education', abbreviation: 'EDUCATION', name: 'Education Recruitment Board Punjab (PSEB)', region: 'Punjab', category: 'TEACHING_BOARD', iconUrl: psebOfficialLogo },
    { id: 'cbse', abbreviation: 'CBSE', name: 'Central Board of Secondary Education (CTET)', region: 'National', category: 'TEACHING_BOARD', iconUrl: ctetLogo },
    { id: 'pstet', abbreviation: 'PSTET', name: 'Punjab State Teacher Eligibility Test (PSEB)', region: 'Punjab', category: 'TEACHING_BOARD', iconUrl: pstetLogo },
    { id: 'ibps', abbreviation: 'IBPS', name: 'Institute of Banking Personnel Selection', region: 'National', category: 'BANKING_BOARD', iconUrl: ibpsLogo },
    { id: 'ssc', abbreviation: 'SSC', name: 'Staff Selection Commission', region: 'National', category: 'CENTRAL_BOARD', iconUrl: sscLogo }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. CANONICAL EXAM MASTER HUBS
  const exams = [
    // PSSSB VERTICALS (Hardened Branding)
    { id: 'psssb-clerk-gen', boardId: 'psssb', name: 'PSSSB Clerk (General/IT/Accounts)', category: 'STATE', description: 'Clerical recruitment for multi-departmental Punjab govt posts.', iconUrl: psssbLogo },
    { id: 'psssb-tech-field', boardId: 'psssb', name: 'Technical / Field Posts (Librarian/Storekeeper)', category: 'STATE', description: 'Specialized recruitment for technical and field positions.', iconUrl: psssbLogo },
    { id: 'psssb-group-d', boardId: 'psssb', name: 'PSSSB Group D (Sewadar/Chowkidar)', category: 'STATE', description: 'Group D recruitment for various Punjab departments.', iconUrl: psssbLogo },
    { id: 'punjab-patwari', boardId: 'psssb', name: 'Revenue Patwari 2026', category: 'STATE', description: 'Prepare for Revenue Patwari, Canal Patwari and Ziladar recruitment.', iconUrl: psssbLogo },
    { id: 'psssb-senior-asst', boardId: 'psssb', name: 'Senior Assistant cum Inspector', category: 'STATE', description: 'Senior level clerical and field officer recruitment.', iconUrl: psssbLogo },

    // PUNJAB POLICE VERTICALS (Hardened Branding)
    { id: 'police-si', boardId: 'punjab-police', name: 'Sub-Inspector (Dist/Armed)', category: 'POLICE', description: 'District and Armed Cadre recruitment for Punjab Police.', iconUrl: policeEmblem },
    { id: 'police-constable', boardId: 'punjab-police', name: 'Constable Recruitment', category: 'POLICE', description: 'Direct recruitment for Constable posts in Punjab Police.', iconUrl: policeEmblem },
    { id: 'police-hc-asi', boardId: 'punjab-police', name: 'Head Constable / ASI', category: 'POLICE', description: 'Mid-tier recruitment for Punjab Police cadre.', iconUrl: policeEmblem },
    { id: 'police-jail-warder', boardId: 'punjab-police', name: 'Jail Warder & Matron', category: 'POLICE', description: 'Recruitment for Punjab Prisons department.', iconUrl: policeEmblem },
    { id: 'police-tss', boardId: 'punjab-police', name: 'Technical Support Services (TSS)', category: 'POLICE', description: 'Technical recruitment for Punjab Police support nodes.', iconUrl: policeEmblem },

    // TEACHING VERTICALS (Hardened Branding)
    { id: 'ett-cadre', boardId: 'education', name: 'ETT Cadre', category: 'TEACHING', description: 'Elementary Teacher Training recruitment hub.', iconUrl: psebOfficialLogo },
    { id: 'master-cadre', boardId: 'education', name: 'Master Cadre', category: 'TEACHING', description: 'Subject-wise teacher recruitment for Punjab Schools.', iconUrl: psebOfficialLogo },
    { id: 'lecturer-cadre', boardId: 'education', name: 'Lecturer Cadre', category: 'TEACHING', description: 'School Lecturer recruitment for Punjab education hubs.', iconUrl: psebOfficialLogo },

    // CTET VERTICALS (Corrected Branding)
    { id: 'ctet-paper-1', boardId: 'cbse', name: 'CTET Paper 1', category: 'TEACHING', description: 'Central Teacher Eligibility Test (Primary Stage).', iconUrl: ctetLogo },
    { id: 'ctet-paper-2', boardId: 'cbse', name: 'CTET Paper 2', category: 'TEACHING', description: 'Central Teacher Eligibility Test (Elementary Stage).', iconUrl: ctetLogo },

    // Other canonical hubs
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'PCS Executive Prelims', category: 'CIVIL', description: 'Higher Class A & B services including DSP and Tehsildar posts.', iconUrl: ppscJpg },
    { id: 'hc-clerk', boardId: 'high-court', name: 'High Court Clerk (SSSC)', category: 'JUDICIAL', description: 'Clerical recruitment for High Court of Punjab & Haryana.', iconUrl: ssscLogo },
    { id: 'ibps-po', boardId: 'ibps', name: 'IBPS PO / Clerk', category: 'BANKING', description: 'Central banking recruitment exams.', iconUrl: ibpsLogo },
    { id: 'ssc-cgl', boardId: 'ssc', name: 'SSC CGL', category: 'CENTRAL', description: 'Combined Graduate Level Examination for central posts.', iconUrl: sscLogo },
    { id: 'ssc-chsl', boardId: 'ssc', name: 'SSC CHSL', category: 'CENTRAL', description: 'Combined Higher Secondary Level Examination.', iconUrl: sscLogo },
    { id: 'ssc-mts', boardId: 'ssc', name: 'SSC MTS & Havildar', category: 'CENTRAL', description: 'Multi-Tasking Staff recruitment examination.', iconUrl: sscLogo },
    { id: 'pspcl-clerk', boardId: 'pspcl', name: 'PSPCL Clerk / LDC', category: 'TECHNICAL', description: 'Recruitment for Punjab State Power Corporation.', iconUrl: pspclLogo },
    { id: 'pspcl-alm', boardId: 'pspcl', name: 'ALM / Lineman', category: 'TECHNICAL', description: 'Assistant Lineman recruitment for Punjab State Power Corporation.', iconUrl: pspclLogo },
    { id: 'pstet-hub', boardId: 'pstet', name: 'PSTET Hub', category: 'TEACHING', description: 'Punjab State Teacher Eligibility Test recruitment.', iconUrl: pstetLogo }
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
