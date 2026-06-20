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

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: string;
  pdfUrl?: string;
  category?: string;
  board?: string;
  important?: boolean;
}

export interface UserDevice {
  id: string;
  browser: string;
  platform: string;
  lastActive: any;
  firstLogin: any;
  deviceName: string;
}

export interface DeviceLock {
  deviceId: string;
  deviceName: string;
  lastChangedAt: any;
  enabled: boolean;
  enforcementLevel: 0 | 1 | 2 | 3; // 0: Off, 1: Track, 2: Warning, 3: Block
}

export interface Category {
  id: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  highlight: string;
  displayOrder: number;
  iconUrl?: string;
}

export interface Board {
  id: string;
  abbreviation: string;
  name: string;
  region: string;
  category: string;
  categoryId: string; 
  iconUrl?: string;
  color?: string;
  updatedAt?: any;
  displayOrder?: number;
}

export interface Exam {
  id: string;
  name: string;
  title?: string;
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
  totalQuestions?: number;
  duration?: number;
  category?: string;
}

export interface Subject {
  id: string;
  name: string;
  aliases: string[];
}

export interface ExamSection {
  id: string;
  name: string;
  count: number;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  boardIds: string[];
  examIds: string[];
  assignmentMode?: MockAssignmentMode;
  mockType: MockType;
  testCategory?: string;
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
  isTrending?: boolean;
  accessType?: string;
}

export type Mock = MockTest;

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
  boardId: string;
  examId?: string;
  sectionId?: string;
  status: QuestionLifecycleStatus;
  usedCount: number;
  lastUsedDate?: string;
  mockIdsUsedIn?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  address?: string;
  role: UserRole;
  state: "Punjab";
  targetExam: string;
  assignedBoardId?: string;
  createdAt: string;
  status: string;
  passStatus?: 'active' | 'expired' | 'none';
  passActivatedAt?: string;
  passExpiresAt?: string;
  passExpiryDate?: string;
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
  pass?: {
    active: boolean;
    plan: 'FREE_PASS' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | string;
    purchaseDate: string;
    expiryDate: string;
    freePassClaimed: boolean;
  };
}

export interface Advertisement {
  id: string;
  title: string;
  type: 'BANNER' | 'ADSENSE' | 'HTML';
  status: 'ACTIVE' | 'PAUSED' | 'SCHEDULED';
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
  | 'FOOTER';

export type AdType = 'BANNER' | 'ADSENSE' | 'HTML';
export type AdStatus = 'ACTIVE' | 'PAUSED' | 'SCHEDULED';

export interface CurrentAffairHubItem {
  id: string;
  title: string;
  month: string;
  year: string;
  language: string;
  type: CurrentAffairType;
  pdfUrl?: string;
  status: 'PUBLISHED' | 'DRAFT';
  quizId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface CurrentAffair {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
}

export interface AttemptState {
  answers: Record<number, number | null>;
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

export type AttemptResult = {
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
  accessLevel: string;
};
