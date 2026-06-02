
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type BoardCategory = 'PSSSB' | 'PPSC' | 'Punjab Police' | 'Education' | 'High Court' | 'Power Sector' | 'Health' | 'Cooperative';

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
}

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface Question {
  id: string;
  subjectId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
  topic: string;
  // Legacy fields for compatibility
  question?: string;
  subject?: string;
}

export interface MockTest {
  id: string;
  examId: string;
  title: string;
  duration: number;
  totalQuestions: number;
  questionIds: string[];
  attempts: number;
  // Legacy fields
  durationInMinutes?: number;
  questions?: Question[];
  totalMarks?: number;
}

export interface AttemptResult {
  id?: string;
  userId: string;
  mockId: string;
  score: number;
  accuracy: number;
  rank?: number;
  weakTopics: string[];
  correctCount?: number;
  incorrectCount?: number;
  totalQuestions?: number;
  timestamp?: string;
  answers?: Record<number, number>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: 'Punjab';
  targetExam: string;
  createdAt: any;
  status: 'Pro' | 'Free';
}

export interface SiteSettings {
  heroLine1: string;
  heroLine2: string;
  heroDescription: string;
  heroPrimaryBtn: string;
  heroSecondaryBtn: string;
  heroImageUrl: string;
}
