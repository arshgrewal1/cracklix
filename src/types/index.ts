
export type Difficulty = 'easy' | 'medium' | 'hard';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'PYQ';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type ExamType = 'punjab' | 'central';
export type SubscriptionTier = 'Free' | 'Silver' | 'Gold' | 'Premium';

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

export interface PatternSection {
  name: string;
  count: number;
  subjectId: string;
}

export interface ExamPattern {
  id: string;
  examId: string;
  examName: string;
  totalQuestions: number;
  duration: number;
  negativeMarking: boolean;
  sections: PatternSection[];
}

export interface Question {
  id: string;
  boardId: string;
  examId: string;
  subjectId: string;
  difficulty: Difficulty;
  topic?: string;
  status: ContentStatus;
  paper?: string;
  section?: string;
  questionEn: string;
  questionPa: string;
  questionHi: string;
  optionAEn: string;
  optionBEn: string;
  optionCEn: string;
  optionDEn: string;
  optionAPa: string;
  optionBPa: string;
  optionCPa: string;
  optionDPa: string;
  optionAHi: string;
  optionBHi: string;
  optionCHi: string;
  optionDHi: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanationEn: string;
  explanationPa: string;
  explanationHi: string;
  createdAt: any;
  updatedAt?: any;
  isStandalone?: boolean;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  examId: string;
  mockType: MockType;
  examType: ExamType;
  duration: number;
  totalQuestions: number;
  questionIds: string[];
  difficulty: string;
  published: boolean;
  isPremium?: boolean;
  status: ContentStatus;
  createdAt: any;
  updatedAt?: any;
  author?: string;
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
  status: SubscriptionTier;
  subscriptions?: string[]; 
}
