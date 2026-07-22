export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_PARTNER' | 'EDITOR' | 'REVIEWER' | 'MODERATOR' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'PYQ' | 'CA_QUIZ' | 'PRACTICE_SET' | 'DAILY_CHALLENGE' | 'MINI_TEST' | 'REVISION_TEST';
export type QuestionType = 'MCQ' | 'MULTIPLE_CORRECT' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ASSERTION_REASON' | 'STATEMENT_BASED' | 'PARAGRAPH_BASED' | 'MATCH_FOLLOWING' | 'SEQUENCE' | 'IMAGE_BASED' | 'TABLE_BASED' | 'CASE_STUDY' | 'AUDIO_BASED' | 'VIDEO_BASED';
export type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES' | 'PUBLISHED' | 'ARCHIVED' | 'LOCKED' | 'SCHEDULED' | 'EXPIRED';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING';
export type Gender = 'Male' | 'Female' | 'Other';

export type AccessLevel = 'FREE' | 'PREMIUM';

export type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';
export type ExamLanguage = 'en' | 'pa' | 'hi' | 'bilingual';

export type LanguageDisplayMode = 'ENGLISH' | 'PUNJABI' | 'HINDI' | 'ENGLISH_PUNJABI' | 'ENGLISH_HINDI';

export interface UserPermissions {
  // Subjects
  createSubject: boolean;
  editSubject: boolean;
  deleteSubject: boolean;
  // Mocks
  createMock: boolean;
  editMock: boolean;
  deleteMock: boolean;
  // Questions
  uploadQuestions: boolean;
  editQuestions: boolean;
  deleteQuestions: boolean;
  // PYQs
  uploadPYQs: boolean;
  editPYQs: boolean;
  deletePYQs: boolean;
  // Media & Content
  uploadImages: boolean;
  publishContent: boolean;
  unpublishContent: boolean;
  reviewContent: boolean;
  // Ecosystem
  manageCategories: boolean;
  manageSeries: boolean;
  managePasses: boolean;
  manageCoupons: boolean;
  // User Governance
  manageUsers: boolean;
  manageRoles: boolean;
  // Monetization
  viewRevenue: boolean;
  managePayments: boolean;
  viewAnalytics: boolean;
  // Settings & Comm
  manageNotifications: boolean;
  manageAnnouncements: boolean;
  websiteSettings: boolean;
  firebaseSettings: boolean;
  // Data
  exportData: boolean;
  importData: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  permissions: UserPermissions;
  state: "Punjab";
  targetExam: string;
  createdAt: string;
  updatedAt: any;
  createdBy?: string;
  lastLoginAt?: any;
  activeDeviceId?: string;
  passStatus: 'active' | 'expired' | 'none';
  passExpiresAt?: string;
  photoURL?: string;
  gender?: Gender;
  pinnedExams?: string[];
  savedVacancies?: string[];
  pass?: {
    active: boolean;
    plan: string;
    purchaseDate: string;
    expiryDate: string;
  };
}

export interface DistributionSettings {
  primaryWebsiteUrl: string;
  installUrl: string;
  playStoreUrl: string;
  appStoreUrl: string;
  shareTitle: string;
  shareDescription: string;
  shareMessage: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  twitterImageUrl: string;
  keywords: string;
  canonicalUrl: string;
  updatedAt: any;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
  iconUrl?: string;
}

export interface Board {
  id: string;
  abbreviation: string;
  name: string;
  categoryId: string; 
  iconUrl?: string;
  displayOrder?: number;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  boardId?: string;
  createdBy?: string;
}

export interface TestSeries {
  id: string;
  subjectId: string;
  boardId?: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  displayOrder: number;
  isActive: boolean;
  accessLevel: AccessLevel;
  createdBy?: string;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  examIds: string[];
  learningSubjectId?: string;
  seriesId?: string;
  mockType: MockType;
  accessLevel: AccessLevel;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarks: number;
  positiveMarks: number;
  questionIds: string[];
  published: boolean;
  languageMode: LanguageDisplayMode;
  createdAt: any;
  updatedAt: any;
  createdBy?: string;
}

export interface Question {
  id: string;
  examId?: string;
  boardId?: string;
  subjectId: string;
  sectionId?: string; 
  questionType: QuestionType;
  difficulty: Difficulty;
  language: LanguageDisplayMode;
  englishQuestion: string;
  punjabiQuestion?: string;
  correctAnswer: string; 
  englishExplanation?: string;
  punjabiExplanation?: string;
  marks: number;
  negativeMarks: number;
  status: ContentStatus;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface Advertisement {
  id: string;
  title: string;
  type: 'BANNER' | 'ADSENSE' | 'HTML';
  status: 'ACTIVE' | 'PAUSED' | 'SCHEDULED';
  placements: string[];
  desktopImageUrl?: string;
  externalUrl?: string;
  priority: number;
  stats?: { impressions: number, clicks: number };
}

export type Ad = Advertisement;
export type Mock = MockTest;
