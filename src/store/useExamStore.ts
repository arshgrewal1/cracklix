
import { create } from 'zustand';
import { AttemptState, ExamLanguage, QuestionStatus, Question, LanguageDisplayMode } from '@/types';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

/**
 * @fileOverview Enterprise CBT Global Store v22.0.
 * Updated: Filtered Language Registry logic to support Admin-defined base modes.
 */

interface ExamStore extends AttemptState {
  questions: Question[];
  mockId: string;
  mockTitle: string;
  userId: string;
  language: ExamLanguage | LanguageDisplayMode;
  baseLanguageMode: LanguageDisplayMode; // Master config from Admin
  isPaused: boolean;
  isSubmitting: boolean;
  isPaletteVisible: boolean;

  // Actions
  initExam: (mockId: string, mockTitle: string, userId: string, questions: Question[], duration: number, savedState?: any, languageMode?: LanguageDisplayMode) => void;
  setLanguage: (lang: ExamLanguage | LanguageDisplayMode) => void;
  setPaused: (paused: boolean) => void;
  setPaletteVisible: (visible: boolean) => void;
  togglePalette: () => void;
  setCurrentIdx: (idx: number) => void;
  setAnswer: (idx: number, optionIdx: number | null, db: any) => void;
  clearAnswer: (idx: number, db: any) => void;
  markForReview: (idx: number, db: any) => void;
  saveAndNext: (db: any) => void;
  tick: () => void;
  addViolation: (db: any) => void;
  toggleBookmark: (idx: number, db: any) => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  questions: [],
  mockId: '',
  mockTitle: '',
  userId: '',
  language: 'ENGLISH_PUNJABI',
  baseLanguageMode: 'ENGLISH_PUNJABI',
  isPaused: false,
  isSubmitting: false,
  isPaletteVisible: true,

  answers: {},
  status: {},
  visited: [0],
  bookmarks: [],
  timeLeft: 0,
  currentIdx: 0,
  currentSectionId: '',
  violations: 0,
  startTime: 0,
  endTime: 0,

  initExam: (mockId, mockTitle, userId, questions, duration, savedState, languageMode) => {
    const now = Date.now();
    
    let isStale = false;
    if (savedState?.status === 'COMPLETED' || (savedState?.endTime && now >= savedState.endTime)) {
      isStale = true;
    }

    const endTime = isStale ? (now + (duration * 60 * 1000)) : (savedState?.endTime || (now + (duration * 60 * 1000)));
    const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
    
    const finalBaseMode = languageMode || 'ENGLISH_PUNJABI';

    set({
      mockId,
      mockTitle,
      userId,
      questions,
      timeLeft,
      baseLanguageMode: finalBaseMode,
      language: finalBaseMode, // Aspirant defaults to Admin's choice
      startTime: isStale ? now : (savedState?.startTime || now),
      endTime,
      answers: isStale ? {} : (savedState?.answers || {}),
      status: isStale ? {} : (savedState?.status || {}),
      visited: isStale ? [0] : Array.from(new Set([...(savedState?.visited || []), 0])),
      bookmarks: isStale ? [] : (savedState?.bookmarks || []),
      violations: isStale ? 0 : (savedState?.violations || 0),
      currentIdx: isStale ? 0 : (savedState?.currentIdx || 0),
      currentSectionId: questions[isStale ? 0 : (savedState?.currentIdx || 0)]?.sectionId || '',
      isPaused: false,
      isSubmitting: false
    });
  },

  setLanguage: (language) => set({ language }),
  setPaused: (isPaused) => set({ isPaused }),
  setPaletteVisible: (isPaletteVisible) => set({ isPaletteVisible }),
  togglePalette: () => set((state) => ({ isPaletteVisible: !state.isPaletteVisible })),

  setCurrentIdx: (idx) => {
    const { visited, questions, userId, mockId } = get();
    if (idx < 0 || idx >= questions.length) return;
    
    const newVisited = Array.from(new Set([...visited, idx]));
    set({ 
      currentIdx: idx, 
      visited: newVisited,
      currentSectionId: questions[idx]?.sectionId || ''
    });
    
    if (userId && mockId) {
      const { firestore: db } = initializeFirebase();
      updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), {
         currentIdx: idx,
         visited: newVisited,
         updatedAt: serverTimestamp()
      }).catch(() => {});
    }
  },

  setAnswer: (idx, optionIdx, db) => {
    const { answers, status, userId, mockId } = get();
    if (!userId || !mockId) return;

    const newAnswers = { ...answers };
    const newStatus = { ...status };

    if (optionIdx === null) {
      delete newAnswers[idx];
      newStatus[idx] = 'not-answered';
    } else {
      newAnswers[idx] = optionIdx;
      newStatus[idx] = 'answered';
    }

    set({ answers: newAnswers, status: newStatus });

    const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
    updateDoc(attemptRef, {
      [`answers.${idx}`]: optionIdx,
      [`status.${idx}`]: newStatus[idx],
      updatedAt: serverTimestamp()
    }).catch(() => {});
  },

  clearAnswer: (idx, db) => {
    const { answers, status, userId, mockId } = get();
    if (!userId || !mockId) return;

    const newAnswers = { ...answers };
    const newStatus = { ...status };
    delete newAnswers[idx];
    newStatus[idx] = 'not-answered';
    set({ answers: newAnswers, status: newStatus });

    const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
    updateDoc(attemptRef, {
      [`answers.${idx}`]: null,
      [`status.${idx}`]: 'not-answered',
      updatedAt: serverTimestamp()
    }).catch(() => {});
  },

  markForReview: (idx, db) => {
    const { status, answers, userId, mockId } = get();
    if (!userId || !mockId) return;

    const newStatus = { ...status };
    const hasAnswer = answers[idx] !== undefined;
    newStatus[idx] = hasAnswer ? 'answered-marked' : 'marked';
    set({ status: newStatus });

    const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
    updateDoc(attemptRef, {
      [`status.${idx}`]: newStatus[idx],
      updatedAt: serverTimestamp()
    }).catch(() => {});
    
    get().saveAndNext(db);
  },

  saveAndNext: (db) => {
    const { currentIdx, questions, userId, mockId, visited } = get();
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      const newVisited = Array.from(new Set([...visited, nextIdx]));
      set({ 
        currentIdx: nextIdx, 
        visited: newVisited,
        currentSectionId: questions[nextIdx]?.sectionId || ''
      });
      
      if (userId && mockId) {
        const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
        updateDoc(attemptRef, {
          currentIdx: nextIdx,
          visited: newVisited,
          updatedAt: serverTimestamp()
        }).catch(() => {});
      }
    }
  },

  tick: () => {
    const { endTime, isPaused, isSubmitting } = get();
    if (!isPaused && !isSubmitting && endTime > 0) {
      const now = Date.now();
      const remain = Math.max(0, Math.floor((endTime - now) / 1000));
      if (get().timeLeft !== remain) {
        set({ timeLeft: remain });
      }
    }
  },

  addViolation: (db) => {
    const { violations, userId, mockId } = get();
    if (!userId || !mockId) return;
    
    const newVal = (violations || 0) + 1;
    set({ violations: newVal });
    updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { 
      violations: newVal,
      updatedAt: serverTimestamp()
    }).catch(() => {});
  },

  toggleBookmark: (idx, db) => {
    const { bookmarks, userId, mockId } = get();
    if (!userId || !mockId) return;

    const next = bookmarks.includes(idx) ? bookmarks.filter(i => i !== idx) : [...bookmarks, idx];
    set({ bookmarks: next });
    updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { 
      bookmarks: next,
      updatedAt: serverTimestamp()
    }).catch(() => {});
  }
}));
