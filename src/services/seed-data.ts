import { Firestore, doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Engine for Cracklix.
 * Populates all 13 core collections with verified sample data to initialize the production structure.
 */
export async function seedInitialData(db: Firestore) {
  console.log('Initializing Global Repository Sync...');

  // 1. Boards
  const boards = [
    { id: 'psssb', name: 'Punjab Subordinate Services Selection Board', abbreviation: 'PSSSB', description: 'Group B & C recruitment board.', iconUrl: 'https://picsum.photos/seed/psssb/200/200' },
    { id: 'ppsc', name: 'Punjab Public Service Commission', abbreviation: 'PPSC', description: 'Gazetted Class-I and II recruitment.', iconUrl: 'https://picsum.photos/seed/ppsc/200/200' },
  ];
  for (const b of boards) await setDoc(doc(db, 'boards', b.id), b);

  // 2. Subjects
  const subjects = [
    { id: 'punjab-gk', name: 'Punjab GK', description: 'History and Culture of Punjab.' },
    { id: 'quant', name: 'Quantitative Aptitude', description: 'Mathematical ability.' },
    { id: 'punjabi-lang', name: 'Punjabi Language', description: 'Qualifying section.' },
    { id: 'reasoning', name: 'Reasoning', description: 'Logical and analytical ability.' },
    { id: 'computer', name: 'Computer Basics', description: 'IT and digital awareness.' },
  ];
  for (const s of subjects) await setDoc(doc(db, 'subjects', s.id), s);

  // 3. Exams
  const exams = [
    { 
      id: 'psssb-patwari', 
      boardId: 'psssb', 
      name: 'Revenue Patwari', 
      category: 'Revenue', 
      description: 'Major state recruitment for revenue department.',
      totalMocks: 45,
      activeQuestions: 1200,
      duration: 120
    },
    { 
      id: 'police-si', 
      boardId: 'police', 
      name: 'Sub-Inspector', 
      category: 'Police', 
      description: 'District and Armed Cadre SI recruitment.',
      totalMocks: 30,
      activeQuestions: 3000,
      duration: 120
    },
  ];
  for (const e of exams) await setDoc(doc(db, 'exams', e.id), e);

  // 4. Questions
  const questions = [
    {
      id: 'q-seed-1',
      boardId: 'psssb',
      examId: 'psssb-patwari',
      subjectId: 'punjab-gk',
      difficulty: 'easy',
      questionEn: 'Which city is the capital of Punjab?',
      questionPa: 'ਪੰਜਾਬ ਦੀ ਰਾਜਧਾਨੀ ਕਿਹੜੀ ਹੈ?',
      optionAEn: 'Ludhiana', optionAPa: 'ਲੁਧਿਆਣਾ',
      optionBEn: 'Chandigarh', optionBPa: 'ਚੰਡੀਗੜ੍ਹ',
      optionCEn: 'Amritsar', optionCPa: 'ਅੰਮ੍ਰਿਤਸਰ',
      optionDEn: 'Patiala', optionDPa: 'ਪਟਿਆਲਾ',
      correctAnswer: 'B',
      explanationEn: 'Chandigarh is the joint capital of Punjab and Haryana.',
      createdAt: serverTimestamp(),
      author: 'Arsh Grewal'
    }
  ];
  for (const q of questions) await setDoc(doc(db, 'questions', q.id), q);

  // 5. Mocks
  const mocks = [
    {
      id: 'mock-seed-1',
      title: 'Patwari Mini Mock 01',
      boardId: 'psssb',
      examId: 'psssb-patwari',
      mockType: 'FULL',
      duration: 10,
      totalQuestions: 1,
      questionIds: ['q-seed-1'],
      difficulty: 'Easy',
      published: true,
      createdAt: serverTimestamp()
    }
  ];
  for (const m of mocks) await setDoc(doc(db, 'mocks', m.id), m);

  // 6. Current Affairs
  const ca = [
    {
      id: 'ca-seed-1',
      title: 'Punjab Solar Policy 2026',
      summary: 'New initiative to boost green energy in agricultural sectors.',
      content: 'The Cabinet has approved 500MW solar pump installations...',
      category: 'Punjab',
      date: '28 Oct 2026',
      createdAt: serverTimestamp()
    }
  ];
  for (const article of ca) await setDoc(doc(db, 'current_affairs', article.id), article);

  // 7. Notifications
  const notifications = [
    { 
      id: 'notif-seed-1', 
      title: 'PSSSB Result Declared', 
      message: 'Patwari 2025 Final List is now live.', 
      category: 'Result', 
      board: 'PSSSB', 
      time: '10m ago', 
      important: true, 
      createdAt: serverTimestamp() 
    }
  ];
  for (const n of notifications) await setDoc(doc(db, 'notifications', n.id), n);

  // 8. PYQs
  const pyqs = [
    {
      id: 'pyq-seed-1',
      title: 'Patwari 2023 Official Paper',
      examId: 'psssb-patwari',
      boardId: 'psssb',
      year: 2023,
      pdfUrl: '#',
      createdAt: serverTimestamp()
    }
  ];
  for (const p of pyqs) await setDoc(doc(db, 'pyqs', p.id), p);

  // 9. Results (Sample for Analytics)
  const results = [
    {
      userId: 'system-test',
      mockId: 'mock-seed-1',
      mockTitle: 'Patwari Mini Mock 01',
      score: 1,
      accuracy: 100,
      totalQuestions: 1,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    }
  ];
  for (const r of results) await addDoc(collection(db, 'results'), r);

  // 10. Bookmarks
  const bookmarks = [
    {
      userId: 'system-test',
      questionId: 'q-seed-1',
      questionText: 'Which city is the capital of Punjab?',
      subject: 'Punjab GK',
      timestamp: new Date().toISOString()
    }
  ];
  for (const b of bookmarks) await addDoc(collection(db, 'bookmarks'), b);

  // 11. Test Sessions
  await setDoc(doc(db, 'test_sessions', 'system-test_mock-seed-1'), {
    userId: 'system-test',
    mockId: 'mock-seed-1',
    status: 'SUBMITTED',
    updatedAt: serverTimestamp()
  });

  // 12. Audit Logs
  await addDoc(collection(db, 'audit_logs'), {
    action: 'INITIAL_SEED',
    adminId: 'SYSTEM',
    timestamp: serverTimestamp(),
    details: 'Global repository initialized with 13 collections and verified assets.'
  });

  // 13. Users (Ensuring admin profile exists)
  // This is usually handled during login, but we seed a system check entry
  await setDoc(doc(db, 'users', 'system-node'), {
    name: 'System Audit Node',
    email: 'admin@cracklix.com',
    role: 'ADMIN',
    status: 'Pro',
    createdAt: serverTimestamp()
  });

  console.log('Institutional Seed Complete. All 13 collections initialized.');
}