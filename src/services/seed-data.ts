import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Restores the complete Punjab Government Exam catalog.
 * Boards: PSSSB, PPSC, Punjab Police, Education, High Court, PSPCL, BFUHS, Banking.
 */
export async function seedInitialData(db: Firestore) {
  console.log('Initializing Global Punjab Exam Registry Sync...');

  // 1. Official Recruiting Boards
  const boards = [
    { 
      id: 'psssb', 
      abbreviation: 'PSSSB', 
      name: 'Punjab Subordinate Services Selection Board', 
      description: 'Group B, C, and D non-gazetted positions.', 
      iconUrl: 'https://sssb.punjab.gov.in/images/logo.png' 
    },
    { 
      id: 'police', 
      abbreviation: 'Police', 
      name: 'Punjab Police Recruitment Board', 
      description: 'Dedicated law enforcement cadre recruitment.', 
      iconUrl: 'https://picsum.photos/seed/punjab-police/200/200' 
    },
    { 
      id: 'ppsc', 
      abbreviation: 'PPSC', 
      name: 'Punjab Public Service Commission', 
      description: 'Group A and B gazetted administrative posts.', 
      iconUrl: 'https://picsum.photos/seed/ppsc/200/200' 
    },
    { 
      id: 'education', 
      abbreviation: 'Education', 
      name: 'Punjab Education Department', 
      description: 'Teaching hierarchy including PSTET and Master Cadre.', 
      iconUrl: 'https://picsum.photos/seed/punjab-edu/200/200' 
    },
    { 
      id: 'hc', 
      abbreviation: 'High Court', 
      name: 'High Court of Punjab & Haryana', 
      description: 'Judicial and subordinate court clerical recruitment.', 
      iconUrl: 'https://picsum.photos/seed/hc-clerk/200/200' 
    },
    { 
      id: 'pspcl', 
      abbreviation: 'PSPCL/PSTCL', 
      name: 'Punjab State Power Corporation Limited', 
      description: 'Technical and clerical recruitment for power sector.', 
      iconUrl: 'https://picsum.photos/seed/pspcl/200/200' 
    },
    { 
      id: 'bfuhs', 
      abbreviation: 'BFUHS', 
      name: 'Baba Farid University of Health Sciences', 
      description: 'Medical and health department recruitments.', 
      iconUrl: 'https://picsum.photos/seed/bfuhs/200/200' 
    },
    { 
      id: 'banking', 
      abbreviation: 'Banking', 
      name: 'Punjab Cooperative Banking Sector', 
      description: 'State cooperative and agricultural bank recruitment.', 
      iconUrl: 'https://picsum.photos/seed/pb-bank/200/200' 
    },
  ];
  for (const b of boards) await setDoc(doc(db, 'boards', b.id), b);

  // 2. Comprehensive Subject Matrix
  const subjects = [
    { id: 'punjabi-qualifying', name: 'Mandatory Punjabi (Qualifying)', description: 'Part-A: 50-mark standard exam.' },
    { id: 'punjab-gk', name: 'Punjab GK & History', description: 'Gurus Era, Culture, and Geography.' },
    { id: 'gk-ca', name: 'India GK & Current Affairs', description: 'Polity, Economy, and Daily News.' },
    { id: 'quant', name: 'Quantitative Aptitude', description: 'Arithmetic and Numerical Ability.' },
    { id: 'reasoning', name: 'Mental Ability & Reasoning', description: 'Logical and Analytical Reasoning.' },
    { id: 'english', name: 'General English', description: 'Grammar and Vocabulary.' },
    { id: 'ict', name: 'ICT (Computer Basics)', description: 'MS Office, Internet and Hardware.' },
  ];
  for (const s of subjects) await setDoc(doc(db, 'subjects', s.id), s);

  // 3. Exams Hierarchy (The Core Catalog)
  const exams = [
    // PSSSB
    { id: 'psssb-clerk', boardId: 'psssb', name: 'Clerk (General/IT/Accounts)', category: 'Clerical', totalMocks: 60, activeQuestions: 2500, description: "Group C recruitment with mandatory Paper A focus." },
    { id: 'psssb-excise', boardId: 'psssb', name: 'Excise & Taxation Inspector', category: 'Inspector', totalMocks: 25, activeQuestions: 1200, description: "High-grade technical inspection post." },
    { id: 'psssb-patwari', boardId: 'psssb', name: 'Revenue Patwari', category: 'Revenue', totalMocks: 45, activeQuestions: 1800, description: "Official Canal & Revenue Patwari portal." },
    { id: 'psssb-assistant', boardId: 'psssb', name: 'Senior Assistant (Cum Inspector)', category: 'Clerical', totalMocks: 15, activeQuestions: 1000, description: "Group B administrative recruitment." },
    
    // Police
    { id: 'police-constable', boardId: 'police', name: 'Punjab Police Constable', category: 'Police', totalMocks: 50, activeQuestions: 3000, description: "District and Armed cadre law enforcement." },
    { id: 'police-si', boardId: 'police', name: 'Punjab Police Sub-Inspector', category: 'Police', totalMocks: 30, activeQuestions: 2200, description: "Technical and non-technical officer cadre." },
    { id: 'police-ia', boardId: 'police', name: 'Intelligence Assistant', category: 'Intelligence', totalMocks: 20, activeQuestions: 1500, description: "Intelligence wing recruitment nodes." },

    // PPSC
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'PPSC Civil Services (PCS)', category: 'Executive', totalMocks: 15, activeQuestions: 5000, description: "Class A Gazetted administrative posts." },
    { id: 'ppsc-inspector', boardId: 'ppsc', name: 'Cooperative Inspector', category: 'Inspector', totalMocks: 20, activeQuestions: 1800, description: "Cooperative societies officer recruitment." },
    { id: 'ppsc-naib', boardId: 'ppsc', name: 'Naib Tehsildar', category: 'Revenue', totalMocks: 12, activeQuestions: 1500, description: "Revenue department executive post." },

    // Teaching
    { id: 'pstet-1', boardId: 'education', name: 'PSTET Paper 1', category: 'Teaching', totalMocks: 25, activeQuestions: 2000, description: "Primary teacher eligibility test." },
    { id: 'pstet-2', boardId: 'education', name: 'PSTET Paper 2', category: 'Teaching', totalMocks: 25, activeQuestions: 2500, description: "Upper primary teacher eligibility test." },
    { id: 'master-cadre', boardId: 'education', name: 'Master Cadre (All Subjects)', category: 'Teaching', totalMocks: 40, activeQuestions: 5000, description: "Specialized subject mastery hub." },

    // Technical
    { id: 'pspcl-alm', boardId: 'pspcl', name: 'PSPCL ALM (Assistant Lineman)', category: 'Technical', totalMocks: 30, activeQuestions: 1200, description: "Technical operational cadre for power sector." },
    { id: 'pspcl-je', boardId: 'pspcl', name: 'JE Electrical', category: 'Technical', totalMocks: 20, activeQuestions: 1500, description: "Junior Engineer electrical recruitment." },
  ];
  for (const e of exams) await setDoc(doc(db, 'exams', e.id), e);

  // 4. Initial System Config
  await setDoc(doc(db, 'settings', 'global'), {
    platformName: "Cracklix",
    announcement: "🔥 Official Punjab 2026 Recruitment Calendar Live.",
    showAnnouncement: true,
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('Global Punjab Exam Registry Sync Complete.');
}
