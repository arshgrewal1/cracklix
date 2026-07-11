
export interface StudySession {
  id: string;
  userId: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  duration: number; // in seconds
  activityType: 'mock' | 'practice' | 'notes' | 'pyq' | 'current-affairs' | 'quiz';
}

export interface UserStudyAnalytics {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  lifetime: number;
  currentStreak: number;
  longestStreak: number;
  dailyAverage: number;
  mostStudiedSubject: string | null;
  longestSession: number;
}
