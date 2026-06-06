
import { create } from 'zustand';
import { AttemptState, ExamLanguage, QuestionStatus, Question } from '@/types';
import { Firestore, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface ExamStore extends AttemptState {
  questions: Question[];
  mockId: string;
  mockTitle: string;
  userId: string;
  language: ExamLanguage;
  isPaused: boolean;
  isSubmitting: boolean;

  // Actions
  initExam: (mockId: string, mockTitle: string, userId: string, questions: Question[], duration: number, savedState?: any) => void;
  setLanguage: (lang: ExamLanguage) => void;
  setPaused: (paused: boolean) => void;
  setCurrentIdx: (idx: number) => void;
  setAnswer: (idx: number, optionIdx: number | null, db?: Firestore) => Promise<void>;
  clearAnswer: (idx: number, db?: Firestore) => Promise<void>;
  markForReview: (idx: number, db?: Firestore) => Promise<void>;
  saveAndNext: (db?: Firestore) => void;
  tick: () => void;
  addViolation: (db?: Firestore) => void;
  toggleBookmark: (idx: number, db?: Firestore) => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  questions: [],
  mockId: '',
  mockTitle: '',
  userId: '',
  language: 'bilingual',
  isPaused: false,
  isSubmitting: false,

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

  initExam: (mockId, mockTitle, userId, questions, duration, savedState) => {
    const now = Date.now();
    const endTime = savedState?.endTime || now + (duration * 60 * 1000);
    const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
    
    set({
      mockId,
      mockTitle,
      userId,
      questions,
      timeLeft,
      startTime: savedState?.startTime || now,
      endTime,
      ...savedState,
      currentIdx: savedState?.currentIdx || 0,
      visited: Array.from(new Set([...(savedState?.visited || []), 0])),
      currentSectionId: questions[savedState?.currentIdx || 0]?.sectionId || '',
    });
  },

  setLanguage: (language) => set({ language }),
  setPaused: (isPaused) => set({ isPaused }),

  setCurrentIdx: (idx) => {
    const { visited, questions } = get();
    set({ 
      currentIdx: idx, 
      visited: Array.from(new Set([...visited, idx])),
      currentSectionId: questions[idx]?.sectionId || ''
    });
  },

  setAnswer: async (idx, optionIdx, db) => {
    const { answers, status, userId, mockId } = get();
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

    if (db && userId && mockId) {
      const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
      await updateDoc(attemptRef, {
        [`answers.${idx}`]: optionIdx,
        [`status.${idx}`]: newStatus[idx],
        updatedAt: serverTimestamp()
      });
    }
  },

  clearAnswer: async (idx, db) => {
    const { answers, status, userId, mockId } = get();
    const newAnswers = { ...answers };
    const newStatus = { ...status };
    delete newAnswers[idx];
    newStatus[idx] = 'not-answered';
    set({ answers: newAnswers, status: newStatus });

    if (db && userId && mockId) {
      const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
      await updateDoc(attemptRef, {
        [`answers.${idx}`]: null,
        [`status.${idx}`]: 'not-answered',
        updatedAt: serverTimestamp()
      });
    }
  },

  markForReview: async (idx, db) => {
    const { status, answers, userId, mockId } = get();
    const newStatus = { ...status };
    const hasAnswer = answers[idx] !== undefined;
    newStatus[idx] = hasAnswer ? 'answered-marked' : 'marked';
    set({ status: newStatus });

    if (db && userId && mockId) {
      const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
      await updateDoc(attemptRef, {
        [`status.${idx}`]: newStatus[idx],
        updatedAt: serverTimestamp()
      });
    }
    get().saveAndNext(db);
  },

  saveAndNext: (db) => {
    const { currentIdx, questions, userId, mockId } = get();
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      get().setCurrentIdx(nextIdx);
      
      if (db && userId && mockId) {
        const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
        updateDoc(attemptRef, {
          currentIdx: nextIdx,
          visited: get().visited,
          updatedAt: serverTimestamp()
        });
      }
    }
  },

  tick: () => {
    const { endTime, isPaused, isSubmitting } = get();
    if (!isPaused && !isSubmitting) {
      const now = Date.now();
      const remain = Math.max(0, Math.floor((endTime - now) / 1000));
      set({ timeLeft: remain });
    }
  },

  addViolation: async (db) => {
    const { violations, userId, mockId } = get();
    const newVal = (violations || 0) + 1;
    set({ violations: newVal });
    if (db && userId && mockId) {
      await updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { violations: newVal });
    }
  },

  toggleBookmark: async (idx, db) => {
    const { bookmarks, userId, mockId } = get();
    const next = bookmarks.includes(idx) ? bookmarks.filter(i => i !== idx) : [...bookmarks, idx];
    set({ bookmarks: next });
    if (db && userId && mockId) {
      await updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { bookmarks: next });
    }
  }
}));
