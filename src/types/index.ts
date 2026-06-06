
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'CHAPTER' | 'PYQ' | 'CA_QUIZ' | 'PRACTICE_SET';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type Gender = 'Male' | 'Female' | 'Other';
export type AccessType = 'FREE' | 'PREMIUM';
export type RegionType = 'Punjab' | 'National';
export type BoardCategory = 'PUNJAB_STATE' | 'TEACHING' | 'CENTRAL';

export interface Board {
  id: string;
  abbreviation: string;
  name: string;
  iconUrl: string;
  description: string;
  region: RegionType;
  category: BoardCategory;
}

export interface Subject {
  id: string;
  name: string;
  aliases: string[];
  description?: string;
  updatedAt: any;
}

export interface Exam {
  id: string;
  name: string;
  boardId: string;
  description: string;
  category: string;
  totalFullMocks: number;
  totalSubjects: number;
  totalPyqs: number;
  totalSectional: number;
  iconUrl?: string;
  updatedAt?: any;
}

export interface Pass {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string[];
  allowedExams: string[]; // List of exam IDs this pass unlocks
  promotionBannerUrl?: string;
  active: boolean;
  displayOrder: number;
  recommended?: boolean;
  adFree: boolean;
  type: 'FREE' | 'PREMIUM';
  description?: string;
  updatedAt?: any;
}

export interface UserSubscription {
  id: string;
  userId: string;
  passId: string;
  status: 'ACTIVE' | 'EXPIRED';
  expiryDate: string;
  purchaseDate: string;
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
  status: string; // "Free" or a Pass ID
  subscriptions?: string[]; 
  passExpiryDate?: string;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  examId: string;
  subjectId?: string;
  mockType: MockType;
  accessType: AccessType;
  passId?: string; 
  duration: number;
  totalQuestions: number;
  questionIds: string[];
  difficulty: string;
  status: ContentStatus;
  published: boolean;
  isDummy?: boolean;
  positiveMarks: number;
  negativeMarks: number;
  createdAt: any;
  updatedAt: any;
}

export interface Question {
  id: string;
  questionEn: string;
  questionPa?: string;
  optionAEn: string;
  optionAPa?: string;
  optionBEn: string;
  optionBPa?: string;
  optionCEn: string;
  optionCPa?: string;
  optionDEn: string;
  optionDPa?: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanationEn?: string;
  explanationPa?: string;
  subjectId: string;
  boardId: string;
  difficulty: Difficulty;
  isStandalone: boolean;
  status: ContentStatus;
  createdAt: any;
  updatedAt: any;
}
