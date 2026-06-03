
export type Difficulty = 'easy' | 'medium' | 'hard';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'QUESTION_REVIEWER' | 'SUPPORT_AGENT' | 'CURRENT_AFFAIRS_EDITOR' | 'MARKETING_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'PYQ';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

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
  syllabus?: { topic: string; weight: string; status: string }[];
  pattern?: string;
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
  status: ContentStatus;

  // Trilingual Content
  questionEn: string;
  questionPa: string;
  questionHi: string;

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

  // Options Mapping - Hindi
  optionAHi: string;
  optionBHi: string;
  optionCHi: string;
  optionDHi: string;

  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanationEn: string;
  explanationPa: string;
  explanationHi: string;

  // Quality Analytics
  attempts?: number;
  correctAttempts?: number;
  avgTimeSeconds?: number;

  createdAt: any;
  updatedAt?: any;
  author?: string;
  reviewedBy?: string;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  examId: string;
  mockType: MockType;
  duration: number;
  totalQuestions: number;
  questionIds: string[];
  difficulty: string;
  published: boolean;
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
  status: 'Pro' | 'Free';
  planId?: string;
  referralCount: number;
  subscriptions?: string[]; 
  badges?: string[]; 
}

export interface ContentReport {
  id: string;
  userId: string;
  questionId: string;
  type: 'WRONG_ANS' | 'TYPO' | 'MISSING_DATA' | 'OTHER';
  comment: string;
  status: 'PENDING' | 'RESOLVED' | 'IGNORED';
  timestamp: any;
}
