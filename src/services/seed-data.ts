
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Populates patterns for PSSSB, Police, PPSC and PSTET.
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
    { id: 'punjabi-qualifying', name: 'Mandatory Punjabi', description: 'Part-A: 50-mark standard exam.' },
    { id: 'punjab-history', name: 'Punjab History & Culture', description: 'Sikh Gurus and State Culture.' },
    { id: 'gk-ca', name: 'GK & Current Affairs', description: 'Polity, Geography, and News.' },
    { id: 'reasoning', name: 'Mental Ability', description: 'Puzzles and Patterns.' },
    { id: 'math', name: 'Numerical Ability', description: 'Arithmetic and Quant.' },
    { id: 'ict', name: 'ICT (Computers)', description: 'MS Office and Basics.' },
    { id: 'english', name: 'General English', description: 'Grammar and Vocabulary.' },
    { id: 'cdp', name: 'Child Development', description: 'CDP for Teaching exams.' },
  ];
  for (const s of subjects) await setDoc(doc(db, 'subjects', s.id), s);

  // 3. Exam Patterns Blueprints
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
        { name: 'GK & Current Affairs', count: 25, subjectId: 'gk-ca' },
        { name: 'Reasoning & Mental Ability', count: 25, subjectId: 'reasoning' },
        { name: 'ICT (Computers)', count: 25, subjectId: 'ict' },
        { name: 'General English', count: 25, subjectId: 'english' }
      ]
    },
    {
      id: 'pattern-psssb-excise',
      examId: 'psssb-excise',
      examName: 'PSSSB Excise Inspector',
      totalQuestions: 150,
      duration: 120,
      negativeMarking: true,
      sections: [
        { name: 'Paper A: Punjabi Qualifying', count: 50, subjectId: 'punjabi-qualifying' },
        { name: 'Punjab GK', count: 20, subjectId: 'punjab-history' },
        { name: 'Polity & CA', count: 20, subjectId: 'gk-ca' },
        { name: 'Arithmetic & Quant', count: 20, subjectId: 'math' },
        { name: 'Reasoning', count: 20, subjectId: 'reasoning' },
        { name: 'English', count: 10, subjectId: 'english' },
        { name: 'Computer', count: 10, subjectId: 'ict' }
      ]
    },
    {
      id: 'pattern-police-constable',
      examId: 'police-constable',
      examName: 'Punjab Police Constable',
      totalQuestions: 100,
      duration: 120,
      negativeMarking: false,
      sections: [
        { name: 'Punjab GK', count: 25, subjectId: 'punjab-history' },
        { name: 'Reasoning', count: 25, subjectId: 'reasoning' },
        { name: 'Numerical Ability', count: 25, subjectId: 'math' },
        { name: 'General English', count: 25, subjectId: 'english' }
      ]
    },
    {
      id: 'pattern-pstet-1',
      examId: 'pstet-1',
      examName: 'PSTET Paper 1',
      totalQuestions: 150,
      duration: 150,
      negativeMarking: false,
      sections: [
        { name: 'Child Development & Pedagogy', count: 30, subjectId: 'cdp' },
        { name: 'Language I (Punjabi)', count: 30, subjectId: 'punjabi-qualifying' },
        { name: 'Language II (English)', count: 30, subjectId: 'english' },
        { name: 'Mathematics', count: 30, subjectId: 'math' },
        { name: 'Environmental Studies', count: 30, subjectId: 'gk-ca' }
      ]
    }
  ];
  for (const p of patterns) await setDoc(doc(db, 'exam_patterns', p.id), p);

  // 4. Exams Hierarchy
  const exams = [
    { id: 'psssb-clerk', boardId: 'psssb', name: 'PSSSB Clerk', category: 'Clerical', totalMocks: 60, activeQuestions: 2500 },
    { id: 'psssb-excise', boardId: 'psssb', name: 'Excise & Taxation Inspector', category: 'Inspector', totalMocks: 25, activeQuestions: 1200 },
    { id: 'police-constable', boardId: 'police', name: 'Police Constable', category: 'Police', totalMocks: 50, activeQuestions: 3000 },
    { id: 'pstet-1', boardId: 'education', name: 'PSTET Paper 1', category: 'Teaching', totalMocks: 30, activeQuestions: 2000 },
  ];
  for (const e of exams) await setDoc(doc(db, 'exams', e.id), e);

  // 5. Initial System Config
  await setDoc(doc(db, 'settings', 'global'), {
    platformName: "Cracklix",
    announcement: "🔥 Official Punjab 2026 Recruitment Calendar Live.",
    showAnnouncement: true,
    heroLine1: "Prepare Smarter.",
    heroLine2: "Score Higher.",
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('Final Institutional Seed Complete.');
}
