"use client"

import { create } from 'zustand';
import { AttemptState, Question, LanguageDisplayMode, QuestionStatus } from '@/types';
import { doc, updateDoc, serverTimestamp, setDoc, Firestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/app';

interface ExamStore extends AttemptState {
  questions: Question[];
  mockId: string;
  mockTitle: string;
  userId: string;
  language: LanguageDisplayMode;
  baseLanguageMode: LanguageDisplayMode;
  isPaused: boolean;
  isSubmitting: boolean;
  isPaletteVisible: boolean;
  isSyncing: boolean;

  initExam: (mockId: string, mockTitle: string, userId: string, questions: Question[], duration: number, savedState?: any, languageMode?: LanguageDisplayMode) => void;
  setLanguage: (lang: LanguageDisplayMode) => void;
  setPaused: (val: boolean) => void;
  setCurrentIdx: (idx: number) => void;
  setAnswer: (idx: number, optionIdx: number | null, db: Firestore) => void;
  clearAnswer: (idx: number, db: Firestore) => void;
  markForReview: (idx: number, db: Firestore) => void;
  saveAndNext: (db: Firestore) => void;
  tick: () => void;
  addViolation: (db: Firestore) => void;
  resetStore: () => void;
}

const initialState: AttemptState = {
  answers: {},
  status: {},
  visited: [0],
  bookmarks: [],
  timeLeft: 0,
  currentIdx: 0,
  currentSectionId: 'General Hub',
  violations: 0,
  startTime: 0,
  endTime: 0,
};

export const useExamStore = create<ExamStore>((set, get) => ({
  ...initialState,
  questions: [],
  mockId: '',
  mockTitle: '',
  userId: '',
  language: 'ENGLISH_PUNJABI',
  baseLanguageMode: 'ENGLISH_PUNJABI',
  isPaused: false,
  isSubmitting: false,
  isPaletteVisible: true,
  isSyncing: false,

  resetStore: () => set({ 
    ...initialState, 
    questions: [], 
    mockId: '', 
    mockTitle: '', 
    userId: '', 
    language: 'ENGLISH_PUNJABI',
    baseLanguageMode: 'ENGLISH_PUNJABI',
    isSubmitting: false,
    isPaused: false,
    isSyncing: false
  }),

  initExam: (mockId, mockTitle, userId, questions, duration, savedState, languageMode) => {
    const now = Date.now();
    const state = get();
    
    const isCompleted = savedState?.status === 'COMPLETED';
    const isTimedOut = savedState?.endTime && now >= savedState.endTime;
    const isDifferentMock = state.mockId !== mockId && state.mockId !== '';
    const forceReset = isCompleted || isTimedOut || isDifferentMock;

    const finalDuration = duration || 120;
    const actualStartTime = (forceReset || !savedState?.startTime) ? now : Number(savedState.startTime);
    const finalEndTime = (forceReset || !savedState?.endTime) ? (now + (finalDuration * 60 * 1000)) : Number(savedState.endTime);
    const initialTimeLeft = Math.max(0, Math.floor((finalEndTime - now) / 1000));
    const finalBaseMode: LanguageDisplayMode = languageMode || 'ENGLISH_PUNJABI';

    const initialLang: LanguageDisplayMode = (!forceReset && state.language) 
      ? state.language 
      : finalBaseMode;
    
    set({
      mockId, 
      mockTitle, 
      userId, 
      questions, 
      timeLeft: initialTimeLeft,
      baseLanguageMode: finalBaseMode,
      language: initialLang, 
      startTime: actualStartTime,
      endTime: finalEndTime,
      answers: forceReset ? {} : (savedState?.answers || {}),
      status: forceReset ? {} : (savedState?.status || {}),
      visited: forceReset ? [0] : Array.from(new Set([...(savedState?.visited || []), 0])),
      bookmarks: forceReset ? [] : (savedState?.bookmarks || []),
      violations: forceReset ? 0 : (savedState?.violations || 0),
      currentIdx: forceReset ? 0 : (savedState?.currentIdx || 0),
      currentSectionId: questions[forceReset ? 0 : (savedState?.currentIdx || 0)]?.sectionId || 'General Hub',
      isPaused: false, 
      isSyncing: false,
      isSubmitting: false
    });

    if (userId && mockId && (forceReset || !savedState)) {
      const { firestore: dbInstance } = initializeFirebase();
      setDoc(doc(dbInstance, 'attempts', `${userId}_${mockId}`), {
        userId, 
        mockId, 
        startTime: actualStartTime, 
        endTime: finalEndTime,
        status: 'IN_PROGRESS', 
        updatedAt: serverTimestamp(),
        answers: {}, 
        currentIdx: 0, 
        visited: [0]
      }, { merge: true }).catch(e => console.error("[STORE_INIT_SYNC_FAIL]:", e));
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
          const { firestore: dbInstance } = initializeFirebase();
          updateDoc(doc(dbInstance, 'attempts', `${userId}_${mockId}`), { 
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
    set({ currentIdx: idx, visited: newVisited, currentSectionId: questions[idx]?.sectionId || 'General Hub' });
    if (userId && mockId) {
      const { firestore: dbInstance } = initializeFirebase();
      updateDoc(doc(dbInstance, 'attempts', `${userId}_${mockId}`), { 
         currentIdx: idx, 
         visited: newVisited, 
         updatedAt: serverTimestamp() 
      }).catch(() => {});
    }
  },

  setAnswer: (idx, optionIdx, dbInstance) => {
    const { answers, status, userId, mockId } = get();
    if (!userId || !mockId || !dbInstance) return;
    const newAnswers = { ...answers };
    const newStatus = { ...status };
    
    if (optionIdx === null) { 
       delete newAnswers[idx]; 
       newStatus[idx] = 'not-answered'; 
    } else { 
       newAnswers[idx] = optionIdx; 
       newStatus[idx] = 'answered'; 
    }
    set({ answers: newAnswers, status: newStatus, isSyncing: true });
    
    updateDoc(doc(dbInstance, 'attempts', `${userId}_${mockId}`), { 
      [`answers.${idx}`]: optionIdx, 
      [`status.${idx}`]: newStatus[idx], 
      updatedAt: serverTimestamp() 
    }).finally(() => set({ isSyncing: false }));
  },

  clearAnswer: (idx, dbInstance) => {
    const { answers, status, userId, mockId } = get();
    if (!userId || !mockId || !dbInstance) return;
    const newAnswers = { ...answers };
    const newStatus = { ...status };
    
    delete newAnswers[idx];
    newStatus[idx] = 'not-answered';
    set({ answers: newAnswers, status: newStatus, isSyncing: true });
    
    updateDoc(doc(dbInstance, 'attempts', `${userId}_${mockId}`), { 
       [`answers.${idx}`]: null, 
       [`status.${idx}`]: 'not-answered', 
       updatedAt: serverTimestamp() 
    }).finally(() => set({ isSyncing: false }));
  },

  markForReview: (idx, dbInstance) => {
    const { status: currentStatus, answers, userId, mockId } = get();
    if (!userId || !mockId || !dbInstance) return;
    const newStatus = { ...currentStatus };
    const hasAnswer = answers[idx] !== undefined && answers[idx] !== null;
    
    const finalStatus: QuestionStatus = hasAnswer ? 'answered-marked' : 'marked';
    newStatus[idx] = finalStatus;
    set({ status: newStatus, isSyncing: true });
    
    updateDoc(doc(dbInstance, 'attempts', `${userId}_${mockId}`), { 
       [`status.${idx}`]: finalStatus, 
       updatedAt: serverTimestamp() 
    }).then(() => {
       get().saveAndNext(dbInstance);
    }).finally(() => set({ isSyncing: false }));
  },

  saveAndNext: (dbInstance) => {
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

  addViolation: (dbInstance: Firestore) => {
    const { violations, userId, mockId } = get();
    if (!userId || !mockId || !dbInstance) return;
    const newVal = (violations || 0) + 1;
    set({ violations: newVal });
    updateDoc(doc(dbInstance, 'attempts', `${userId}_${mockId}`), { violations: newVal, updatedAt: serverTimestamp() }).catch(() => {});
  }
}));
