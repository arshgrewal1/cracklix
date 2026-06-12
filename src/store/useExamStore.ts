
'use client';

import { create } from 'zustand';
import { AttemptState, ExamLanguage, QuestionStatus, Question, LanguageDisplayMode } from '@/types';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileOverview Elite CBT Global Store v39.0 (Production Hardened).
 * FIXED: Resolved re-take blank screen glitch by forcing a hard reset of ALL session state on re-initialization.
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
  isSyncing: boolean;

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
  isSyncing: false,

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
    
    // Explicitly identify re-takes or completed sessions to clear progress
    const isCompleted = savedState?.status === 'COMPLETED';
    const isTimedOut = savedState?.endTime && now >= savedState.endTime;
    const isStale = isCompleted || isTimedOut;

    // Reset progress completely if this is a stale/completed session (FIX FOR BLANK SCREEN/GLITCH)
    const actualStartTime = isStale ? now : (savedState?.startTime || now);
    const finalDuration = duration || 120;
    const finalEndTime = isStale ? (now + (finalDuration * 60 * 1000)) : (savedState?.endTime || (now + (finalDuration * 60 * 1000)));
    const timeLeft = Math.max(0, Math.floor((finalEndTime - now) / 1000));
    const finalBaseMode = languageMode || 'ENGLISH_PUNJABI';

    let initialLang = (state.language && state.language !== '') ? (state.language as string) : finalBaseMode;
    
    if (finalBaseMode === 'ENGLISH_PUNJABI' && initialLang.includes('HINDI')) {
      initialLang = 'ENGLISH_PUNJABI';
    } else if (finalBaseMode === 'ENGLISH_HINDI' && initialLang.includes('PUNJABI')) {
      initialLang = 'ENGLISH_HINDI';
    }

    set({
      mockId, mockTitle, userId, questions, timeLeft,
      baseLanguageMode: finalBaseMode,
      language: initialLang as LanguageDisplayMode, 
      startTime: actualStartTime,
      endTime: finalEndTime,
      answers: isStale ? {} : (savedState?.answers || {}),
      status: isStale ? {} : (savedState?.status || {}),
      visited: isStale ? [0] : Array.from(new Set([...(savedState?.visited || []), 0])),
      bookmarks: isStale ? [] : (savedState?.bookmarks || []),
      violations: isStale ? 0 : (savedState?.violations || 0),
      currentIdx: isStale ? 0 : (savedState?.currentIdx || 0),
      currentSectionId: questions[isStale ? 0 : (savedState?.currentIdx || 0)]?.sectionId || '',
      isPaused: false, isSubmitting: false, isSyncing: false
    });

    if (userId && mockId && (isStale || !savedState)) {
      const { firestore: db } = initializeFirebase();
      const attemptRef = doc(db, 'attempts', `${userId}_${mockId}`);
      setDoc(attemptRef, {
        userId, mockId, startTime: actualStartTime, endTime: finalEndTime,
        status: 'IN_PROGRESS', updatedAt: serverTimestamp(),
        // Force clear old answers if re-taking
        answers: isStale ? {} : (savedState?.answers || {}),
        status_map: isStale ? {} : (savedState?.status || {}),
        currentIdx: 0,
        visited: [0]
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
          updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { endTime: newEndTime, updatedAt: serverTimestamp() }).catch(() => {});
       }
    } else {
       set({ isPaused: true });
    }
  },

  setCurrentIdx: (idx) => {
    const { visited, questions, userId, mockId } = get();
    if (idx < 0 || idx >= questions.length) return;
    const newVisited = Array.from(new Set([...visited, idx]));
    set({ currentIdx: idx, visited: newVisited, currentSectionId: questions[idx]?.sectionId || '' });
    if (userId && mockId) {
      const { firestore: db } = initializeFirebase();
      updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { currentIdx: idx, visited: newVisited, updatedAt: serverTimestamp() }).catch(() => {});
    }
  },

  setAnswer: (idx, optionIdx, db) => {
    const { answers, status, userId, mockId } = get();
    if (!userId || !mockId || !db) return;
    const newAnswers = { ...answers };
    const newStatus = { ...status };
    
    set({ isSyncing: true });
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
    }).then(() => set({ isSyncing: false })).catch(() => set({ isSyncing: false }));
  },

  clearAnswer: (idx, db) => {
    const { answers, status, userId, mockId } = get();
    if (!userId || !mockId || !db) return;
    const newAnswers = { ...answers };
    const newStatus = { ...status };
    
    set({ isSyncing: true });
    delete newAnswers[idx];
    newStatus[idx] = 'not-answered';
    set({ answers: newAnswers, status: newStatus });
    
    updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { 
       [`answers.${idx}`]: null, 
       [`status.${idx}`]: 'not-answered', 
       updatedAt: serverTimestamp() 
    }).then(() => set({ isSyncing: false })).catch(() => set({ isSyncing: false }));
  },

  markForReview: (idx, db) => {
    const { status, answers, userId, mockId } = get();
    if (!userId || !mockId || !db) return;
    const newStatus = { ...status };
    const hasAnswer = answers[idx] !== undefined && answers[idx] !== null;
    
    set({ isSyncing: true });
    newStatus[idx] = hasAnswer ? 'answered-marked' : 'marked';
    set({ status: newStatus });
    
    updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { 
       [`status.${idx}`]: newStatus[idx], 
       updatedAt: serverTimestamp() 
    }).then(() => {
       set({ isSyncing: false });
       get().saveAndNext(db);
    }).catch(() => set({ isSyncing: false }));
  },

  saveAndNext: (db) => {
    const { currentIdx, questions } = get();
    if (currentIdx < questions.length - 1) get().setCurrentIdx(currentIdx + 1);
  },

  tick: () => {
    const { endTime, isPaused, isSubmitting } = get();
    if (!isPaused && !isSubmitting && endTime > 0) {
      const now = Date.now();
      const remain = Math.max(0, Math.floor((endTime - now) / 1000));
      if (get().timeLeft !== remain) set({ timeLeft: remain });
    }
  },

  addViolation: (db) => {
    const { violations, userId, mockId } = get();
    if (!userId || !mockId || !db) return;
    const newVal = (violations || 0) + 1;
    set({ violations: newVal });
    updateDoc(doc(db, 'attempts', `${userId}_${mockId}`), { violations: newVal, updatedAt: serverTimestamp() }).catch(() => {});
  }
}));
