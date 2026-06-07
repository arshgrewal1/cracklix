
'use client';

import { create } from 'zustand';
import { AttemptState, ExamLanguage, QuestionStatus, Question, LanguageDisplayMode } from '@/types';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileOverview Elite CBT Global Store v31.1 (Production Hardened).
 * FIXED: setPaused recalibrates endTime correctly to prevent timer drift.
 */

interface ExamStore extends AttemptState {
  questions: Question[];
  mockId: string;
  mockTitle: string;
  userId: string;
  language: ExamLanguage | LanguageDisplayMode;
  baseLanguageMode: LanguageDisplayMode;
  isPaused: boolean;
  isSubmitting: boolean;
  isPaletteVisible: boolean;

  // Actions
  initExam: (mockId: string, mockTitle: string, userId: string, questions: Question[], duration: number, savedState?: any, languageMode?: LanguageDisplayMode) => void;
  setLanguage: (lang: ExamLanguage | LanguageDisplayMode) => void;
  setPaused: (val: boolean) => void;
  setCurrentIdx: (idx: number) => void;
  setAnswer: (idx: number, optionIdx: number | null, db: any) => void;
  clearAnswer: (idx: number, db: any) => void;
  markForReview: (idx: number, db: any) => void;
  saveAndNext: (db: any) => void;
  tick: () => void;
  addViolation: (db: any) => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  questions: [],
  mockId: '',
  mockTitle: '',
  userId: '',
  language: '',
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
    const state = get();
    
    if (state.mockId === mockId && state.questions.length > 0 && !savedState) return;

    const isCompleted = savedState?.status === 'COMPLETED';
    const isTimedOut = savedState?.endTime && now >= savedState.endTime;
    const isStale = isCompleted || isTimedOut;

    const finalEndTime = isStale ? (now + (duration * 60 * 1000)) : (savedState?.endTime || (now + (duration * 60 * 1000)));
    const timeLeft = Math.max(0, Math.floor((finalEndTime - now) / 1000));
    const finalBaseMode = languageMode || 'ENGLISH_PUNJABI';

    let initialLang = (state.language && state.language !== '') ? (state.language as string) : finalBaseMode;
    
    if (finalBaseMode === 'ENGLISH_PUNJABI' && initialLang.includes('HINDI')) {
      initialLang = 'ENGLISH_PUNJABI';
    } else if (finalBaseMode === 'ENGLISH_HINDI' && initialLang.includes('PUNJABI')) {
      initialLang = 'ENGLISH_HINDI';
    }

    set({
      mockId,
      mockTitle,
      userId,
      questions,
      timeLeft,
      baseLanguageMode: finalBaseMode,
      language: initialLang as LanguageDisplayMode, 
      startTime: isStale ? now : (savedState?.startTime || now),
      endTime: finalEndTime,
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

    if (userId && mockId && !savedState) {
      const { firestore: db } = initializeFirebase();
      const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
      setDoc(attemptRef, {
        userId, mockId, startTime: now, endTime: finalEndTime,
        status: 'IN_PROGRESS', updatedAt: serverTimestamp()
      }, { merge: true }).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: attemptRef.path, operation: 'create' }));
      });
    }
  },

  setLanguage: (lang) => set({ language: lang }),
  
  setPaused: (val) => {
    const { timeLeft, userId, mockId } = get();
    const now = Date.now();
    
    if (!val) {
       const newEndTime = now + (timeLeft * 1000);
       set({ isPaused: false, endTime: newEndTime });
       
       if (userId && mockId) {
          const { firestore: db } = initializeFirebase();
          updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), {
             endTime: newEndTime,
             updatedAt: serverTimestamp()
          }).catch(() => {});
       }
    } else {
       set({ isPaused: true });
    }
  },

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
    if (!userId || !mockId || !db) return;

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

    updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), {
      [`answers.${idx}`]: optionIdx,
      [`status.${idx}`]: newStatus[idx],
      updatedAt: serverTimestamp()
    }).catch(() => {});
  },

  clearAnswer: (idx, db) => {
    const { answers, status, userId, mockId } = get();
    if (!userId || !mockId || !db) return;

    const newAnswers = { ...answers };
    const newStatus = { ...status };
    delete newAnswers[idx];
    newStatus[idx] = 'not-answered';
    set({ answers: newAnswers, status: newStatus });

    updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), {
      [`answers.${idx}`]: null,
      [`status.${idx}`]: 'not-answered',
      updatedAt: serverTimestamp()
    }).catch(() => {});
  },

  markForReview: (idx, db) => {
    const { status, answers, userId, mockId } = get();
    if (!userId || !mockId || !db) return;

    const newStatus = { ...status };
    const hasAnswer = answers[idx] !== undefined;
    newStatus[idx] = hasAnswer ? 'answered-marked' : 'marked';
    set({ status: newStatus });

    updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), {
      [`status.${idx}`]: newStatus[idx],
      updatedAt: serverTimestamp()
    }).catch(() => {});
    
    get().saveAndNext(db);
  },

  saveAndNext: (db) => {
    const { currentIdx, questions } = get();
    if (currentIdx < questions.length - 1) {
      get().setCurrentIdx(currentIdx + 1);
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
    if (!userId || !mockId || !db) return;
    
    const newVal = (violations || 0) + 1;
    set({ violations: newVal });
    updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { 
      violations: newVal,
      updatedAt: serverTimestamp()
    }).catch(() => {});
  }
}));
