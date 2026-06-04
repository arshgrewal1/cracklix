export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'CHAPTER' | 'PYQ' | 'CA_QUIZ';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type SubscriptionTier = 'Free' | 'Silver' | 'Gold' | 'Premium';

export type QuestionType = 
  | 'MCQ' 
  | 'IMAGE_MCQ'
  | 'MATCHING'
  | 'ASSERTION_REASON'
  | 'DI_SET'
  | 'DI_QUESTION'
  | 'PASSAGE'
  | 'PASSAGE_QUESTION'
  | 'CURRENT_AFFAIRS';

export type DiagramType = 
  | 'none' 
  | 'image' 
  | 'table' 
  | 'pieChart' 
  | 'barGraph' 
  | 'lineGraph' 
  | 'map';

export interface MockSection {
  id: string;
  name: string;
  subjectId: string;
  questionCount: number;
  duration: number; // in minutes
  marksPerQuestion: number;
}

export interface Board {
  id: string;
  abbreviation: string;
  name: string;
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
  boardId: string;
  examId: string;
  subjectId: string;
  chapterId: string;
  difficulty: Difficulty;
  status: ContentStatus;
  questionType: QuestionType;
  diagramType: DiagramType;

  // Context IDs for Linked Sets
  diSetId?: string;
  passageId?: string;

  // Primary Content (English)
  questionEn: string;
  optionAEn: string;
  optionBEn: string;
  optionCEn: string;
  optionDEn: string;
  explanationEn: string;
  instructionEn?: string;
  passageEn?: string;
  titleEn?: string;
  descriptionEn?: string;
  
  // Primary Content (Punjabi)
  questionPa: string;
  optionAPa: string;
  optionBPa: string;
  optionCPa: string;
  optionDPa: string;
  explanationPa: string;
  instructionPa?: string;
  passagePa?: string;
  titlePa?: string;
  descriptionPa?: string;

  correctAnswer: 'A' | 'B' | 'C' | 'D';

  // Visual/Complex Data
  imageUrl?: string;
  tableData?: {
    headers: string[];
    rows: any[][];
  }; 
  chartConfig?: any;

  // Meta for CA/PYQ
  date?: string;
  category?: string;
  year?: number;

  // Usage Tracking (Phase 165)
  usageCount: number;
  usedInMocks: string[];

  isStandalone?: boolean;
  createdAt: any;
  updatedAt: any;
  author?: string;
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
  isPremium?: boolean;
  passingMarks?: number;
  negativeMarking?: number;
  instructions?: string;
  language?: string;
  sections?: MockSection[];
  
  subjectId?: string;
  chapterId?: string;
  year?: number;
  caCategory?: string;
  caPeriod?: string;
  paperName?: string;

  createdAt: any;
  updatedAt: any;
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
