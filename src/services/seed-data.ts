
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine for Cracklix.
 * Populates the repository with the full official Punjab Government Exam Hierarchy.
 */
export async function seedInitialData(db: Firestore) {
  console.log('Initializing Structured Punjab Repository Sync...');

  // 1. Official Recruiting Boards
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', description: 'Handles Group B, C, and D non-gazetted positions across all state departments.', iconUrl: 'https://picsum.photos/seed/psssb/200/200' },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', description: 'Handles top-tier, highly authoritative Group A and Group B gazetted administrative posts.', iconUrl: 'https://picsum.photos/seed/ppsc/200/200' },
    { id: 'police', abbreviation: 'Police', name: 'Punjab Police Recruitment Board', description: 'Dedicated law enforcement cadre recruitment for Punjab.', iconUrl: 'https://picsum.photos/seed/police/200/200' },
    { id: 'education', abbreviation: 'Education', name: 'Punjab Education Department / CBSE', description: 'Teaching hierarchy including PSTET, CTET, Master Cadre, ETT, and Lecturer recruitment.', iconUrl: 'https://picsum.photos/seed/teaching/200/200' },
    { id: 'technical', abbreviation: 'Technical', name: 'Autonomous & Technical Bodies', description: 'PSPCL, PSTCL, and Departmental Boards for LDC, JE, and Lineman roles.', iconUrl: 'https://picsum.photos/seed/pspcl/200/200' },
    { id: 'highcourt', abbreviation: 'High Court', name: 'Punjab & Haryana High Court', description: 'Judicial clerical (SSSC) and stenographer recruitment.', iconUrl: 'https://picsum.photos/seed/court/200/200' },
  ];
  for (const b of boards) await setDoc(doc(db, 'boards', b.id), b);

  // 2. Comprehensive Subject Matrix (Common vs Specialized)
  const subjects = [
    // The Common Base (EVERY Punjab Exam)
    { id: 'punjabi-qualifying', name: 'Mandatory Punjabi (Qualifying)', description: 'Part-A: 50-mark matric level standard exam (Sikh Gurus, Grammar, Idioms).' },
    { id: 'punjab-history', name: 'Punjab History & Culture', description: 'History from Sikh Gurus to Modern Freedom Movements.' },
    { id: 'gk-ca', name: 'General Knowledge & CA', description: 'National/International Current Affairs, Polity, and Science.' },
    { id: 'reasoning', name: 'Logical Reasoning & Mental Ability', description: 'Patterns, Puzzles, Coding-Decoding, and Blood Relations.' },
    { id: 'math', name: 'Numerical Ability (Math)', description: 'Percentage, DI, Profit & Loss, Ratio, and Time & Work.' },
    { id: 'ict', name: 'ICT (Computers)', description: 'Basics of MS Office, Internet, Email, and Networking.' },
    { id: 'english', name: 'General English', description: 'Grammar, Error Spotting, Synonyms, and Idioms.' },
    
    // Post-Specific Differences
    { id: 'cdp', name: 'Child Development & Pedagogy (CDP)', description: 'Psychology of teaching and child behavior for Teaching exams.' },
    { id: 'accounts', name: 'Financial Accounting', description: 'Commerce concepts for Junior Auditor and Accounts Clerk.' },
    { id: 'auditing', name: 'Auditing Laws', description: 'Specialized audit procedures for PSSSB Auditor roles.' },
    { id: 'police-laws', name: 'Police Laws & Digital Literacy', description: 'Basic law and digital forensic awareness for Police SI/Constable.' },
    { id: 'civil-eng', name: 'Civil Engineering', description: 'Technical subjects for JE/SDE (Civil) posts.' },
    { id: 'electrical-eng', name: 'Electrical Engineering', description: 'Technical subjects for JE/SDE (Electrical) posts.' },
    { id: 'mechanical-eng', name: 'Mechanical Engineering', description: 'Technical subjects for JE/SDE (Mechanical) posts.' },
    { id: 'science-school', name: 'General Science (High School)', description: 'Science syllabus for ETT and Master Cadre.' },
    { id: 'ss-school', name: 'Social Studies (High School)', description: 'Social Studies syllabus for ETT and Master Cadre.' },
    { id: 'hindi', name: 'Hindi Language', description: 'Hindi grammar and literature for ETT/Teaching exams.' },
  ];
  for (const s of subjects) await setDoc(doc(db, 'subjects', s.id), s);

  // 3. Official Exams (Structured by Boards)
  const exams = [
    // PSSSB (Non-Gazetted)
    { id: 'psssb-clerk', boardId: 'psssb', name: 'PSSSB Clerk (General/IT/Accounts)', category: 'Clerical', totalMocks: 60, activeQuestions: 2500, duration: 120 },
    { id: 'psssb-sa', boardId: 'psssb', name: 'Senior Assistant cum Inspector', category: 'Executive', totalMocks: 30, activeQuestions: 1500, duration: 120 },
    { id: 'psssb-excise', boardId: 'psssb', name: 'Excise & Taxation Inspector', category: 'Inspector', totalMocks: 25, activeQuestions: 1200, duration: 120 },
    { id: 'psssb-auditor', boardId: 'psssb', name: 'Junior Auditor / Audit Inspector', category: 'Finance', totalMocks: 20, activeQuestions: 1000, duration: 120 },
    { id: 'psssb-warder', boardId: 'psssb', name: 'Jail Warder & Matron', category: 'Security', totalMocks: 15, activeQuestions: 800, duration: 120 },
    { id: 'psssb-naib', boardId: 'psssb', name: 'Naib Tehsildar', category: 'Revenue', totalMocks: 10, activeQuestions: 1200, duration: 120 },
    { id: 'psssb-steno', boardId: 'psssb', name: 'Steno-Typist / Junior Scale Stenographer', category: 'Clerical', totalMocks: 10, activeQuestions: 500, duration: 120 },
    { id: 'psssb-je', boardId: 'psssb', name: 'PSSSB Junior Engineer (JE)', category: 'Technical', totalMocks: 15, activeQuestions: 1000, duration: 120 },
    { id: 'psssb-field', boardId: 'psssb', name: 'Technical / Field Posts (Librarian/Storekeeper)', category: 'Technical', totalMocks: 10, activeQuestions: 600, duration: 120 },
    { id: 'psssb-group-d', boardId: 'psssb', name: 'PSSSB Group D (Sewadar/Chowkidar)', category: 'Support', totalMocks: 20, activeQuestions: 1000, duration: 120 },
    
    // PPSC (Gazetted)
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'Punjab Civil Services (PCS)', category: 'Administrative', totalMocks: 20, activeQuestions: 5000, duration: 120 },
    { id: 'ppsc-sde', boardId: 'ppsc', name: 'Sub Divisional Engineer (SDE)', category: 'Technical', totalMocks: 10, activeQuestions: 1500, duration: 120 },
    { id: 'ppsc-manager', boardId: 'ppsc', name: 'Functional Manager / District Controller', category: 'Management', totalMocks: 10, activeQuestions: 800, duration: 120 },
    { id: 'ppsc-so', boardId: 'ppsc', name: 'Section Officer (SO) / Treasury Officer', category: 'Finance', totalMocks: 12, activeQuestions: 900, duration: 120 },
    { id: 'ppsc-prof', boardId: 'ppsc', name: 'Assistant Professor / Principal', category: 'Education', totalMocks: 8, activeQuestions: 1200, duration: 120 },
    
    // Punjab Police
    { id: 'police-constable', boardId: 'police', name: 'Police Constable (Dist & Armed)', category: 'Police', totalMocks: 50, activeQuestions: 3000, duration: 120 },
    { id: 'police-si', boardId: 'police', name: 'Police Sub-Inspector (SI)', category: 'Police', totalMocks: 35, activeQuestions: 2500, duration: 120 },
    { id: 'police-hc', boardId: 'police', name: 'Head Constable / ASI', category: 'Police', totalMocks: 20, activeQuestions: 1500, duration: 120 },
    { id: 'police-tss', boardId: 'police', name: 'Technical Support Services (TSS)', category: 'Police', totalMocks: 10, activeQuestions: 1000, duration: 120 },
    
    // Education & Teaching
    { id: 'pstet-1', boardId: 'education', name: 'PSTET Paper 1 (Primary)', category: 'Teaching', totalMocks: 30, activeQuestions: 2000, duration: 150 },
    { id: 'pstet-2', boardId: 'education', name: 'PSTET Paper 2 (Upper Primary)', category: 'Teaching', totalMocks: 30, activeQuestions: 2000, duration: 150 },
    { id: 'ctet-1', boardId: 'education', name: 'CTET Paper 1 (Primary)', category: 'Teaching', totalMocks: 30, activeQuestions: 2000, duration: 150 },
    { id: 'ctet-2', boardId: 'education', name: 'CTET Paper 2 (Upper Primary)', category: 'Teaching', totalMocks: 30, activeQuestions: 2000, duration: 150 },
    { id: 'ett-cadre', boardId: 'education', name: 'ETT Cadre Recruitment', category: 'Teaching', totalMocks: 40, activeQuestions: 3500, duration: 120 },
    { id: 'master-cadre', boardId: 'education', name: 'Master Cadre (TGT)', category: 'Teaching', totalMocks: 50, activeQuestions: 4000, duration: 150 },
    { id: 'lecturer-cadre', boardId: 'education', name: 'Lecturer Cadre (PGT)', category: 'Teaching', totalMocks: 20, activeQuestions: 3000, duration: 150 },
    { id: 'anganwadi-ntt', boardId: 'education', name: 'Punjab Anganwadi / NTT', category: 'Teaching', totalMocks: 15, activeQuestions: 800, duration: 120 },

    // Technical / Autonomous
    { id: 'pspcl-ldc', boardId: 'technical', name: 'PSPCL Lower Division Clerk', category: 'Clerical', totalMocks: 15, activeQuestions: 1200, duration: 120 },
    { id: 'pspcl-je', boardId: 'technical', name: 'PSPCL Junior Engineer', category: 'Technical', totalMocks: 10, activeQuestions: 1500, duration: 120 },
    { id: 'pspcl-lineman', boardId: 'technical', name: 'ALM / Lineman Recruitment', category: 'Technical', totalMocks: 10, activeQuestions: 500, duration: 120 },

    // High Court
    { id: 'hc-clerk', boardId: 'highcourt', name: 'High Court Clerk (SSSC)', category: 'Judicial', totalMocks: 25, activeQuestions: 1200, duration: 120 },
  ];
  for (const e of exams) await setDoc(doc(db, 'exams', e.id), e);

  // 4. Final Platform Settings Initialization
  await setDoc(doc(db, 'settings', 'global'), {
    platformName: "Cracklix",
    announcement: "🔥 Punjab 2026 Recruitment Calendar Live. Check Official Hubs.",
    showAnnouncement: true,
    heroLine1: "Prepare Smarter.",
    heroLine2: "Score Higher.",
    heroDescription: "The absolute common base and post-specific preparation hub for PSSSB, PPSC, and Punjab Police exams.",
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('Institutional Seed Complete. Full Punjab Recruitment Hierarchy Live.');
}
