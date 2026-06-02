import { Exam, Mock, Question, CurrentAffair, Notification } from "@/types";

export const EXAMS: Exam[] = [
  {
    id: "psssb-patwari",
    title: "PSSSB Patwari",
    description: "Revenue Patwari, Canal Patwari and Zilladar exams for Punjab state.",
    category: "PSSSB",
    thumbnail: "exam-psssb",
    totalMocks: 45,
    activeQuestions: 1200
  },
  {
    id: "punjab-police-si",
    title: "Punjab Police SI",
    description: "Recruitment for Sub Inspectors in District, Armed and Intelligence cadres.",
    category: "Punjab Police",
    thumbnail: "exam-police",
    totalMocks: 30,
    activeQuestions: 2500
  },
  {
    id: "ppsc-pcs",
    title: "PPSC PCS",
    description: "Punjab Civil Services - Executive and Allied services recruitment.",
    category: "PPSC",
    thumbnail: "exam-ppsc",
    totalMocks: 12,
    activeQuestions: 5000
  },
  {
    id: "pstet",
    title: "PSTET Paper 1 & 2",
    description: "Punjab State Teacher Eligibility Test for primary and upper primary levels.",
    category: "Teaching Exams",
    thumbnail: "exam-teaching",
    totalMocks: 25,
    activeQuestions: 1800
  },
  {
    id: "pspcl-ldc",
    title: "PSPCL LDC & Clerk",
    description: "Lower Division Clerk and Junior Engineer positions in Punjab State Power Corporation.",
    category: "PSPCL & PSTCL",
    thumbnail: "exam-pspcl",
    totalMocks: 20,
    activeQuestions: 1500
  },
  {
    id: "hc-clerk",
    title: "High Court Clerk",
    description: "Recruitment for Clerks in Subordinate Courts of Punjab and Haryana.",
    category: "High Court",
    thumbnail: "exam-hc",
    totalMocks: 15,
    activeQuestions: 900
  },
  {
    id: "bfuhs-nurse",
    title: "BFUHS Staff Nurse",
    description: "Medical recruitment for Staff Nurses, Pharmacists and MLT roles.",
    category: "BFUHS",
    thumbnail: "exam-teaching", // Using placeholder for now
    totalMocks: 18,
    activeQuestions: 2200
  },
  {
    id: "coop-bank",
    title: "Cooperative Bank Clerk",
    description: "Banking recruitment for Cooperative Banks, MARKFED and Milkfed.",
    category: "Banking & Cooperative",
    thumbnail: "exam-pspcl", // Using placeholder for now
    totalMocks: 22,
    activeQuestions: 3000
  }
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    subject: "Punjabi Grammar",
    text: "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਦੀ ਲਿਪੀ ਕਿਹੜੀ ਹੈ?",
    options: ["ਦੇਵਨਾਗਰੀ", "ਗੁਰਮੁਖੀ", "ਰੋਮਨ", "ਸ਼ਾਹਮੁਖੀ"],
    correctAnswer: "ਗੁਰਮੁਖੀ",
    difficulty: "Easy"
  },
  {
    id: "q2",
    subject: "Punjab GK",
    text: "Which city is known as the 'Steel City' of Punjab?",
    options: ["Ludhiana", "Mandi Gobindgarh", "Jalandhar", "Amritsar"],
    correctAnswer: "Mandi Gobindgarh",
    difficulty: "Medium"
  },
  {
    id: "q3",
    subject: "Reasoning",
    text: "If PUNJAB is coded as QVOKBC, how is POLICE coded?",
    options: ["QPMJDF", "QPMKDF", "QOMJDF", "QPMJDG"],
    correctAnswer: "QPMJDF",
    difficulty: "Medium"
  },
  {
    id: "q4",
    subject: "Quant",
    text: "The average of first five multiples of 3 is:",
    options: ["3", "9", "12", "15"],
    correctAnswer: "9",
    difficulty: "Easy"
  },
  {
    id: "q5",
    subject: "English",
    text: "Select the synonym of 'ABANDON':",
    options: ["Forsake", "Keep", "Cherish", "Adopt"],
    correctAnswer: "Forsake",
    difficulty: "Medium"
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
  },
  {
    id: "ca2",
    title: "Kila Raipur Sports Festival dates announced",
    date: "Oct 22, 2026",
    category: "Culture",
    summary: "The 'Rural Olympics' of Punjab are set to begin from February next year with traditional sports events."
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
  },
  {
    id: "n2",
    title: "New Exam Alert",
    message: "Punjab Police Constable recruitment 2027 notification expected soon.",
    time: "5 hours ago",
    isRead: true,
    type: "alert"
  }
];
