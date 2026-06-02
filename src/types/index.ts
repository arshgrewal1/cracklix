export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subject: string;
  difficulty: Difficulty;
  category?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  totalMocks: number;
  activeQuestions: number;
}

export interface Mock {
  id: string;
  examId: string;
  title: string;
  durationInMinutes: number;
  questions: Question[];
  totalMarks: number;
  attempts?: number;
}

export interface AttemptResult {
  id: string;
  mockId: string;
  userId: string;
  score: number;
  totalScore: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  timeTakenInSeconds: number;
  answers: Record<string, string>;
  timestamp: string;
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
