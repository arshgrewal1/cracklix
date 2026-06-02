
import { Firestore, doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine for Cracklix.
 * Populates the repository with the official Punjab Government Exam Hierarchy.
 */
export async function seedInitialData(db: Firestore) {
  console.log('Initializing Structured Punjab Repository Sync...');

  // 1. Official Recruiting Boards
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', description: 'Handles Group B, C, and D non-gazetted positions.', iconUrl: 'https://picsum.photos/seed/psssb/200/200' },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', description: 'Handles Group A and B gazetted administrative posts.', iconUrl: 'https://picsum.photos/seed/ppsc/200/200' },
    { id: 'police', abbreviation: 'Police', name: 'Punjab Police Recruitment Board', description: 'Dedicated law enforcement cadre recruitment.', iconUrl: 'https://picsum.photos/seed/police/200/200' },
    { id: 'education', abbreviation: 'Education', name: 'Punjab Education Department', description: 'PSTET, Master Cadre, and ETT recruitment.', iconUrl: 'https://picsum.photos/seed/teaching/200/200' },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'PSPCL & PSTCL', description: 'Power Corporation technical and clerical posts.', iconUrl: 'https://picsum.photos/seed/pspcl/200/200' },
    { id: 'highcourt', abbreviation: 'High Court', name: 'High Court Clerk (SSSC)', description: 'Subordinate Courts of Punjab and Haryana.', iconUrl: 'https://picsum.photos/seed/court/200/200' },
  ];
  for (const b of boards) await setDoc(doc(db, 'boards', b.id), b);

  // 2. Core Subjects (Common vs Different)
  const subjects = [
    { id: 'punjabi-qualifying', name: 'Mandatory Punjabi (Qualifying)', description: 'Part-A: 50-mark standard matrix exam.' },
    { id: 'punjab-history', name: 'Punjab History & Culture', description: 'Ancient history to modern freedom movements.' },
    { id: 'gk-ca', name: 'GK & Current Affairs', description: 'National and International strategic news.' },
    { id: 'reasoning', name: 'Logical Reasoning', description: 'Mental ability and patterns.' },
    { id: 'math', name: 'Numerical Ability (Math)', description: 'Arithmetic and Data Interpretation.' },
    { id: 'ict', name: 'ICT (Computers)', description: 'Basics of hardware, software, and networking.' },
    { id: 'english', name: 'General English', description: 'Grammar and vocabulary.' },
    { id: 'cdp', name: 'Child Development (CDP)', description: 'Psychology of teaching and pedagogy.' },
    { id: 'science', name: 'General Science', description: 'High school level science.' },
    { id: 'sst', name: 'Social Studies', description: 'Geography, Civics, and History.' },
  ];
  for (const s of subjects) await setDoc(doc(db, 'subjects', s.id), s);

  // 3. Official Exams (Structured by Boards)
  const exams = [
    // PSSSB
    { id: 'psssb-clerk', boardId: 'psssb', name: 'PSSSB Clerk (General/IT/Accounts)', category: 'Clerical', totalMocks: 60, activeQuestions: 2500, duration: 120 },
    { id: 'psssb-sa', boardId: 'psssb', name: 'Senior Assistant cum Inspector', category: 'Executive', totalMocks: 30, activeQuestions: 1500, duration: 120 },
    { id: 'psssb-excise', boardId: 'psssb', name: 'Excise & Taxation Inspector', category: 'Inspector', totalMocks: 25, activeQuestions: 1200, duration: 120 },
    { id: 'psssb-auditor', boardId: 'psssb', name: 'Junior Auditor / Audit Inspector', category: 'Finance', totalMocks: 20, activeQuestions: 1000, duration: 120 },
    { id: 'psssb-warder', boardId: 'psssb', name: 'Jail Warder & Matron', category: 'Security', totalMocks: 15, activeQuestions: 800, duration: 120 },
    { id: 'psssb-naib', boardId: 'psssb', name: 'Naib Tehsildar', category: 'Revenue', totalMocks: 10, activeQuestions: 1200, duration: 120 },
    
    // PPSC
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'Punjab Civil Services (PCS)', category: 'Administrative', totalMocks: 20, activeQuestions: 5000, duration: 120 },
    { id: 'ppsc-sde', boardId: 'ppsc', name: 'Sub Divisional Engineer (SDE)', category: 'Technical', totalMocks: 10, activeQuestions: 1500, duration: 120 },
    { id: 'ppsc-manager', boardId: 'ppsc', name: 'Functional Manager', category: 'Management', totalMocks: 10, activeQuestions: 800, duration: 120 },
    
    // Police
    { id: 'police-constable', boardId: 'police', name: 'Police Constable', category: 'Police', totalMocks: 50, activeQuestions: 3000, duration: 120 },
    { id: 'police-si', boardId: 'police', name: 'Police Sub-Inspector (SI)', category: 'Police', totalMocks: 35, activeQuestions: 2500, duration: 120 },
    { id: 'police-hc', boardId: 'police', name: 'Head Constable / ASI', category: 'Police', totalMocks: 20, activeQuestions: 1500, duration: 120 },
    
    // Education
    { id: 'pstet-1', boardId: 'education', name: 'PSTET Paper 1 (Classes 1-5)', category: 'Teaching', totalMocks: 30, activeQuestions: 2000, duration: 150 },
    { id: 'pstet-2', boardId: 'education', name: 'PSTET Paper 2 (Classes 6-8)', category: 'Teaching', totalMocks: 30, activeQuestions: 2000, duration: 150 },
    { id: 'ett-cadre', boardId: 'education', name: 'ETT Cadre (Primary)', category: 'Teaching', totalMocks: 40, activeQuestions: 3500, duration: 120 },
    { id: 'master-cadre', boardId: 'education', name: 'Master Cadre (TGT)', category: 'Teaching', totalMocks: 50, activeQuestions: 4000, duration: 150 },
    { id: 'lecturer-cadre', boardId: 'education', name: 'Lecturer Cadre (PGT)', category: 'Teaching', totalMocks: 20, activeQuestions: 3000, duration: 150 },

    // High Court
    { id: 'hc-clerk', boardId: 'highcourt', name: 'High Court Clerk', category: 'Judicial', totalMocks: 25, activeQuestions: 1200, duration: 120 },
  ];
  for (const e of exams) await setDoc(doc(db, 'exams', e.id), e);

  // 4. Sample Question
  const questions = [
    {
      id: 'q-seed-1', boardId: 'psssb', examId: 'psssb-clerk', subjectId: 'punjab-history', difficulty: 'easy',
      questionEn: 'Who was the first Guru of Sikhs?',
      questionPa: 'ਸਿੱਖਾਂ ਦੇ ਪਹਿਲੇ ਗੁਰੂ ਕੌਣ ਸਨ?',
      optionAEn: 'Guru Nanak Dev Ji', optionAPa: 'ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ',
      optionBEn: 'Guru Angad Dev Ji', optionBPa: 'ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ',
      optionCEn: 'Guru Arjan Dev Ji', optionCPa: 'ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ',
      optionDEn: 'Guru Gobind Singh Ji', optionDPa: 'ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ',
      correctAnswer: 'A',
      explanationEn: 'Guru Nanak Dev Ji was the founder of Sikhism.',
      createdAt: serverTimestamp(), author: 'Institutional Seed'
    }
  ];
  for (const q of questions) await setDoc(doc(db, 'questions', q.id), q);

  // 5. Settings
  await setDoc(doc(db, 'settings', 'global'), {
    platformName: "Cracklix",
    announcement: "🔥 Punjab 2026 Recruitment Calendar Live",
    showAnnouncement: true,
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('Institutional Seed Complete. Official Punjab Hierarchy Live.');
}
