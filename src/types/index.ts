export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'PYQ' | 'CA_QUIZ';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type ExamType = 'punjab' | 'central';
export type SubscriptionTier = 'Free' | 'Silver' | 'Gold' | 'Premium';
export type CAQuizType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type QuestionType = 
  | 'MCQ' 
  | 'BILINGUAL_MCQ' 
  | 'PASSAGE' 
  | 'DI_TABLE' 
  | 'DI_CHART' 
  | 'REASONING_DIAGRAM' 
  | 'MATCHING' 
  | 'ASSERTION_REASON';

export type DiagramType = 
  | 'none' 
  | 'image' 
  | 'table' 
  | 'pieChart' 
  | 'barGraph' 
  | 'lineGraph' 
  | 'vennDiagram' 
  | 'seatingArrangement'
  | 'flowchart'
  | 'logicalDiagram'
  | 'map';

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
  topicId?: string;
  difficulty: Difficulty;
  topic?: string;
  subtopic?: string;
  status: ContentStatus;
  questionType: QuestionType;
  
  // Core Text
  questionEn: string;
  questionPa: string;
  questionHi?: string;
  
  // Metadata Text
  instructionEn?: string;
  instructionPa?: string;
  passageEn?: string;
  passagePa?: string;
  
  // Options
  optionAEn: string;
  optionBEn: string;
  optionCEn: string;
  optionDEn: string;
  optionAPa: string;
  optionBPa: string;
  optionCPa: string;
  optionDPa: string;
  
  // Logic
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanationEn: string;
  explanationPa: string;
  
  // Complex Data
  diagramType?: DiagramType;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  chartConfig?: {
    type: 'bar' | 'pie' | 'line';
    labels: string[];
    values: number[];
  };
  diagramConfig?: any; 
  
  imageUrl?: string;
  imageAlt?: string;

  createdAt: any;
  updatedAt?: any;
  isStandalone?: boolean;
  marks?: number;
  negativeMarks?: number;
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
  
  // New CMS Fields
  subjectId?: string;
  topicId?: string;
  year?: number;
  caCategory?: string;
  caQuizType?: CAQuizType;
  paperName?: string;
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
