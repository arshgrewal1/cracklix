export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ExamCategory = 'Police' | 'Clerk' | 'Teaching' | 'Banking' | 'General';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed index
  explanation: string;
  topic: string;
  difficulty: Difficulty;
}

export interface Exam {
  id: string;
  name: string;
  category: ExamCategory;
  totalQuestions: number;
  duration: number; // minutes
  description?: string;
  thumbnail?: string;
  totalMocks?: number;
  activeQuestions?: number;
}

export interface Mock {
  id: string;
  examId: string;
  title: string;
  durationInMinutes: number;
  questions: Question[];
  totalMarks?: number;
  attempts?: number;
}

export interface AttemptResult {
  userId: string;
  mockId: string;
  score: number;
  accuracy: number;
  rank: number;
  weakTopics: string[];
  correctCount?: number;
  incorrectCount?: number;
  totalQuestions?: number;
  timestamp?: string;
  answers?: Record<number, number>; // questionIdx -> selectedOptionIdx
}

export interface CurrentAffair {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'alert' | 'update' | 'result';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  state: 'Punjab';
  targetExam: string;
  createdAt: string;
}