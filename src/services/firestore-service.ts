
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { 
  Board, 
  Exam, 
  Subject, 
  Question, 
  MockTest, 
  AttemptResult 
} from '@/types';

export const FirestoreService = {
  // --- Boards ---
  async getBoards(db: Firestore): Promise<Board[]> {
    const snap = await getDocs(collection(db, 'boards'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Board));
  },

  // --- Exams ---
  async getExams(db: Firestore): Promise<Exam[]> {
    const snap = await getDocs(collection(db, 'exams'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
  },

  async getExamsByBoard(db: Firestore, boardId: string): Promise<Exam[]> {
    const q = query(collection(db, 'exams'), where('boardId', '==', boardId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
  },

  // --- Questions ---
  async getQuestions(db: Firestore): Promise<Question[]> {
    const snap = await getDocs(collection(db, 'questions'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
  },

  async addQuestion(db: Firestore, question: Omit<Question, 'id'>) {
    return addDoc(collection(db, 'questions'), question);
  },

  // --- Mocks ---
  async getMocks(db: Firestore): Promise<MockTest[]> {
    const snap = await getDocs(collection(db, 'mocks'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest));
  },

  async addMock(db: Firestore, mock: Omit<MockTest, 'id'>) {
    return addDoc(collection(db, 'mocks'), mock);
  },

  // --- Results ---
  async saveResult(db: Firestore, result: Omit<AttemptResult, 'id'>) {
    return addDoc(collection(db, 'results'), {
      ...result,
      timestamp: new Date().toISOString()
    });
  }
};
