import { Exam, MockTest, Question } from "@/types"

/**
 * @fileOverview Mock Data v2.8 - Hardened Types
 * FIXED: Synchronized Exam structure and MockTest relationships to resolve build blockers.
 */

export const EXAMS: Exam[] = [
  {
    id: "psssb-patwari",
    name: "Revenue Patwari",
    boardId: "psssb",
    categoryId: "punjab-government-exams",
    displayOrder: 1,
    description: "Prepare for Revenue Patwari, Canal Patwari and Ziladar recruitment for Punjab Government departments.",
    totalMocks: 45,
    activeQuestions: 1200,
  },
  {
    id: "psssb-clerk",
    name: "Clerk (General/IT/Accounts)",
    boardId: "psssb",
    categoryId: "punjab-government-exams",
    displayOrder: 2,
    description: "Multi-departmental clerk recruitment exams with Punjabi qualifying sections.",
    totalMocks: 60,
    activeQuestions: 2500,
  },
  {
    id: "ppsc-pcs",
    name: "Punjab Civil Services (PCS)",
    boardId: "ppsc",
    categoryId: "punjab-government-exams",
    displayOrder: 3,
    description: "Higher Class A & B services including Executive, DSP, and Tehsildar posts.",
    totalMocks: 20,
    activeQuestions: 5000,
  },
]

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    englishQuestion: "Which language script is used for Punjabi?",
    punjabiQuestion: "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਦੀ ਲਿਪੀ ਕਿਹੜੀ ਹੈ?",
    optionAEnglish: "Devanagari",
    optionAPunjabi: "ਦੇਵਨਾਗਰੀ",
    optionBEnglish: "Gurmukhi",
    optionBPunjabi: "ਗੁਰਮੁਖੀ",
    optionCEnglish: "Roman",
    optionCPunjabi: "ਰੋਮਨ",
    optionDEnglish: "Shahmukhi",
    optionDPunjabi: "ਸ਼ਾਹਮੁਖੀ",
    correctAnswer: "B",
    difficulty: "Easy",
    englishExplanation: "Gurmukhi script is used for writing the Punjabi language.",
    subjectId: "punjabi",
    boardId: "psssb",
    status: "UNUSED",
    usedCount: 0,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "q2",
    englishQuestion: "Which city is known as the 'Steel City' of Punjab?",
    optionAEnglish: "Ludhiana",
    optionBEnglish: "Mandi Gobindgarh",
    optionCEnglish: "Jalandhar",
    optionDEnglish: "Amritsar",
    correctAnswer: "B",
    difficulty: "Medium",
    englishExplanation: "Mandi Gobindgarh is famous for its steel industry.",
    subjectId: "punjab-gk",
    boardId: "psssb",
    status: "UNUSED",
    usedCount: 0,
    createdAt: null,
    updatedAt: null,
  },
]

export const SAMPLE_MOCK: MockTest = {
  id: "mock-punjab-1",
  boardId: "psssb",
  boardIds: ["psssb"],
  examIds: ["psssb-patwari"],
  title: "PSSSB Patwari Full Length Mock 01",
  duration: 120,
  totalMarks: 100,
  totalQuestions: 100,
  negativeMarks: 0.25,
  positiveMarks: 1,
  questionIds: MOCK_QUESTIONS.map((q) => q.id),
  sections: [],
  published: true,
  languageMode: "ENGLISH_PUNJABI",
  attemptLimit: 0,
  createdAt: null,
  updatedAt: null,
  mockType: "FULL",
  accessLevel: "FREE",
}