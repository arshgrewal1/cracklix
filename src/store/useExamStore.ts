'use client';

import { create } from "zustand";
import { 
  Question, 
  QuestionStatus, 
  LanguageDisplayMode 
} from "@/types";
import { Firestore, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface ExamStoreState {
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
    const finalLang: LanguageDisplayMode = (languageMode || "ENGLISH_PUNJABI") as LanguageDisplayMode;
    const isResuming = resumeData && resumeData.status !== 'COMPLETED';
    
    set({
      mockId,
      mockTitle: title,
      userId,
      questions,
      isPaused: false,
      language: finalLang,
      baseLanguageMode: finalLang,
      answers: isResuming ? (resumeData.answers || {}) : {},
      status: isResuming ? (resumeData.statusMap || {}) : {},
      visited: isResuming ? (resumeData.visited || [0]) : [0],
      bookmarks: isResuming ? (resumeData.bookmarks || []) : [],
      timeLeft: isResuming ? (resumeData.timeLeft || duration * 60) : (duration * 60),
      currentIdx: isResuming ? (resumeData.currentIdx || 0) : 0,
      startTime: isResuming ? (resumeData.startTime || Date.now()) : Date.now(),
      violations: isResuming ? (resumeData.violations || 0) : 0,
    });
  },

  tick: () => {
    const state = get();
    if (state.questions.length > 0 && state.timeLeft > 0 && !state.isPaused) {
      set({ timeLeft: state.timeLeft - 1 });
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
    const state = get();
    const newAnswers = { ...state.answers, [idx]: optIdx };
    const newStatus = { ...state.status, [idx]: 'answered' as QuestionStatus };
    
    set({ answers: newAnswers, status: newStatus });

    if (db && state.userId && state.mockId) {
      const attemptRef = doc(db, "attempts", `${state.userId}_${state.mockId}`);
      setDoc(attemptRef, {
        answers: newAnswers,
        statusMap: newStatus,
        visited: state.visited,
        bookmarks: state.bookmarks,
        timeLeft: state.timeLeft,
        currentIdx: state.currentIdx,
        violations: state.violations,
        startTime: state.startTime,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(() => {});
    }
  },

  clearAnswer: (idx, db) => {
    const state = get();
    const newAnswers = { ...state.answers };
    delete newAnswers[idx];
    const newStatus = { ...state.status, [idx]: 'not-answered' as QuestionStatus };
    
    set({ answers: newAnswers, status: newStatus });

    if (db && state.userId && state.mockId) {
      const attemptRef = doc(db, "attempts", `${state.userId}_${state.mockId}`);
      updateDoc(attemptRef, { 
         answers: newAnswers, 
         statusMap: newStatus, 
         updatedAt: serverTimestamp() 
      }).catch(() => {});
    }
  },

  markForReview: (idx, db) => {
    const state = get();
    const hasAnswer = state.answers[idx] !== undefined && state.answers[idx] !== null;
    const newStatus = { ...state.status, [idx]: (hasAnswer ? 'answered-marked' : 'marked') as QuestionStatus };
    
    set({ status: newStatus });

    if (db && state.userId && state.mockId) {
      const attemptRef = doc(db, "attempts", `${state.userId}_${state.mockId}`);
      updateDoc(attemptRef, { statusMap: newStatus, updatedAt: serverTimestamp() }).catch(() => {});
    }
  },

  saveAndNext: (db) => {
    const state = get();
    if (state.currentIdx < (state.questions?.length || 0) - 1) {
      const nextIdx = state.currentIdx + 1;
      state.setCurrentIdx(nextIdx);
    }
  },

  addViolation: (db: Firestore | null) => {
    const state = get();
    const nextVal = (state.violations || 0) + 1;
    
    set({ violations: nextVal });

    if (db && state.userId && state.mockId) {
      const attemptRef = doc(db, "attempts", `${state.userId}_${state.mockId}`);
      setDoc(attemptRef, { 
        violations: nextVal, 
        updatedAt: serverTimestamp() 
      }, { merge: true }).catch(() => {});
    }
  }
}));

export default useExamStore;
