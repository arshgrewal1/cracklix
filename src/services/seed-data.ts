import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Restores the complete PSSSB catalog: Clerk, Patwari, VDO, Jail Warder, etc.
 */
export async function seedInitialData(db: Firestore) {
  console.log('Initializing Final Structured Punjab Repository Sync...');

  // 1. Official Recruiting Boards
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', description: 'Handles Group B, C, and D non-gazetted positions.', iconUrl: 'https://picsum.photos/seed/psssb/200/200' },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', description: 'Handles Group A and B gazetted administrative posts.', iconUrl: 'https://picsum.photos/seed/ppsc/200/200' },
    { id: 'police', abbreviation: 'Police', name: 'Punjab Police Recruitment Board', description: 'Dedicated law enforcement cadre recruitment.', iconUrl: 'https://picsum.photos/seed/police/200/200' },
    { id: 'education', abbreviation: 'Education', name: 'Punjab Education Department', description: 'Teaching hierarchy including PSTET and Master Cadre.', iconUrl: 'https://picsum.photos/seed/teaching/200/200' },
  ];
  for (const b of boards) await setDoc(doc(db, 'boards', b.id), b);

  // 2. Comprehensive Subject Matrix
  const subjects = [
    { id: 'punjabi-qualifying', name: 'Mandatory Punjabi (Qualifying)', description: 'Part-A: 50-mark standard exam.' },
    { id: 'punjab-history', name: 'Punjab History & Culture', description: 'Sikh Gurus and State Culture.' },
    { id: 'gk-ca', name: 'General Knowledge & Current Affairs', description: 'Polity, Geography, and News.' },
    { id: 'math-reasoning', name: 'Quantitative Aptitude & Mental Ability', description: 'Arithmetic, Math and Logical Reasoning.' },
    { id: 'ict', name: 'ICT (Computer Basics)', description: 'MS Office and Basics.' },
    { id: 'english', name: 'General English', description: 'Grammar and Vocabulary.' },
  ];
  for (const s of subjects) await setDoc(doc(db, 'subjects', s.id), s);

  // 3. Exams Hierarchy (Expanded PSSSB Catalog)
  const exams = [
    { id: 'psssb-clerk', boardId: 'psssb', name: 'Clerk (General/IT/Accounts)', category: 'Clerical', totalMocks: 60, activeQuestions: 2500, description: "Multi-departmental recruitment with mandatory Paper A focus." },
    { id: 'psssb-patwari', boardId: 'psssb', name: 'Revenue Patwari', category: 'Revenue', totalMocks: 45, activeQuestions: 1800, description: "Official Canal & Revenue Patwari recruitment portal." },
    { id: 'psssb-vdo', boardId: 'psssb', name: 'VDO / Gram Sevak', category: 'Development', totalMocks: 30, activeQuestions: 1500, description: "Village Development Officer recruitment cycle." },
    { id: 'psssb-jail-warder', boardId: 'psssb', name: 'Jail Warder & Matron', category: 'Security', totalMocks: 20, activeQuestions: 1000, description: "Jail department recruitment nodes." },
    { id: 'psssb-excise', boardId: 'psssb', name: 'Excise & Taxation Inspector', category: 'Inspector', totalMocks: 25, activeQuestions: 1200, description: "High-grade technical & non-technical inspection posts." },
    { id: 'police-constable', boardId: 'police', name: 'Police Constable', category: 'Police', totalMocks: 50, activeQuestions: 3000, description: "District and Armed cadre law enforcement." },
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'PPSC Civil Services (PCS)', category: 'Executive', totalMocks: 15, activeQuestions: 5000, description: "Class A Gazetted administrative posts." },
    { id: 'ppsc-naib', boardId: 'ppsc', name: 'Naib Tehsildar', category: 'Revenue', totalMocks: 10, activeQuestions: 1500, description: "Revenue department Class B executive post." },
  ];
  for (const e of exams) await setDoc(doc(db, 'exams', e.id), e);

  // 4. Exam Patterns Blueprints
  const patterns = [
    {
      id: 'pattern-psssb-clerk',
      examId: 'psssb-clerk',
      examName: 'PSSSB Clerk',
      totalQuestions: 150,
      duration: 120,
      negativeMarking: true,
      sections: [
        { name: 'Paper A: Punjabi Qualifying', count: 50, subjectId: 'punjabi-qualifying' },
        { name: 'General Knowledge', count: 25, subjectId: 'gk-ca' },
        { name: 'Quantitative Aptitude', count: 25, subjectId: 'math-reasoning' },
        { name: 'ICT (Computers)', count: 25, subjectId: 'ict' },
        { name: 'General English', count: 25, subjectId: 'english' }
      ]
    },
    {
      id: 'pattern-psssb-patwari',
      examId: 'psssb-patwari',
      examName: 'PSSSB Patwari',
      totalQuestions: 150,
      duration: 120,
      negativeMarking: true,
      sections: [
        { name: 'Paper A: Punjabi Qualifying', count: 50, subjectId: 'punjabi-qualifying' },
        { name: 'Punjab History & Culture', count: 25, subjectId: 'punjab-history' },
        { name: 'General Knowledge', count: 25, subjectId: 'gk-ca' },
        { name: 'Math & Reasoning', count: 25, subjectId: 'math-reasoning' },
        { name: 'English & Computers', count: 25, subjectId: 'ict' }
      ]
    },
  ];
  for (const p of patterns) await setDoc(doc(db, 'exam_patterns', p.id), p);

  // 5. Initial System Config
  await setDoc(doc(db, 'settings', 'global'), {
    platformName: "Cracklix",
    announcement: "🔥 Official Punjab 2026 Recruitment Calendar Live.",
    showAnnouncement: true,
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('Final Institutional Seed Complete.');
}
