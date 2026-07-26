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
  createdAt: any;
  updatedAt: any;
  lastLoginAt?: any;
  activeDeviceId?: string;
  passStatus: 'active' | 'expired' | 'none';
  passExpiresAt?: string;
  photoURL?: string;
  gender?: Gender;
  pinnedExams?: string[];
  savedVacancies?: string[];
  savedCA?: string[];
  // Platform-Wide Aggregates
  totalTests?: number;
  highestScore?: number;
  averageAccuracy?: number;
  averageTime?: number;
  bestRank?: number;
  studyStats?: StudyStats;
  pass?: {
    active: boolean;
    plan: string;
    purchaseDate: string;
    expiryDate: string;
    allowedSeries?: string[];
    allowedCategories?: string[];
  };
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
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  photoURL?: string;
  gender?: Gender;
  mockId: string;
  highestScore: number;
  accuracy: number;
  timeTaken: number;
  attemptCount: number;
  bestAttemptId: string;
  submittedAt: any;
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
  createdAt: any;
  updatedAt: any;
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
}

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  published: boolean;
  displayOrder: number;
  createdAt: any;
}

export interface Vacancy {
  id: string;
  title: string;
  department: string;
  board: string;
  category: string;
  type: string;
  adNumber: string;
  postName: string;
  totalPosts: string;
  salary: string;
  ageLimit: string;
  education: string;
  experience: string;
  selectionProcess: string;
  applicationFee: string;
  officialWebsite: string;
  applyLink: string;
  state: "Punjab";
  district: string;
  startDate: string;
  lastDate: string;
  examDate?: string;
  admitCardDate?: string;
  resultDate?: string;
  status: ContentStatus;
  isFeatured?: boolean;
  isBreaking?: boolean;
  showOnHomepage?: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  notificationPdfUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: any;
  updatedAt?: any;
}
