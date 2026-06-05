
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'CHAPTER' | 'PYQ' | 'CA_QUIZ' | 'PRACTICE_SET';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type Gender = 'Male' | 'Female' | 'Other';
export type AccessType = 'FREE' | 'PREMIUM';
export type RegionType = 'Punjab' | 'National';
export type BoardCategory = 'PUNJAB_STATE' | 'TEACHING' | 'CENTRAL';

export type AdType = 'ADSENSE' | 'BANNER' | 'HTML' | 'AFFILIATE';
export type AdStatus = 'ACTIVE' | 'PAUSED' | 'SCHEDULED';
export type AdPlacementType = 
  | 'HOMEPAGE_TOP' 
  | 'HOMEPAGE_MIDDLE' 
  | 'HOMEPAGE_BOTTOM' 
  | 'EXAM_LISTING' 
  | 'MOCK_LISTING' 
  | 'NOTES_PAGE' 
  | 'CA_PAGE' 
  | 'RESULT_PAGE' 
  | 'SIDEBAR' 
  | 'FOOTER' 
  | 'HEADER';

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

export interface Board {
  id: string;
  abbreviation: string;
  name: string;
  iconUrl: string;
  description: string;
  region: RegionType;
  category: BoardCategory;
}

export interface Pass {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string[];
  active: boolean;
  displayOrder: number;
  recommended?: boolean;
  adFree: boolean;
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
  status: string; // "Free" or a Pass ID
  subscriptions?: string[]; 
  passExpiryDate?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  type: AdType;
  status: AdStatus;
  placements: AdPlacementType[];
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  externalUrl?: string;
  htmlCode?: string;
  adSenseCode?: string;
  startDate?: any;
  endDate?: any;
  priority: number;
  targeting: {
    regions?: string[];
    examIds?: string[];
    categories?: string[];
  };
  stats: {
    impressions: number;
    clicks: number;
  };
  createdAt: any;
  updatedAt: any;
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
  questionIds: string[];
  difficulty: string;
  status: ContentStatus;
  published: boolean;
  isDummy?: boolean;
  createdAt: any;
  updatedAt: any;
}
