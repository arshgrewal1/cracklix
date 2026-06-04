export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'CHAPTER' | 'PYQ' | 'CA_QUIZ';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type SubscriptionTier = 'Free' | 'Silver' | 'Gold' | 'Premium';

export type QuestionType = 
  | 'MCQ' 
  | 'BILINGUAL_MCQ' 
  | 'IMAGE_MCQ'
  | 'MATCHING'
  | 'ASSERTION_REASON'
  | 'TABLE_MCQ'
  | 'PASSAGE'
  | 'PASSAGE_QUESTION'
  | 'DI_SET'
  | 'DI_QUESTION'
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

export interface Question {
  id: string;
  boardId: string;
  examId: string;
  subjectId: string;
  chapterId: string;
  difficulty: Difficulty;
  mockType?: MockType;
  status: ContentStatus;
  questionType: QuestionType;
  diagramType: DiagramType;

  // Context IDs for Sets
  parentSetId?: string;
  passageId?: string;

  // Primary Content
  instructionEn?: string;
  instructionPa?: string;
  passageEn?: string;
  passagePa?: string;
  
  questionEn: string;
  questionPa: string;

  optionAEn: string;
  optionAPa: string;
  optionBEn: string;
  optionBPa: string;
  optionCEn: string;
  optionCPa: string;
  optionDEn: string;
  optionDPa: string;

  correctAnswer: 'A' | 'B' | 'C' | 'D';

  explanationEn: string;
  explanationPa: string;

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
