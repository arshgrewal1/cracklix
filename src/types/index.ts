
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'CHAPTER' | 'PYQ' | 'CA_QUIZ' | 'PRACTICE_SET';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type Gender = 'Male' | 'Female' | 'Other';
export type AccessType = 'FREE' | 'PREMIUM';
export type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';
export type ExamLanguage = 'en' | 'pa' | 'hi' | 'bilingual';

export interface Subject {
  id: string;
  name: string;
  aliases: string[];
}

export interface ExamSection {
  id: string;
  name: string;
  questions: number;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  examId: string;
  mockType: MockType;
  accessType: AccessType;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarks: number;
  questionIds: string[];
  sections: ExamSection[];
  published: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Question {
  id: string;
  examId: string;
  sectionId: string;
  partId?: string;
  englishQuestion: string;
  punjabiQuestion: string;
  hindiQuestion?: string;
  optionAEnglish: string;
  optionAPunjabi: string;
  optionBEnglish: string;
  optionBPunjabi: string;
  optionCEnglish: string;
  optionCPunjabi: string;
  optionDEnglish: string;
  optionDPunjabi: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  englishExplanation: string;
  punjabiExplanation: string;
  difficulty: Difficulty;
}

export interface AttemptState {
  answers: Record<number, number>; // index: optionIndex
  status: Record<number, QuestionStatus>;
  visited: number[];
  bookmarks: number[];
  timeLeft: number;
  currentIdx: number;
  currentSectionId: string;
  violations: number;
  startTime: number;
  endTime: number;
}
