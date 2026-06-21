import { Firestore, doc, serverTimestamp, writeBatch, collection, getDocs } from 'firebase/firestore';

/**
 * @fileOverview Official Institutional Registry Blueprint v75.0.
 * FIXED: Explicit ID mapping for questions to ensure CBT engine sync.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Canonical Registry Hierarchy...');
  const batch = writeBatch(db);

  // 1. CANONICAL CATEGORIES
  const categories = [
    { id: "punjab-government-exams", title: "Punjab Government Exams", description: "State recruitments through PPSC, PSSSB and Punjab Police.", displayOrder: 1 },
    { id: "punjab-teaching-exams", title: "Punjab Teaching Exams", description: "State teacher eligibility and recruitment tests.", displayOrder: 2 },
    { id: "punjab-technical-exams", title: "Punjab Technical Exams", description: "Engineering, medical and technical posts in state departments.", displayOrder: 3 },
    { id: "banking-exams", title: "Banking Exams", description: "Punjab state cooperative and district bank recruitments.", displayOrder: 4 },
    { id: "judiciary-exams", title: "Judiciary Exams", description: "Legal and clerical posts in state and district courts.", displayOrder: 5 },
    { id: "central-government-exams", title: "Central Government Exams", description: "National recruitments through SSC, RRB, IBPS and Defense.", displayOrder: 6 }
  ];

  // 2. CANONICAL BOARDS
  const boards = [
    { id: "ppsc", abbreviation: "PPSC", name: "Punjab Public Service Commission", categoryId: "punjab-government-exams", displayOrder: 1 },
    { id: "psssb", abbreviation: "PSSSB", name: "Punjab Subordinate Services Selection Board", categoryId: "punjab-government-exams", displayOrder: 2 },
    { id: "punjab-police", abbreviation: "Punjab Police", name: "Punjab Police Recruitment", categoryId: "punjab-government-exams", displayOrder: 3 },
    { id: "teaching-hub", abbreviation: "Teaching", name: "Education Recruitment Board", categoryId: "punjab-teaching-exams", displayOrder: 1 },
    { id: "pspcl", abbreviation: "PSPCL", name: "Punjab State Power Corporation Ltd", categoryId: "punjab-technical-exams", displayOrder: 1 },
    { id: "pstcl", abbreviation: "PSTCL", name: "Punjab State Transmission Corporation Ltd", categoryId: "punjab-technical-exams", displayOrder: 2 },
    { id: "bfuhs", abbreviation: "BFUHS", name: "Baba Farid University of Health Sciences", categoryId: "punjab-technical-exams", displayOrder: 3 },
    { id: "banking-hub", abbreviation: "Banking", name: "Punjab State Cooperative Banking Hub", categoryId: "banking-exams", displayOrder: 1 },
    { id: "judiciary-hub", abbreviation: "Judiciary", name: "Punjab Judiciary Hub", categoryId: "judiciary-exams", displayOrder: 1 },
    { id: "ssc", abbreviation: "SSC", name: "Staff Selection Commission", categoryId: "central-government-exams", displayOrder: 1 },
    { id: "rrb", abbreviation: "RRB", name: "Railway Recruitment Board", categoryId: "central-government-exams", displayOrder: 2 },
    { id: "ibps", abbreviation: "IBPS", name: "Institute of Banking Personnel Selection", categoryId: "central-government-exams", displayOrder: 3 },
    { id: "sbi", abbreviation: "SBI", name: "State Bank of India Recruitment", categoryId: "central-government-exams", displayOrder: 4 },
    { id: "defense", abbreviation: "Defense", name: "Indian Defense Hub", categoryId: "central-government-exams", displayOrder: 5 }
  ];

  // 3. CANONICAL EXAMS
  const exams = [
    { id: "pcs", name: "PCS", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "patwari", name: "Patwari", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "constable", name: "Constable", boardId: "punjab-police", categoryId: "punjab-government-exams" },
    { id: "pstet-paper-1", name: "PSTET Paper 1", boardId: "teaching-hub", categoryId: "punjab-teaching-exams" },
    { id: "alm", name: "ALM", boardId: "pspcl", categoryId: "punjab-technical-exams" },
    { id: "ssc-cgl", name: "SSC CGL", boardId: "ssc", categoryId: "central-government-exams" }
  ];

  // 4. SAMPLE QUESTIONS (BILINGUAL REGISTRY NODES)
  const questions = [
    {
      id: "q1",
      englishQuestion: "Which language script is used for Punjabi?",
      punjabiQuestion: "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਦੀ ਲਿਪੀ ਕਿਹੜੀ ਹੈ?",
      optionAEnglish: "Devanagari",
      optionAPunjabi: "ਦੇਵਨਾਗਰੀ",
      optionBEnglish: "Gurmukhi",
      optionBPunjabi: "ਗੁਰਮੁਖੀ",
      optionCEnglish: "Roman",
      optionCPunjabi: "ਰੋਮਨ",
      optionDEnglish: "Shahmukhi",
      optionDPunjabi: "ਸ਼ਾਹਮੁਖੀ",
      correctAnswer: 'B',
      difficulty: "Easy",
      englishExplanation: "Gurmukhi script is used for writing the Punjabi language.",
      punjabiExplanation: "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਲਿਖਣ ਲਈ ਗੁਰਮੁਖੀ ਲਿਪੀ ਦੀ ਵਰਤੋਂ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।",
      subjectId: "punjabi",
      boardId: "psssb",
      status: "USED",
      usedCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: "q2",
      englishQuestion: "Which city is known as the 'Steel City' of Punjab?",
      punjabiQuestion: "ਪੰਜਾਬ ਦੇ ਕਿਸ ਸ਼ਹਿਰ ਨੂੰ 'ਸਟੀਲ ਸਿਟੀ' ਵਜੋਂ ਜਾਣਿਆ ਜਾਂਦਾ ਹੈ?",
      optionAEnglish: "Ludhiana",
      optionAPunjabi: "ਲੁਧਿਆਣਾ",
      optionBEnglish: "Mandi Gobindgarh",
      optionBPunjabi: "ਮੰਡੀ ਗੋਬਿੰਦਗੜ੍ਹ",
      optionCEnglish: "Jalandhar",
      optionCPunjabi: "ਜਲੰਧਰ",
      optionDEnglish: "Amritsar",
      optionDPunjabi: "ਅੰਮ੍ਰਿਤਸਰ",
      correctAnswer: 'B',
      difficulty: "Medium",
      englishExplanation: "Mandi Gobindgarh is famous for its steel industry.",
      punjabiExplanation: "ਮੰਡੀ ਗੋਬਿੰਦਗੜ੍ਹ ਆਪਣੇ ਸਟੀਲ ਉਦਯੋਗ ਲਈ ਮਸ਼ਹੂਰ ਹੈ।",
      subjectId: "punjab-gk",
      boardId: "psssb",
      status: "USED",
      usedCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ];

  // 5. SAMPLE MOCK
  const sampleMock = {
    id: "sample-mock-1",
    title: "Punjab General Knowledge - Mock 01",
    boardId: "psssb",
    boardIds: ["psssb"],
    examIds: ["patwari"],
    mockType: "FULL",
    accessLevel: "FREE",
    duration: 15,
    totalQuestions: 2,
    totalMarks: 2,
    negativeMarks: 0.25,
    positiveMarks: 1,
    questionIds: ["q1", "q2"],
    published: true,
    languageMode: "ENGLISH_PUNJABI",
    updatedAt: serverTimestamp()
  };

  // COMMIT
  for (const cat of categories) batch.set(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  for (const b of boards) batch.set(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  for (const e of exams) batch.set(doc(db, 'exams', e.id), { ...e, displayOrder: 1, updatedAt: serverTimestamp() }, { merge: true });
  for (const q of questions) batch.set(doc(db, 'questions', q.id), q, { merge: true });
  batch.set(doc(db, 'mocks', sampleMock.id), sampleMock, { merge: true });

  await batch.commit();
  console.log('[SUCCESS] Institutional Registry Hardened with Sample Nodes.');
}
