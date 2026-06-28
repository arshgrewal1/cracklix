export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'PYQ' | 'CA_QUIZ' | 'PRACTICE_SET';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type QuestionLifecycleStatus = 'UNUSED' | 'USED' | 'LOCKED' | 'DUPLICATE' | 'REPEATED';
export type Gender = 'Male' | 'Female' | 'Other';

export type AccessLevel = 'FREE' | 'PREMIUM';

export type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';
export type ExamLanguage = 'en' | 'pa' | 'hi' | 'bilingual';

export type LanguageDisplayMode = 'ENGLISH' | 'PUNJABI' | 'HINDI' | 'ENGLISH_PUNJABI' | 'ENGLISH_HINDI';

export type CurrentAffairType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUIZ' | 'SPECIAL';

export type MockAssignmentMode = 'SINGLE' | 'MULTIPLE' | 'AUTHORITY';

export type AdType = 'BANNER' | 'ADSENSE' | 'HTML';
export type AdStatus = 'ACTIVE' | 'PAUSED' | 'SCHEDULED';
export type AdPlacementType = 'HOMEPAGE_TOP' | 'HOMEPAGE_MIDDLE' | 'HOMEPAGE_BOTTOM' | 'EXAM_LISTING' | 'MOCK_LISTING' | 'NOTES_PAGE' | 'CA_PAGE' | 'RESULT_PAGE' | 'SIDEBAR' | 'FOOTER';

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
  priority: number;
  targeting?: {
    examIds?: string[];
  };
  stats?: {
    impressions: number;
    clicks: number;
  };
  createdAt: any;
  updatedAt: any;
}

export interface CalendarEvent {
  id: string;
  post: string;
  board: string;
  date: string;
  status: string;
  type: string;
  color?: string;
  published: boolean;
  createdAt?: any;
  updatedAt?: any;
  displayOrder?: number;
}

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  published: boolean;
  displayOrder: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface SuccessStory {
  id: string;
  name: string;
  exam: string;
  rank: string;
  year: string;
  quote: string;
  imageUrl: string;
  published: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: string;
  role: UserRole;
  state: "Punjab";
  targetExam: string;
  assignedBoardId?: string;
  createdAt: string;
  updatedAt: any;
  status: string; 
  planTier: number; 
  passType: 'FREE' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  passStatus: 'active' | 'expired' | 'none';
  passActivatedAt?: string;
  passExpiresAt?: string;
  photoURL?: string;
  gender?: Gender;
  subscriptions?: string[];
  pinnedExams?: string[];
  unlockedMocks?: string[];
  deviceLock?: DeviceLock;
  deviceCount?: number;
  activeDeviceId?: string;
  activeBrowser?: string;
  activePlatform?: string;
  lastLoginAt?: any;
  sessionVersion?: number;
  pass?: {
    active: boolean;
    plan: 'FREE_PASS' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | string;
    purchaseDate: string;
    expiryDate: string;
    freePassClaimed: boolean;
  };
}

export interface DeviceLock {
  deviceId: string;
  deviceName: string;
  lastChangedAt: any;
  enabled: boolean;
  enforcementLevel: 0 | 1 | 2 | 3;
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
  updatedAt?: any;
  displayOrder?: number;
}

export interface Exam {
  id: string;
  name: string;
  boardId: string;
  categoryId: string;
  displayOrder: number;
  isTrending?: boolean;
  updatedAt?: any;
  createdAt?: any;
  iconUrl?: string;
  description?: string;
  totalMocks?: number;
  activeQuestions?: number;
}

export interface Question {
  id: string;
  englishQuestion: string;
  punjabiQuestion?: string;
  hindiQuestion?: string;
  optionAEnglish: string;
  optionAPunjabi?: string;
  optionAHindi?: string;
  optionBEnglish: string;
  optionBPunjabi?: string;
  optionBHindi?: string;
  optionCEnglish: string;
  optionCPunjabi?: string;
  optionCHindi?: string;
  optionDEnglish: string;
  optionDPunjabi?: string;
  optionDHindi?: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  difficulty: Difficulty;
  englishExplanation?: string;
  punjabiExplanation?: string;
  hindiExplanation?: string;
  subjectId: string;
  boardId?: string;
  sectionId?: string;
  chapterId?: string;
  imageUrl?: string;
  status: QuestionLifecycleStatus;
  usedCount: number;
  createdAt: any;
  updatedAt: any;
  isStandalone?: boolean;
  author?: string;
  displayId?: string;
}

// Legacy Aliases
export type Mock = MockTest;
export type CurrentAffair = CurrentAffairHubItem;
export type Notification = any; 

export interface CurrentAffairHubItem {
  id: string;
  title: string;
  type: CurrentAffairType;
  month: string;
  year: string;
  status: ContentStatus;
  questions: Question[];
  language: string;
  duration: number;
  positiveMarks: number;
  negativeMarks: number;
  pdfUrl?: string;
  quizId?: string;
  updatedAt?: any;
  createdAt?: any;
}

export interface ExamSection {
  name: string;
  count: number;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  boardIds: string[];
  examIds: string[];
  mockType: MockType;
  accessLevel: AccessLevel;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarks: number;
  positiveMarks: number;
  questionIds: string[];
  sections: ExamSection[];
  published: boolean;
  languageMode: LanguageDisplayMode;
  attemptLimit: number;
  createdAt: any;
  updatedAt: any;
}

export interface AttemptResult {
  userId: string;
  userName: string;
  userEmail: string;
  mockId: string;
  mockTitle: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  attemptedCount: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  answers: Record<number, number | null>;
  timestamp: string;
  createdAt: any;
  accessLevel: AccessLevel;
  gender?: Gender;
}
