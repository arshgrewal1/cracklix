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
  isGuest: boolean;

  initExam: (
    mockId: string, 
    title: string, 
    userId: string | null, 
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
  persistGuestData: (force?: boolean) => void;
}

/**
 * @fileOverview Hardened Mock Test Store v4.9 [Timer Fixed].
 * FIXED: startTime is strictly initialized once per session to prevent massive duration bugs.
 */
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
  isGuest: false,

  initExam: (mockId, title, userId, questions, duration, resumeData, languageMode) => {
    const finalLang: LanguageDisplayMode = (languageMode || "ENGLISH_PUNJABI") as LanguageDisplayMode;
    
    // Clear any stale local data before starting a truly fresh exam
    if (!resumeData && typeof window !== 'undefined') {
      localStorage.removeItem(`cracklix_guest_attempt_${mockId}`);
    }

    let effectiveResume = resumeData;
    if (!effectiveResume && !userId && typeof window !== 'undefined') {
       const stored = localStorage.getItem(`cracklix_guest_attempt_${mockId}`);
       if (stored) {
          try { effectiveResume = JSON.parse(stored); } catch (e) { console.error("[Sync] Local data corrupted."); }
       }
    }

    const isResuming = effectiveResume && effectiveResume.status !== 'COMPLETED';
    
    // Reset or resume the startTime node
    const now = Date.now();
    const finalStartTime = isResuming ? (effectiveResume.startTime || now) : now;

    set({
      mockId,
      mockTitle: title,
      userId,
      isGuest: !userId,
      questions,
      isPaused: false,
      language: finalLang,
      baseLanguageMode: finalLang,
      answers: isResuming ? (effectiveResume.answers || {}) : {},
      status: isResuming ? (effectiveResume.statusMap || {}) : {},
      visited: isResuming ? (effectiveResume.visited || [0]) : [0],
      bookmarks: isResuming ? (effectiveResume.bookmarks || []) : [],
      timeLeft: isResuming ? (effectiveResume.timeLeft || duration * 60) : (duration * 60),
      currentIdx: isResuming ? (effectiveResume.currentIdx || 0) : 0,
      startTime: finalStartTime,
      violations: isResuming ? (effectiveResume.violations || 0) : 0,
    });
  },

  tick: () => {
    const state = get();
    if (state.questions.length > 0 && state.timeLeft > 0 && !state.isPaused) {
      const nextTime = state.timeLeft - 1;
      set({ timeLeft: nextTime });
      if (nextTime % 30 === 0) state.persistGuestData();
    }
  },

  setPaused: (isPaused) => set({ isPaused }),

  setCurrentIdx: (currentIdx) => {
    const { visited } = get();
    set({ 
      currentIdx,
      visited: visited.includes(currentIdx) ? visited : [...visited, currentIdx]
    });
    get().persistGuestData(true);
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
    } else {
      state.persistGuestData(true);
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
    } else {
      state.persistGuestData(true);
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
    } else {
      state.persistGuestData(true);
    }
  },

  saveAndNext: (db) => {
    const state = get();
    if (state.currentIdx < (state.questions?.length || 0) - 1) {
      state.setCurrentIdx(state.currentIdx + 1);
    }
  },

  addViolation: (db: Firestore | null) => {
    const state = get();
    const nextVal = (state.violations || 0) + 1;
    
    set({ violations: nextVal });

    if (db && state.userId && state.mockId) {
      const attemptRef = doc(db, "attempts", `${state.userId}_${state.mockId}`);
      updateDoc(attemptRef, { 
        violations: nextVal, 
        updatedAt: serverTimestamp() 
      }).catch(() => {});
    }
  },

  persistGuestData: (force = false) => {
    if (typeof window === 'undefined') return;
    const state = get();
    if (!state.userId && state.mockId) {
       const payload = {
          answers: state.answers,
          statusMap: state.status,
          visited: state.visited,
          bookmarks: state.bookmarks,
          timeLeft: state.timeLeft,
          currentIdx: state.currentIdx,
          startTime: state.startTime,
          violations: state.violations,
          status: 'IN_PROGRESS'
       };
       localStorage.setItem(`cracklix_guest_attempt_${state.mockId}`, JSON.stringify(payload));
    }
  }
}));

export default useExamStore;
