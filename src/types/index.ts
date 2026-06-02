
export type Difficulty = 'easy' | 'medium' | 'hard';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'PYQ';

export interface Board {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  iconUrl?: string;
}

export interface Exam {
  id: string;
  boardId: string;
  name: string;
  category: string;
  description: string;
  totalMocks: number;
  activeQuestions: number;
  duration?: number;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface Question {
  id: string;
  boardId: string;
  examId: string;
  subjectId: string;
  difficulty: Difficulty;
  topic?: string;

  // Bilingual Content
  questionEn: string;
  questionPa: string;

  // Options Mapping - English
  optionAEn: string;
  optionBEn: string;
  optionCEn: string;
  optionDEn: string;

  // Options Mapping - Punjabi
  optionAPa: string;
  optionBPa: string;
  optionCPa: string;
  optionDPa: string;

  correctAnswer: 'A' | 'B' | 'C' | 'D';

  explanationEn: string;
  explanationPa: string;

  createdAt: any;
  author?: string;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  examId: string;
  subjectId?: string;
  mockType: MockType;
  duration: number;
  totalQuestions: number;
  questionIds: string[];
  difficulty: string;
  published: boolean;
  createdAt: any;
  author?: string;
}

export interface PreviousPaper {
  id: string;
  title: string;
  examId: string;
  boardId: string;
  year: number;
  pdfUrl: string;
  createdAt: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  state: 'Punjab';
  targetExam: string;
  createdAt: any;
  status: 'Pro' | 'Free';
  bestScore?: number;
  rank?: string;
}

export interface TestSession {
  id: string;
  userId: string;
  mockId: string;
  currentIdx: number;
  answers: Record<number, number>;
  flagged: number[];
  remainingTime: number;
  status: 'IN_PROGRESS' | 'SUBMITTED';
  updatedAt: any;
}

export interface ContentReport {
  id: string;
  questionId: string;
  userId: string;
  type: 'WRONG_ANS' | 'TYPO' | 'DUPLICATE' | 'OTHER';
  comment: string;
  status: 'PENDING' | 'RESOLVED';
  timestamp: any;
}

export interface CurrentAffair {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  date: string;
  featured?: boolean;
  tags?: string[];
  imageUrl?: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'Recruitment' | 'Admit Card' | 'Answer Key' | 'Result' | 'Notice';
  board: string;
  time: string;
  important: boolean;
  pdfUrl?: string;
  createdAt: any;
  type?: 'alert' | 'result' | 'vacancy';
}

export interface AttemptResult {
  id?: string;
  userId: string;
  mockId: string;
  mockTitle?: string;
  score: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  totalQuestions: number;
  weakTopics: string[];
  timestamp: string;
  answers: Record<number, number>;
}
