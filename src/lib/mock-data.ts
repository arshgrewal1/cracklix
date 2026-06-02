import { Exam, Mock, Question, CurrentAffair, Notification } from "@/types";

export const EXAMS: Exam[] = [
  {
    id: "psssb-patwari",
    name: "Revenue Patwari",
    board: "PSSSB",
    description: "Prepare for Revenue Patwari, Canal Patwari and Ziladar recruitment for Punjab Government departments.",
    category: "Revenue",
    thumbnail: "exam-psssb",
    totalMocks: 45,
    activeQuestions: 1200,
    totalQuestions: 120,
    duration: 120
  },
  {
    id: "psssb-clerk",
    name: "Clerk (General/IT/Accounts)",
    board: "PSSSB",
    description: "Multi-departmental clerk recruitment exams with Punjabi qualifying sections.",
    category: "Clerical",
    thumbnail: "exam-psssb",
    totalMocks: 60,
    activeQuestions: 2500,
    totalQuestions: 120,
    duration: 120
  },
  {
    id: "ppsc-pcs",
    name: "Punjab Civil Services (PCS)",
    board: "PPSC",
    description: "Higher Class A & B services including Executive, DSP, and Tehsildar posts.",
    category: "Executive",
    thumbnail: "exam-ppsc",
    totalMocks: 20,
    activeQuestions: 5000,
    totalQuestions: 100,
    duration: 120
  },
  {
    id: "police-constable",
    name: "Punjab Police Constable",
    board: "Punjab Police",
    description: "District and Armed Cadre recruitment for the year 2026.",
    category: "Police",
    thumbnail: "exam-police",
    totalMocks: 50,
    activeQuestions: 3000,
    totalQuestions: 100,
    duration: 120
  },
  {
    id: "pstet",
    name: "PSTET (Paper 1 & 2)",
    board: "Education",
    description: "Punjab State Teacher Eligibility Test for Master Cadre and ETT recruitment.",
    category: "Teaching",
    thumbnail: "exam-teaching",
    totalMocks: 40,
    activeQuestions: 3500,
    totalQuestions: 150,
    duration: 150
  },
  {
    id: "hc-clerk",
    name: "High Court Clerk (SSSC)",
    board: "High Court",
    description: "Clerical recruitment for Subordinate Courts of Punjab and Haryana.",
    category: "Judicial",
    thumbnail: "exam-hc",
    totalMocks: 25,
    activeQuestions: 1200,
    totalQuestions: 100,
    duration: 120
  },
  {
    id: "pspcl-alm",
    name: "Assistant Lineman (ALM)",
    board: "Power Sector",
    description: "Technical recruitment for PSPCL and PSTCL power utilities.",
    category: "Technical",
    thumbnail: "exam-pspcl",
    totalMocks: 20,
    activeQuestions: 1000,
    totalQuestions: 100,
    duration: 120
  },
  {
    id: "coop-bank-clerk",
    name: "Cooperative Bank Clerk",
    board: "Cooperative",
    description: "Management and Data Entry Operator posts for Punjab State Cooperative Banks.",
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
    subject: "Punjabi",
    question: "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਦੀ ਲਿਪੀ ਕਿਹੜੀ ਹੈ?",
    options: ["ਦੇਵਨਾਗਰੀ", "ਗੁਰਮੁਖੀ", "ਰੋਮਨ", "ਸ਼ਾਹਮੁਖੀ"],
    correctAnswer: 1, 
    difficulty: "Easy",
    explanation: "ਗੁਰਮੁਖੀ ਲਿਪੀ ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਲਿਖਣ ਲਈ ਵਰਤੀ ਜਾਂਦੀ ਹੈ।"
  },
  {
    id: "q2",
    topic: "Punjab GK",
    subject: "General Knowledge",
    question: "Which city is known as the 'Steel City' of Punjab?",
    options: ["Ludhiana", "Mandi Gobindgarh", "Jalandhar", "Amritsar"],
    correctAnswer: 1,
    difficulty: "Medium",
    explanation: "Mandi Gobindgarh is famous for its steel industry."
  },
  {
    id: "q3",
    topic: "Reasoning",
    subject: "Aptitude",
    question: "If PUNJAB is coded as QVOKBC, how is POLICE coded?",
    options: ["QPMJDF", "QPMKDF", "QOMJDF", "QPMJDG"],
    correctAnswer: 0,
    difficulty: "Medium",
    explanation: "Each letter is shifted by one position forward."
  },
  {
    id: "q4",
    topic: "History",
    subject: "General Knowledge",
    question: "Who was the first Guru of Sikhs?",
    options: ["Guru Nanak Dev Ji", "Guru Angad Dev Ji", "Guru Arjan Dev Ji", "Guru Gobind Singh Ji"],
    correctAnswer: 0,
    difficulty: "Easy",
    explanation: "Guru Nanak Dev Ji was the founder of Sikhism and the first Guru."
  },
  {
    id: "q5",
    topic: "Punjab GK",
    subject: "General Knowledge",
    question: "Which river is known as the 'Backbone of Punjab'?",
    options: ["Sutlej", "Beas", "Ravi", "Chenab"],
    correctAnswer: 0,
    difficulty: "Easy",
    explanation: "The Sutlej river is the longest of the five rivers that flow through the historic crossroads region of Punjab."
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
    title: "New Wetland Protection Plan for Harike Pattan",
    date: "Oct 22, 2026",
    category: "Environment",
    summary: "A 50-crore conservation project announced to protect migratory birds at Harike Wetland."
  },
  {
    id: "ca3",
    title: "Punjab Police Academy Phillaur wins National Award",
    date: "Oct 20, 2026",
    category: "Achievement",
    summary: "The historic academy at Phillaur was recognized for excellence in training SI and Constable ranks."
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
    message: "Punjab Police SI notification expected in November.",
    time: "5 hours ago",
    isRead: true,
    type: "alert"
  }
];
