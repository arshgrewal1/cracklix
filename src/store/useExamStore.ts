import { create } from "zustand";
import { 
  Question, 
  QuestionStatus, 
  LanguageDisplayMode 
} from "@/types";
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ExamStoreState {
  // State
  mockId: string | null;
  mockTitle: string;
  userId: string | null;
  questions: Question[];
  answers: Record<number, number | null>;
  status: Record<number, QuestionStatus>;
  visited: number[];
  bookmarks: number[];
  timeLeft: number;
  currentIdx: number;
  isPaused: boolean;
  startTime: number;
  language: LanguageDisplayMode;
  baseLanguageMode: LanguageDisplayMode;
  violations: number;

  // Actions
  initExam: (
    mockId: string, 
    title: string, 
    userId: string, 
    questions: Question[], 
    duration: number, 
    resumeData?: any,
    languageMode?: LanguageDisplayMode
  ) => void;
  tick: () => void;
  setPaused: (paused: boolean) => void;
  setCurrentIdx: (idx: number) => void;
  setLanguage: (lang: LanguageDisplayMode) => void;
  setAnswer: (idx: number, optIdx: number, db: Firestore | null) => void;
  clearAnswer: (idx: number, db: Firestore | null) => void;
  markForReview: (idx: number, db: Firestore | null) => void;
  saveAndNext: (db: Firestore | null) => void;
  addViolation: (db: Firestore | null) => void;
}

export const useExamStore = create<ExamStoreState>((set, get) => ({
  mockId: null,
  mockTitle: "",
  userId: null,
  questions: [],
  answers: {},
  status: {},
  visited: [0],
  bookmarks: [],
  timeLeft: 0,
  currentIdx: 0,
  isPaused: false,
  startTime: 0,
  language: "ENGLISH_PUNJABI",
  baseLanguageMode: "ENGLISH_PUNJABI",
  violations: 0,

  initExam: (mockId, title, userId, questions, duration, resumeData, languageMode) => {
    if (resumeData && resumeData.status !== 'COMPLETED') {
      set({
        mockId,
        mockTitle: title,
        userId,
        questions,
        answers: resumeData.answers || {},
        status: resumeData.statusMap || {},
        visited: resumeData.visited || [0],
        bookmarks: resumeData.bookmarks || [],
        timeLeft: resumeData.timeLeft || duration * 60,
        currentIdx: resumeData.currentIdx || 0,
        isPaused: false,
        startTime: resumeData.startTime || Date.now(),
        violations: resumeData.violations || 0,
        language: languageMode || "ENGLISH_PUNJABI",
        baseLanguageMode: languageMode || "ENGLISH_PUNJABI",
      });
    } else {
      set({
        mockId,
        mockTitle: title,
        userId,
        questions,
        answers: {},
        status: {},
        visited: [0],
        bookmarks: [],
        timeLeft: duration * 60,
        currentIdx: 0,
        isPaused: false,
        startTime: Date.now(),
        violations: 0,
        language: languageMode || "ENGLISH_PUNJABI",
        baseLanguageMode: languageMode || "ENGLISH_PUNJABI",
      });
    }
  },

  tick: () => {
    const { timeLeft, isPaused } = get();
    if (timeLeft > 0 && !isPaused) {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  setPaused: (isPaused) => set({ isPaused }),

  setCurrentIdx: (currentIdx) => {
    const { visited } = get();
    set({ 
      currentIdx,
      visited: visited.includes(currentIdx) ? visited : [...visited, currentIdx]
    });
  },

  setLanguage: (language) => set({ language }),

  setAnswer: (idx, optIdx, db) => {
    const { answers, status, mockId, userId, visited, bookmarks, timeLeft, currentIdx, violations, startTime } = get();
    const newAnswers = { ...answers, [idx]: optIdx };
    const newStatus = { ...status, [idx]: 'answered' as QuestionStatus };
    
    set({ answers: newAnswers, status: newStatus });

    if (db && userId && mockId) {
      const attemptRef = doc(db, "attempts", `${userId}_${mockId}`);
      setDoc(attemptRef, {
        answers: newAnswers,
        statusMap: newStatus,
        visited,
        bookmarks,
        timeLeft,
        currentIdx,
        violations,
        startTime,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  },

  clearAnswer: (idx, db) => {
    const { answers, status, userId, mockId } = get();
    const newAnswers = { ...answers };
    delete newAnswers[idx];
    const newStatus = { ...status, [idx]: 'not-answered' as QuestionStatus };
    
    set({ answers: newAnswers, status: newStatus });

    if (db && userId && mockId) {
      const attemptRef = doc(db, "attempts", `${userId}_${mockId}`);
      setDoc(attemptRef, { answers: newAnswers, statusMap: newStatus, updatedAt: serverTimestamp() }, { merge: true });
    }
  },

  markForReview: (idx, db) => {
    const { status, answers, userId, mockId } = get();
    const hasAnswer = answers[idx] !== undefined && answers[idx] !== null;
    const newStatus = { ...status, [idx]: (hasAnswer ? 'answered-marked' : 'marked') as QuestionStatus };
    
    set({ status: newStatus });

    if (db && userId && mockId) {
      const attemptRef = doc(db, "attempts", `${userId}_${mockId}`);
      setDoc(attemptRef, { statusMap: newStatus, updatedAt: serverTimestamp() }, { merge: true });
    }
  },

  saveAndNext: (db) => {
    const { currentIdx, questions, setCurrentIdx } = get();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  },

  addViolation: (db) => {
    const { violations, userId, mockId } = get();
    const newVal = violations + 1;
    set({ violations: newVal });

    if (db && userId && mockId) {
      const attemptRef = doc(db, "attempts", `${userId}_${mockId}`);
      setDoc(attemptRef, { violations: newVal, updatedAt: serverTimestamp() }, { merge: true });
    }
  }
}));

export default useExamStore;