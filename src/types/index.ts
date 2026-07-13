export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'REVIEWER' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'PYQ' | 'CA_QUIZ' | 'PRACTICE_SET';
export type QuestionType = 'MCQ' | 'MULTIPLE_CORRECT' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ASSERTION_REASON' | 'STATEMENT_BASED' | 'PARAGRAPH_BASED' | 'MATCH_FOLLOWING' | 'SEQUENCE' | 'IMAGE_BASED' | 'TABLE_BASED' | 'CASE_STUDY' | 'AUDIO_BASED' | 'VIDEO_BASED';
export type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES' | 'PUBLISHED' | 'ARCHIVED' | 'LOCKED';
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

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED';

export interface MatchingRow {
  left: string;
  right: string;
}

export interface MatchingData {
  leftHeader: string;
  rightHeader: string;
  rows: MatchingRow[];
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
export type Ad = Advertisement;

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

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  active: boolean;
  updatedAt: any;
  createdAt: any;
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
  referralCode?: string;
  referredBy?: string | null;
  coins?: number;
  pass?: {
    active: boolean;
    plan: string;
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

export interface Subject {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  categoryId?: string;
  boardId?: string;
  updatedAt?: any;
  createdAt?: any;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  updatedAt?: any;
  createdAt?: any;
}

export interface Topic {
  id: string;
  chapterId: string;
  subjectId: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  updatedAt?: any;
  createdAt?: any;
}

export interface Subtopic {
  id: string;
  topicId: string;
  chapterId: string;
  subjectId: string;
  name: string;
  displayOrder: number;
  updatedAt?: any;
  createdAt?: any;
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

export interface TableContent {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface Question {
  id: string;
  examId?: string;
  boardId?: string;
  subjectId: string;
  chapterId?: string;
  topicId?: string;
  subtopicId?: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  language: LanguageDisplayMode;
  englishQuestion: string;
  punjabiQuestion?: string;
  hindiQuestion?: string;
  englishAssertion?: string;
  punjabiAssertion?: string;
  englishReason?: string;
  punjabiReason?: string;
  englishDiagramQuestion?: string;
  punjabiDiagramQuestion?: string;
  englishActualQuestion?: string;
  punjabiActualQuestion?: string;
  englishInstruction?: string;
  punjabiInstruction?: string;
  diagramContent?: string;
  graphContent?: string;
  matchingContent?: string;
  matchingData?: MatchingData;
  matchingBlock?: {
    leftColumn: string[];
    rightColumn: string[];
  };
  tableContent?: TableContent;
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
  optionEEnglish?: string;
  optionEPunjabi?: string;
  optionEHindi?: string;
  correctAnswer: string; 
  englishExplanation?: string;
  punjabiExplanation?: string;
  hindiExplanation?: string;
  detailedExplanation?: string;
  hint?: string;
  formula?: string;
  latexSupport?: boolean;
  referenceBook?: string;
  referencePage?: string;
  isPreviousYear?: boolean;
  examYear?: number;
  shift?: string;
  session?: string;
  marks: number;
  negativeMarks: number;
  estimatedTime?: number; 
  tags: string[];
  status: ContentStatus;
  visibility: 'PUBLIC' | 'PRIVATE';
  createdBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  publishedAt?: any;
  createdAt: any;
  updatedAt: any;
  usedCount: number;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  diagram_required?: boolean;
  diagram_caption?: string;
  table_data?: string;
}

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

export interface Stats {
  totalUsers: number;
  totalMocks: number;
  totalExams: number;
  totalQuestions: number;
  totalNotes: number;
  totalPYQs: number;
  totalAttempts: number;
  activeStudentsToday: number;
  averageAccuracy: number;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: any;
  details: any;
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  paymentId: string;
  orderId: string;
  status: SubscriptionStatus;
  purchaseDate: any;
  activationDate: any;
  expiryDate: any;
  validityDays: number;
  invoiceNumber: string;
  countUsed?: string | null;
  updatedAt: any;
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: any;
  endTime: any;
  durationSeconds: number;
  activityType: 'MOCK' | 'CA' | 'PYQ' | 'PDF' | 'PRACTICE' | 'DASHBOARD' | 'OTHER';
  activityId?: string;
  completedQuestions?: number;
  correct?: number;
  wrong?: number;
  timezone: string;
  createdAt: any;
}

export type Mock = MockTest;
export type CurrentAffair = CurrentAffairHubItem;
export type Notification = any;
