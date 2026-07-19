import { Firestore, doc, serverTimestamp, writeBatch, collection, getDocs } from 'firebase/firestore';

/**
 * @fileOverview Official Institutional Registry Blueprint v84.0.
 * UPDATED: Added sample questions for all major subjects (Math, Reasoning, CA, GK, History, ICT).
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
    { id: "current-affairs", abbreviation: "CA Hub", name: "Daily Current Affairs Node", categoryId: "punjab-government-exams", displayOrder: 10 }
  ];

  // 3. CANONICAL EXAMS
  const exams = [
    { id: "pcs", name: "PCS", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "patwari", name: "Patwari", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "constable", name: "Constable", boardId: "punjab-police", categoryId: "punjab-government-exams" }
  ];

  // 4. CANONICAL PASSES (DYNAMIC ACCESS)
  const passes = [
    { id: "free-pass", name: "Aspirant Free", price: 0, durationDays: 365, tier: 0, active: true, displayOrder: 1, features: ["10 Free Mocks", "Basic Analytics"], allowedMocks: [], allowedCategories: [] },
    { id: "monthly-pass", name: "Premium Monthly", price: 299, durationDays: 30, tier: 1, active: true, displayOrder: 2, features: ["All Mock Tests", "Bilingual Support", "AIR Rankings"], allowedMocks: [], allowedCategories: ["ppsc", "psssb", "punjab-police"] },
    { id: "elite-pass", name: "Elite Yearly", price: 999, durationDays: 365, tier: 2, active: true, displayOrder: 3, features: ["Everything in Premium", "Expert Mentorship"], allowedMocks: [], allowedCategories: ["ppsc", "psssb", "punjab-police", "teaching-hub"] }
  ];

  // 5. SAMPLE QUESTIONS ACROSS ALL SUBJECTS
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
      status: "UNUSED",
      usedCount: 0,
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
      status: "UNUSED",
      usedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: "q3",
      englishQuestion: "Who is known as the 'Sher-e-Punjab'?",
      punjabiQuestion: "ਕਿਸਨੂੰ 'ਸ਼ੇਰ-ਏ-ਪੰਜਾਬ' ਵਜੋਂ ਜਾਣਿਆ ਜਾਂਦਾ ਹੈ?",
      optionAEnglish: "Lala Lajpat Rai",
      optionAPunjabi: "ਲਾਲਾ ਲਾਜਪਤ ਰਾਏ",
      optionBEnglish: "Maharaja Ranjit Singh",
      optionBPunjabi: "ਮਹਾਰਾਜਾ ਰਣਜੀਤ ਸਿੰਘ",
      optionCEnglish: "Bhagat Singh",
      optionCPunjabi: "ਭਗਤ ਸਿੰਘ",
      optionDEnglish: "Kartar Singh Sarabha",
      optionDPunjabi: "ਕਰਤਾਰ ਸਿੰਘ ਸਰਾਭਾ",
      correctAnswer: 'B',
      difficulty: "Easy",
      englishExplanation: "Maharaja Ranjit Singh is famously known as Sher-e-Punjab.",
      subjectId: "history",
      boardId: "ppsc",
      status: "UNUSED",
      usedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: "q4",
      englishQuestion: "What is the shortcut key to copy text in Windows?",
      punjabiQuestion: "ਵਿੰਡੋਜ਼ ਵਿੱਚ ਟੈਕਸਟ ਕਾਪੀ ਕਰਨ ਲਈ ਸ਼ਾਰਟਕੱਟ ਕੁੰਜੀ ਕੀ ਹੈ?",
      optionAEnglish: "Ctrl + V",
      optionAPunjabi: "Ctrl + V",
      optionBEnglish: "Ctrl + C",
      optionBPunjabi: "Ctrl + C",
      optionCEnglish: "Ctrl + X",
      optionCPunjabi: "Ctrl + X",
      optionDEnglish: "Ctrl + Z",
      optionDPunjabi: "Ctrl + Z",
      correctAnswer: 'B',
      difficulty: "Easy",
      englishExplanation: "Ctrl + C is used to copy selected content.",
      subjectId: "computer",
      boardId: "psssb",
      status: "UNUSED",
      usedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: "q5",
      englishQuestion: "If 5 + 3 = 28, 9 + 1 = 810, then 8 + 6 = ?",
      optionAEnglish: "214",
      optionBEnglish: "2414",
      optionCEnglish: "142",
      optionDEnglish: "1421",
      correctAnswer: 'B',
      difficulty: "Medium",
      englishExplanation: "Logic: (5-3=2, 5+3=8) -> 28. So (8-6=2, 8+6=14) -> 2414.",
      subjectId: "reasoning",
      boardId: "psssb",
      status: "UNUSED",
      usedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: "q6",
      englishQuestion: "The average of first five prime numbers is:",
      optionAEnglish: "5.6",
      optionBEnglish: "5.8",
      optionCEnglish: "6.0",
      optionDEnglish: "6.2",
      correctAnswer: 'A',
      difficulty: "Medium",
      englishExplanation: "Prime numbers: 2, 3, 5, 7, 11. Sum = 28. Average = 28/5 = 5.6.",
      subjectId: "math",
      boardId: "psssb",
      status: "UNUSED",
      usedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: "q7",
      englishQuestion: "Which state topped the NITI Aayog Export Preparedness Index 2024?",
      optionAEnglish: "Gujarat",
      optionBEnglish: "Tamil Nadu",
      optionCEnglish: "Maharashtra",
      optionDEnglish: "Punjab",
      correctAnswer: 'B',
      difficulty: "Hard",
      englishExplanation: "Tamil Nadu retained its top position in the latest index.",
      subjectId: "current-affairs",
      boardId: "current-affairs",
      status: "UNUSED",
      usedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ];

  // COMMIT
  for (const cat of categories) batch.set(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  for (const b of boards) batch.set(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  for (const e of exams) batch.set(doc(db, 'exams', e.id), { ...e, displayOrder: 1, updatedAt: serverTimestamp() }, { merge: true });
  for (const p of passes) batch.set(doc(db, 'passes', p.id), { ...p, updatedAt: serverTimestamp() }, { merge: true });
  
  // Write to both mcqBank (new) and questions (legacy) for full compatibility
  for (const q of questions) {
    batch.set(doc(db, 'mcqBank', q.id), q, { merge: true });
    batch.set(doc(db, 'questions', q.id), q, { merge: true });
  }

  await batch.commit();
  console.log('[SUCCESS] Institutional Registry Hardened.');
}
