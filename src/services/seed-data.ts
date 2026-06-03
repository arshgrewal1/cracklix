
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Populates comprehensive patterns for PSSSB, Police, PPSC and PSTET.
 * Restores Clerk, Patwari, VDO and other official verticals.
 */
export async function seedInitialData(db: Firestore) {
  console.log('Initializing Final Structured Punjab Repository Sync...');

  // 1. Official Recruiting Boards
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', description: 'Handles Group B, C, and D non-gazetted positions.', iconUrl: 'https://picsum.photos/seed/psssb/200/200' },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', description: 'Handles Group A and B gazetted administrative posts.', iconUrl: 'https://picsum.photos/seed/ppsc/200/200' },
    { id: 'police', abbreviation: 'Police', name: 'Punjab Police Recruitment Board', description: 'Dedicated law enforcement cadre recruitment.', iconUrl: 'https://picsum.photos/seed/police/200/200' },
    { id: 'education', abbreviation: 'Education', name: 'Punjab Education Department', description: 'Teaching hierarchy including PSTET and Master Cadre.', iconUrl: 'https://picsum.photos/seed/teaching/200/200' },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'Punjab State Power Corporation', description: 'Technical and clerical posts in power sector.', iconUrl: 'https://picsum.photos/seed/pspcl/200/200' },
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

  // 3. Exams Hierarchy
  const exams = [
    { id: 'psssb-clerk', boardId: 'psssb', name: 'PSSSB Clerk (General/IT/Accounts)', category: 'Clerical', totalMocks: 60, activeQuestions: 2500, description: "Multi-departmental recruitment with Paper A focus." },
    { id: 'psssb-patwari', boardId: 'psssb', name: 'Revenue Patwari', category: 'Revenue', totalMocks: 45, activeQuestions: 1800, description: "Official Canal & Revenue Patwari recruitment portal." },
    { id: 'psssb-excise', boardId: 'psssb', name: 'Excise & Taxation Inspector', category: 'Inspector', totalMocks: 25, activeQuestions: 1200, description: "High-grade technical & non-technical inspection posts." },
    { id: 'psssb-vdo', boardId: 'psssb', name: 'VDO / Gram Sevak', category: 'Development', totalMocks: 30, activeQuestions: 1500, description: "Village Development Officer recruitment cycle." },
    { id: 'psssb-jail-warder', boardId: 'psssb', name: 'Jail Warder & Matron', category: 'Police', totalMocks: 35, activeQuestions: 2000, description: "Prison department law enforcement nodes." },
    { id: 'psssb-sr-asst', boardId: 'psssb', name: 'Senior Assistant cum Inspector', category: 'Administrative', totalMocks: 20, activeQuestions: 1000, description: "Group B administrative recruitment." },
    { id: 'ppsc-pcs', boardId: 'ppsc', name: 'PPSC Civil Services (PCS)', category: 'Executive', totalMocks: 15, activeQuestions: 5000, description: "Class A Gazetted administrative posts." },
    { id: 'ppsc-naib', boardId: 'ppsc', name: 'Naib Tehsildar', category: 'Revenue', totalMocks: 10, activeQuestions: 1200, description: "Executive revenue authority recruitment." },
    { id: 'police-constable', boardId: 'police', name: 'Police Constable', category: 'Police', totalMocks: 50, activeQuestions: 3000, description: "District and Armed cadre law enforcement." },
    { id: 'police-si', boardId: 'police', name: 'Police Sub-Inspector', category: 'Police', totalMocks: 30, activeQuestions: 2500, description: "Executive cadre leadership posts." },
    { id: 'pstet-1', boardId: 'education', name: 'PSTET Paper 1 (ETT)', category: 'Teaching', totalMocks: 30, activeQuestions: 2000, description: "Primary teacher eligibility node." },
    { id: 'pstet-2', boardId: 'education', name: 'PSTET Paper 2 (B.Ed)', category: 'Teaching', totalMocks: 30, activeQuestions: 2000, description: "Upper primary teacher eligibility node." },
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
        { name: 'GK & Current Affairs', count: 25, subjectId: 'gk-ca' },
        { name: 'Reasoning & Mental Ability', count: 25, subjectId: 'reasoning' },
        { name: 'ICT (Computers)', count: 25, subjectId: 'ict' },
        { name: 'General English', count: 25, subjectId: 'english' }
      ]
    },
    {
      id: 'pattern-psssb-patwari',
      examId: 'psssb-patwari',
      examName: 'Revenue Patwari',
      totalQuestions: 150,
      duration: 120,
      negativeMarking: true,
      sections: [
        { name: 'Paper A: Punjabi Qualifying', count: 50, subjectId: 'punjabi-qualifying' },
        { name: 'General Knowledge', count: 25, subjectId: 'gk-ca' },
        { name: 'Reasoning & Mental Ability', count: 25, subjectId: 'reasoning' },
        { name: 'ICT (Computers)', count: 25, subjectId: 'ict' },
        { name: 'General English', count: 25, subjectId: 'english' }
      ]
    },
    {
      id: 'pattern-psssb-vdo',
      examId: 'psssb-vdo',
      examName: 'VDO',
      totalQuestions: 150,
      duration: 120,
      negativeMarking: true,
      sections: [
        { name: 'Paper A: Punjabi Qualifying', count: 50, subjectId: 'punjabi-qualifying' },
        { name: 'GS & Current Affairs', count: 25, subjectId: 'gk-ca' },
        { name: 'Reasoning', count: 25, subjectId: 'reasoning' },
        { name: 'English', count: 25, subjectId: 'english' },
        { name: 'ICT', count: 25, subjectId: 'ict' }
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
      id: 'pattern-ppsc-pcs',
      examId: 'ppsc-pcs',
      examName: 'PPSC PCS',
      totalQuestions: 170,
      duration: 120,
      negativeMarking: true,
      sections: [
        { name: 'History', count: 20, subjectId: 'gk-ca' },
        { name: 'Geography', count: 20, subjectId: 'gk-ca' },
        { name: 'Polity', count: 20, subjectId: 'gk-ca' },
        { name: 'Economy', count: 20, subjectId: 'gk-ca' },
        { name: 'Science', count: 20, subjectId: 'gk-ca' },
        { name: 'Current Affairs', count: 20, subjectId: 'gk-ca' },
        { name: 'Reasoning', count: 15, subjectId: 'reasoning' },
        { name: 'Math', count: 15, subjectId: 'math' },
        { name: 'English', count: 10, subjectId: 'english' },
        { name: 'Punjabi', count: 10, subjectId: 'punjabi-qualifying' }
      ]
    }
  ];
  for (const p of patterns) await setDoc(doc(db, 'exam_patterns', p.id), p);

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
