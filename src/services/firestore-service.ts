import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  addDoc,
  orderBy,
  Query,
  DocumentData,
} from "firebase/firestore"
import { Board, Exam, Question, MockTest, AttemptResult } from "@/types"

/**
 * @fileOverview Firestore Service v1.4 - Production Ready
 * FIXED: Synchronized imports and type definitions.
 */

export const FirestoreService = {
  // --- Boards ---
  async getBoards(db: Firestore): Promise<Board[]> {
    const snap = await getDocs(collection(db, "boards"))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Board))
  },

  // --- Exams ---
  async getExams(db: Firestore): Promise<Exam[]> {
    const snap = await getDocs(collection(db, "exams"))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Exam))
  },

  async getExamsByBoard(db: Firestore, boardId: string): Promise<Exam[]> {
    const q = query(collection(db, "exams"), where("boardId", "==", boardId))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Exam))
  },

  // --- Questions ---
  async getQuestions(db: Firestore): Promise<Question[]> {
    const snap = await getDocs(
      query(collection(db, "questions"), orderBy("createdAt", "desc"))
    )
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question))
  },

  async setQuestion(db: Firestore, id: string, data: any) {
    return setDoc(doc(db, "questions", id), data, { merge: true })
  },

  async deleteQuestion(db: Firestore, id: string) {
    return deleteDoc(doc(db, "questions", id))
  },

  // --- Mocks ---
  async getMocks(db: Firestore): Promise<MockTest[]> {
    const snap = await getDocs(
      query(collection(db, "mocks"), orderBy("createdAt", "desc"))
    )
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockTest))
  },

  async publishMock(db: Firestore, id: string, data: any) {
    return setDoc(doc(db, "mocks", id), data)
  },

  async deleteMock(db: Firestore, id: string) {
    return deleteDoc(doc(db, "mocks", id))
  },

  // --- Results ---
  async saveResult(db: Firestore, result: AttemptResult) {
    return addDoc(collection(db, "results"), {
      ...result,
      timestamp: serverTimestamp(),
    })
  },
}
