
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_PARTNER' | 'EDITOR' | 'REVIEWER' | 'MODERATOR' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'PYQ' | 'CA_QUIZ' | 'PRACTICE_SET' | 'DAILY_CHALLENGE' | 'MINI_TEST' | 'REVISION_TEST';
export type QuestionType = 'MCQ' | 'MULTIPLE_CORRECT' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ASSERTION_REASON' | 'STATEMENT_BASED' | 'PARAGRAPH_BASED' | 'MATCH_FOLLOWING' | 'SEQUENCE' | 'IMAGE_BASED' | 'TABLE_BASED' | 'CASE_STUDY' | 'AUDIO_BASED' | 'VIDEO_BASED';
export type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES' | 'PUBLISHED' | 'ARCHIVED' | 'LOCKED' | 'SCHEDULED' | 'EXPIRED' | 'UNUSED' | 'USED' | 'VERIFIED' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING';
export type Gender = 'Male' | 'Female' | 'Other';

export type AccessLevel = 'FREE' | 'PREMIUM';

export type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';
export type ExamLanguage = 'en' | 'pa' | 'hi' | 'bilingual';

export type LanguageDisplayMode = 'ENGLISH' | 'PUNJABI' | 'HINDI' | 'ENGLISH_PUNJABI' | 'ENGLISH_HINDI';

export interface DeviceLock {
  deviceId: string;
  deviceName: string;
  lastChangedAt: any;
  enabled: boolean;
  enforcementLevel: number;
}

export interface StudyStats {
  todayStudyMinutes: number;
  yesterdayStudyMinutes: number;
  totalLifetimeStudyMinutes: number;
  lastActiveTime: any;
  currentSessionStart: any;
  lastStudyDate: string;
  updatedAt: any;
}

export interface BrandingSettings {
  websiteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  verificationUrl: string;
  qrCodeUrl: string;
  certificateBgUrl: string;
  digitalStampUrl: string;
  organizationName: string;
  supportEmail: string;
  supportPhone: string;
  copyrightText: string;
  updatedAt: any;
  showFounderImage?: boolean;
  adSenseEnabled?: boolean;
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

export interface UserPermissions {
  createSubject: boolean;
  editSubject: boolean;
  deleteSubject: boolean;
  createMock: boolean;
  editMock: boolean;
  deleteMock: boolean;
  uploadQuestions: boolean;
  editQuestions: boolean;
  deleteQuestions: boolean;
  uploadPYQs: boolean;
  editPYQs: boolean;
  deletePYQs: boolean;
  uploadImages: boolean;
  publishContent: boolean;
  unpublishContent: boolean;
  reviewContent: boolean;
  manageCategories: boolean;
  manageSeries: boolean;
  managePasses: boolean;
  manageCoupons: boolean;
  manageUsers: boolean;
  manageRoles: boolean;
  manageNotifications: boolean;
  manageAnnouncements: boolean;
  viewAnalytics: boolean;
  viewRevenue: boolean;
  managePayments: boolean;
  websiteSettings: boolean;
  firebaseSettings: boolean;
  exportData: boolean;
  importData: boolean;
  publishStudyMaterial?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: string;
  district?: string;
  city?: string;
  role: UserRole;
  status: UserStatus | string;
  permissions: UserPermissions;
  state: "Punjab";
  targetExam: string;
  examCategory?: string;
  education?: string;
  preferredLanguage?: string;
  dailyGoal?: string;
  createdAt: any;
  updatedAt: any;
  lastLoginAt?: any;
  lastSeen?: any;
  activeDeviceId?: string;
  deviceLock?: DeviceLock;
  passStatus: 'active' | 'expired' | 'none';
  passExpiresAt?: string;
  passActivatedAt?: string;
  photoURL?: string;
  gender?: Gender;
  pinnedExams?: string[];
  pinnedSeries?: string[];
  savedVacancies?: string[];
  savedCA?: string[];
  totalTests?: number;
  highestScore?: number;
  averageAccuracy?: number;
  averageTime?: number;
  bestRank?: number | string;
  studyStats?: StudyStats;
  pass?: {
    active: boolean;
    plan: string;
    purchaseDate: string;
    expiryDate: string;
    allowedSeries?: string[];
    allowedCategories?: string[];
    freePassClaimed?: boolean;
    adFree?: boolean;
  };
  sessionVersion?: number;
  referralCode?: string;
  referredBy?: string;
  coins?: number;
  studyStatsArray?: any[];
  lastStudyDate?: string;
  lastSyncedSeconds?: number;
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: any;
  endTime: any;
  durationSeconds: number;
  activityType: 'MOCK' | 'PRACTICE' | 'PDF' | 'CA' | 'PYQ';
  activityId?: string;
  timezone?: string;
  createdAt: any;
  completedQuestions?: number;
  correct?: number;
  wrong?: number;
}

export interface AttemptResult {
  id: string;
  attemptId: string;
  mockId: string;
  mockTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  score: number;
  maxMarks: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  attemptedCount: number;
  totalQuestions: number;
  attemptAccuracy: number;
  timeTaken: number;
  timestamp: string;
  createdAt: any;
  languageMode: string;
  subjectAnalysis: any[];
  complexityAnalysis: any[];
  answers: Record<string, number | null>;
  rankAtSubmission?: number | string;
  isGuestNode?: boolean;
  accuracy: number;
  mockType?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
  iconUrl?: string;
  updatedAt?: any;
  logoUrl?: string;
}

export interface Board {
  id: string;
  abbreviation: string;
  name: string;
  categoryId: string; 
  iconUrl?: string;
  displayOrder?: number;
  logoUrl?: string;
}

export interface Exam {
  id: string;
  name: string;
  boardId: string;
  categoryId: string;
  displayOrder?: number;
  description?: string;
  isTrending?: boolean;
  totalMocks?: string | number;
  studentCount?: string;
  activeQuestions?: number;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  boardId?: string;
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  chapterId: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Subtopic {
  id: string;
  name: string;
  topicId: string;
  subjectId: string;
  displayOrder: number;
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
  isFeatured?: boolean;
}

export interface MockTest {
  id: string;
  title: string;
  boardId: string;
  boardIds?: string[];
  examIds: string[];
  examId?: string;
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
  isTodayQuiz?: boolean;
  rewardXP?: number;
  attemptLimit?: number;
  isFeatured?: boolean;
}

export interface Question {
  id: string;
  examId?: string;
  examIds?: string[];
  boardId?: string;
  subjectId: string;
  sectionId?: string; 
  questionType: QuestionType;
  difficulty: Difficulty;
  language: LanguageDisplayMode;
  englishQuestion: string;
  punjabiQuestion?: string;
  hindiQuestion?: string;
  optionAEnglish: string;
  optionAPunjabi?: string;
  optionBEnglish: string;
  optionBPunjabi?: string;
  optionCEnglish: string;
  optionCPunjabi?: string;
  optionDEnglish: string;
  optionDPunjabi?: string;
  correctAnswer: string; 
  englishExplanation?: string;
  punjabiExplanation?: string;
  hindiExplanation?: string;
  marks: number;
  negativeMarks: number;
  status: ContentStatus;
  createdAt: any;
  updatedAt: any;
  used?: boolean;
  usageCount?: number;
  usedInMocks?: string[];
  tableContent?: {
    headers: string[];
    rows: string[][];
  };
  englishAssertion?: string;
  punjabiAssertion?: string;
  englishReason?: string;
  punjabiReason?: string;
  displayId?: string;
}

export interface StudyNote {
  id: string;
  title: string;
  boardId: string;
  examId: string;
  subjectId: string;
  category: string;
  pdfUrl: string;
  storagePath: string;
  isFree: boolean;
  status: ContentStatus;
  author: string;
  createdAt: any;
  updatedAt: any;
  fileMeta?: {
    name: string;
    size: number;
    type: string;
  };
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: any;
}

export interface CalendarEvent {
  id: string;
  board: string;
  post: string;
  date: string;
  status: string;
  type: string;
  color?: string;
  published: boolean;
  createdAt: any;
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
  createdAt: any;
  updatedAt?: any;
}

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  published: boolean;
  displayOrder: number;
  createdAt: any;
  updatedAt?: any;
}

export interface Vacancy {
  id: string;
  title: string;
  department: string;
  board: string;
  status: ContentStatus;
  publishedAt?: any;
  lastDate: string;
  totalPosts: string;
  education?: string;
  salary?: string;
  applyLink: string;
  officialWebsite: string;
  notificationPdfUrl?: string;
  officialNoticeUrl?: string;
  helpdeskUrl?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isUrgent?: boolean;
  isTrending?: boolean;
  showOnHomepage?: boolean;
  locationDetail?: string;
  qualificationDetail?: string;
  selectionProcess?: string;
  applicationFee?: string;
  paymentMode?: string;
  startDate?: string;
  examDate?: string;
  resultDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  adNumber?: string;
  type?: string;
  district?: string;
  gradePay?: string;
  ageLimit?: string;
  ageRelaxation?: string;
  experience?: string;
  category?: string;
  payMatrix?: string;
  payLevel?: string;
  medicalStandards?: string;
  physicalStandards?: string;
  feeLastDate?: string;
  sendNotification?: boolean;
  priority?: number;
  views?: number;
  clicks?: number;
  saves?: number;
  shares?: number;
  postName?: string;
  recruitmentName?: string;
  categoryWisePosts?: any[];
}

export type AdType = 'BANNER' | 'ADSENSE' | 'HTML';
export type AdStatus = 'ACTIVE' | 'PAUSED' | 'SCHEDULED';
export type AdPlacementType = 'HOMEPAGE_TOP' | 'HOMEPAGE_MIDDLE' | 'HOMEPAGE_BOTTOM' | 'EXAM_LISTING' | 'MOCK_LISTING' | 'NOTES_PAGE' | 'CA_PAGE' | 'RESULT_PAGE' | 'SIDEBAR' | 'FOOTER';

export interface Ad {
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
    examIds: string[];
  };
  stats?: {
    impressions: number;
    clicks: number;
  };
  createdAt: any;
  updatedAt: any;
}

export interface Advertisement extends Ad {}

export interface CurrentAffairHubItem {
  id: string;
  title: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  month: string;
  year: string;
  status: ContentStatus;
  language: string;
  duration: number;
  positiveMarks: number;
  negativeMarks: number;
  pdfUrl?: string;
  quizId?: string;
  createdAt: any;
  updatedAt: any;
}
