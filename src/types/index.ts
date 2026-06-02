
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STUDENT';
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
  boardId?: string;
  examId?: string;
  text: string; 
  textPa?: string; 
  options: string[]; 
  optionsPa?: string[]; 
  correctAnswer: number;
  explanation: string; 
  explanationPa?: string; 
  difficulty: Difficulty;
  topic: string;
  createdAt?: any;
  author?: string;
}

export interface MockTest {
  id: string;
  examId: string;
  title: string;
  duration: number;
  totalQuestions: number;
  questionIds: string[];
  attempts: number;
  difficulty?: Difficulty;
  type?: string;
  language?: string;
  createdAt?: any;
  publishedBy?: string;
}

export interface CurrentAffair {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  content?: string;
  imageUrl?: string;
}

export interface AttemptResult {
  id?: string;
  userId: string;
  mockId: string;
  mockTitle?: string;
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
  role: UserRole;
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
