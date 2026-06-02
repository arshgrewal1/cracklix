import { Exam, Mock, Question, CurrentAffair, Notification } from "@/types";

export const EXAMS: Exam[] = [
  {
    id: "psssb-patwari",
    name: "PSSSB Patwari",
    description: "Revenue Patwari, Canal Patwari and Ziladar recruitment for Punjab.",
    category: "Clerk",
    thumbnail: "exam-psssb",
    totalMocks: 45,
    activeQuestions: 1200,
    totalQuestions: 120,
    duration: 120
  },
  {
    id: "police-si",
    name: "Punjab Police Sub-Inspector",
    description: "District, Armed and Investigation cadre preparation.",
    category: "Police",
    thumbnail: "exam-police",
    totalMocks: 35,
    activeQuestions: 2800,
    totalQuestions: 100,
    duration: 120
  },
  {
    id: "pstet",
    name: "PSTET Teaching",
    description: "Punjab State Teacher Eligibility Test for all levels.",
    category: "Teaching",
    thumbnail: "exam-teaching",
    totalMocks: 50,
    activeQuestions: 3000,
    totalQuestions: 150,
    duration: 150
  },
  {
    id: "coop-bank",
    name: "Cooperative Bank Clerk",
    description: "Banking and computer efficiency tests.",
    category: "Banking",
    thumbnail: "exam-pspcl",
    totalMocks: 30,
    activeQuestions: 2000,
    totalQuestions: 100,
    duration: 120
  }
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    topic: "Punjabi Grammar",
    question: "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਦੀ ਲਿਪੀ ਕਿਹੜੀ ਹੈ?",
    options: ["ਦੇਵਨਾਗਰੀ", "ਗੁਰਮੁਖੀ", "ਰੋਮਨ", "ਸ਼ਾਹਮੁਖੀ"],
    correctAnswer: 1, // ਗੁਰਮੁਖੀ
    difficulty: "Easy",
    explanation: "ਗੁਰਮੁਖੀ ਲਿਪੀ ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਲਿਖਣ ਲਈ ਵਰਤੀ ਜਾਂਦੀ ਹੈ।"
  },
  {
    id: "q2",
    topic: "Punjab GK",
    question: "Which city is known as the 'Steel City' of Punjab?",
    options: ["Ludhiana", "Mandi Gobindgarh", "Jalandhar", "Amritsar"],
    correctAnswer: 1, // Mandi Gobindgarh
    difficulty: "Medium",
    explanation: "Mandi Gobindgarh is famous for its steel industry."
  },
  {
    id: "q3",
    topic: "Reasoning",
    question: "If PUNJAB is coded as QVOKBC, how is POLICE coded?",
    options: ["QPMJDF", "QPMKDF", "QOMJDF", "QPMJDG"],
    correctAnswer: 0, // QPMJDF
    difficulty: "Medium",
    explanation: "Each letter is shifted by one position forward."
  },
  {
    id: "q4",
    topic: "Quant",
    question: "The average of first five multiples of 3 is:",
    options: ["3", "9", "12", "15"],
    correctAnswer: 1, // 9
    difficulty: "Easy",
    explanation: "(3+6+9+12+15)/5 = 9"
  },
  {
    id: "q5",
    topic: "English",
    question: "Select the synonym of 'ABANDON':",
    options: ["Forsake", "Keep", "Cherish", "Adopt"],
    correctAnswer: 0, // Forsake
    difficulty: "Medium",
    explanation: "Abandon and Forsake both mean to leave or desert."
  }
];

export const SAMPLE_MOCK: Mock = {
  id: "mock-punjab-1",
  examId: "psssb-patwari",
  title: "PSSSB Patwari Full Length Mock 01",
  durationInMinutes: 120,
  questions: MOCK_QUESTIONS,
  totalMarks: 100,
  attempts: 1250
};

export const CURRENT_AFFAIRS: CurrentAffair[] = [
  {
    id: "ca1",
    title: "Punjab Cabinet approves new Industrial Policy 2026",
    date: "Oct 24, 2026",
    category: "Policy",
    summary: "The Punjab Cabinet chaired by the CM has approved the new Industrial and Business Development Policy to boost startups."
  }
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Result Declared!",
    message: "Your score for PSSSB Mock 05 is now available.",
    time: "2 hours ago",
    isRead: false,
    type: "result"
  }
];