
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'STUDENT';
export type MockType = 'FULL' | 'SUBJECT' | 'SECTIONAL' | 'CHAPTER' | 'PYQ' | 'CA_QUIZ' | 'PRACTICE_SET';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type QuestionLifecycleStatus = 'UNUSED' | 'USED' | 'LOCKED' | 'DUPLICATE' | 'REPEATED';
export type Gender = 'Male' | 'Female' | 'Other';
export type AccessType = 'FREE' | 'PREMIUM';
export type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';
export type ExamLanguage = 'en' | 'pa' | 'hi' | 'bilingual';

export type LanguageDisplayMode = 'ENGLISH' | 'PUNJABI' | 'HINDI' | 'ENGLISH_PUNJABI' | 'ENGLISH_HINDI';

export type CurrentAffairType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUIZ' | 'SPECIAL';

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
  examId: string;
  mockType: MockType;
  accessType: AccessType;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarks: number;
  positiveMarks: number;
  questionIds: string[];
  sections: ExamSection[];
  published: boolean;
  languageMode: LanguageDisplayMode;
  attemptLimit: number; // 0 for unlimited
  createdAt: any;
  updatedAt: any;
}

export interface CurrentAffairHubItem {
  id: string;
  title: string;
  month: string;
  year: string;
  language: string;
  category: string;
  type: CurrentAffairType;
  pdfUrl?: string;
  status: 'PUBLISHED' | 'DRAFT';
  quizId?: string;
  questions?: Partial<Question>[];
  createdAt: any;
  updatedAt: any;
}

export interface Question {
  id: string;
  examId: string;
  sectionId: string;
  partId?: string;
  englishQuestion: string;
  punjabiQuestion: string;
  hindiQuestion?: string;
  optionAEnglish: string;
  optionAPunjabi: string;
  optionAHindi?: string;
  optionBEnglish: string;
  optionBPunjabi: string;
  optionBHindi?: string;
  optionCEnglish: string;
  optionCPunjabi: string;
  optionCHindi?: string;
  optionDEnglish: string;
  optionDPunjabi: string;
  optionDHindi?: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  englishExplanation: string;
  punjabiExplanation: string;
  hindiExplanation?: string;
  difficulty: Difficulty;
  subjectId: string;
  topic?: string;
  language?: string;
  
  // Usage Tracking
  status: QuestionLifecycleStatus;
  usedCount: number;
  lastUsedDate?: string;
  mockIdsUsedIn?: string[];
  isDuplicateOf?: string;
}

export interface AttemptState {
  answers: Record<number, number>; // index: optionIndex
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
  createdAt: string;
  status: string;
  passExpiryDate?: string;
  photoURL?: string;
  gender?: Gender;
  subscriptions?: string[];
  pinnedExams?: string[];
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
  stats: {
    impressions: number;
    clicks: number;
  };
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
