
import { Firestore, doc, setDoc, serverTimestamp, collection, writeBatch } from 'firebase/firestore';

/**
 * @fileOverview Institutional Punjab-Centric Seeding Node v68.1.
 * UPDATED: Locked permanent logo for Punjab Teaching Exams.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Absolute Punjab Registry Sync...');
  const batch = writeBatch(db);

  // 1. STRATEGIC CATEGORIES
  const categories = [
    {
      id: "punjab-govt",
      title: "Punjab Government Exams",
      description: "Police, PSSSB, PPSC and major state board recruitments.",
      highlight: "STATE LEVEL",
      color: "text-primary",
      bgColor: "bg-orange-50",
      iconUrl: "https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png",
      displayOrder: 1
    },
    {
      id: "punjab-teaching",
      title: "Punjab Teaching Exams",
      description: "PSTET, CTET, Master Cadre, ETT & Lecturer recruitment nodes.",
      highlight: "EDUCATIONAL",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSImf0nQvnFzmw2RVmPBwlZRspEC_fe2x13SGwzIbYBdw&s=10",
      displayOrder: 2
    }
  ];

  for (const cat of categories) {
    batch.set(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. HUBS (Boards)
  const boards = [
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', categoryId: 'punjab-govt', iconUrl: 'https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png', displayOrder: 1 },
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', categoryId: 'punjab-govt', iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg', displayOrder: 2 },
  ];

  for (const b of boards) {
    batch.set(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. SAMPLE QUESTIONS (To ensure count > 0)
  const sampleQs = [
    {
      id: "seed-q-1",
      englishQuestion: "Which river is known as the 'Backbone of Punjab'?",
      punjabiQuestion: "ਪੰਜਾਬ ਦੀ ਰੀੜ੍ਹ ਦੀ ਹੱਡੀ ਕਿਸ ਦਰਿਆ ਨੂੰ ਕਿਹਾ ਜਾਂਦਾ ਹੈ?",
      optionAEnglish: "Sutlej", optionAPunjabi: "ਸਤਲੁਜ",
      optionBEnglish: "Beas", optionBPunjabi: "ਬਿਆਸ",
      optionCEnglish: "Ravi", optionCPunjabi: "ਰਾਵੀ",
      optionDEnglish: "Jhelum", optionDPunjabi: "ਜੇਹਲਮ",
      correctAnswer: "A",
      subjectId: "punjab-gk",
      boardId: "psssb",
      difficulty: "Easy",
      status: "UNUSED"
    },
    {
      id: "seed-q-2",
      englishQuestion: "Who was the first Guru of the Sikhs?",
      punjabiQuestion: "ਸਿੱਖਾਂ ਦੇ ਪਹਿਲੇ ਗੁਰੂ ਕੌਣ ਸਨ?",
      optionAEnglish: "Guru Nanak Dev Ji", optionAPunjabi: "ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ",
      optionBEnglish: "Guru Angad Dev Ji", optionBPunjabi: "ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ",
      optionCEnglish: "Guru Arjan Dev Ji", optionCPunjabi: "ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ",
      optionDEnglish: "Guru Gobind Singh Ji", optionDPunjabi: "ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ",
      correctAnswer: "A",
      subjectId: "history",
      boardId: "punjab-police",
      difficulty: "Easy",
      status: "UNUSED"
    }
  ];

  for (const q of sampleQs) {
    batch.set(doc(db, 'questions', q.id), { ...q, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), usedCount: 0 }, { merge: true });
  }

  // 4. SAMPLE MOCK
  const mockId = "seed-mock-1";
  batch.set(doc(db, 'mocks', mockId), {
    id: mockId,
    title: "Punjab GK Foundation Mock",
    boardId: "psssb",
    boardIds: ["psssb"],
    examIds: ["revenue-patwari"],
    mockType: "FULL",
    accessLevel: "FREE",
    duration: 15,
    totalQuestions: 2,
    questionIds: ["seed-q-1", "seed-q-2"],
    published: true,
    languageMode: "ENGLISH_PUNJABI",
    positiveMarks: 1,
    negativeMarks: 0.25,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  await batch.commit();

  // 5. FINAL STATS SYNC (Initial baseline)
  await setDoc(doc(db, 'settings', 'stats'), {
     totalQuestions: 2,
     totalMocks: 1,
     totalUsers: 1,
     averageAccuracy: 94,
     updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('[AUDIT] Full Punjab Registry Synchronized with Baseline Content.');
}
