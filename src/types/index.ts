export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type BoardCategory = 'PSSSB' | 'PPSC' | 'Punjab Police' | 'Education' | 'High Court' | 'Power Sector' | 'Health' | 'Cooperative';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed index
  explanation: string;
  topic: string;
  difficulty: Difficulty;
  subject?: string;
}

export interface Exam {
  id: string;
  name: string;
  board: BoardCategory;
  category: string;
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
  answers?: Record<number, number>; 
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
  status: 'Pro' | 'Free';
}
