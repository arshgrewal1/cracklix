
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'CHAPTER' | 'PYQ' | 'CA_QUIZ';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type Gender = 'Male' | 'Female' | 'Other';

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

export interface Pass {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string[];
  active: boolean;
  displayOrder: number;
  recommended?: boolean;
  type: 'FREE' | 'PREMIUM';
  description?: string;
  updatedAt?: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: Gender;
  role: UserRole;
  state: 'Punjab';
  targetExam: string;
  createdAt: any;
  status: string; // Dynamic Pass ID or "Free"
  subscriptions?: string[]; 
  passExpiryDate?: string;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  examId: string;
  mockType: MockType;
  requiredPass: string; // Dynamic Pass ID
  duration: number;
  totalQuestions: number;
  questionIds: string[];
  difficulty: string;
  published: boolean;
  isPremium?: boolean;
  createdAt: any;
  updatedAt: any;
}
