'use client';

import { 
  Firestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter, 
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  getCountFromServer,
  FirestoreError
} from 'firebase/firestore';

/**
 * @fileOverview Institutional MCQ Filtering Engine v1.2 [RESILIENT].
 * FIXED: Optimized failover logic and ensured diagnostics don't overwrite successful fetches.
 */

export type FilterPriority = 'BOARD' | 'VERTICAL' | 'SUBJECT' | 'LANGUAGE' | 'OTHER';

export interface MCQFilters {
  boardId?: string;
  examId?: string;
  subjectId?: string;
  language?: string;
  difficulty?: string;
  questionType?: string;
  status?: string;
  chapterId?: string;
  topicId?: string;
  year?: string;
  searchTerm?: string;
}

export interface DiagnosticReport {
  success: boolean;
  filterPass: Record<string, boolean>;
  message: string;
  indexUrl?: string;
  totalDocsInCollection: number;
}

class MCQEngine {
  private collectionName = "mcqBank";

  public normalize(val: any): string {
    if (!val || typeof val !== 'string') return '';
    return val
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\t\r\n]/g, ' ')
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .toLowerCase();
  }

  private buildConstraints(filters: MCQFilters, includeOrder = true): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];
    if (filters.boardId && filters.boardId !== 'all') constraints.push(where("boardId", "==", filters.boardId));
    if (filters.examId && filters.examId !== 'all') constraints.push(where("examId", "==", filters.examId));
    if (filters.subjectId && filters.subjectId !== 'all') constraints.push(where("subjectId", "==", filters.subjectId));
    if (filters.language && filters.language !== 'all') constraints.push(where("language", "==", filters.language));
    if (filters.difficulty && filters.difficulty !== 'all') constraints.push(where("difficulty", "==", filters.difficulty));
    if (filters.status && filters.status !== 'all') constraints.push(where("status", "==", filters.status));
    if (filters.questionType && filters.questionType !== 'all') constraints.push(where("questionType", "==", filters.questionType));

    if (includeOrder) {
      constraints.push(orderBy("updatedAt", "desc"));
    }
    return constraints;
  }

  public async fetch(
    db: Firestore, 
    filters: MCQFilters, 
    pageSize: number = 50, 
    cursor?: QueryDocumentSnapshot
  ) {
    const startTime = Date.now();
    let constraints = this.buildConstraints(filters, true);
    if (cursor) constraints.push(startAfter(cursor));
    constraints.push(limit(pageSize));

    try {
      const q = query(collection(db, this.collectionName), ...constraints);
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      
      return this.processResults(db, docs, snap, filters, pageSize, startTime);

    } catch (error: any) {
      const isIndexError = error.code === 'failed-precondition' || error.message?.includes('index');
      
      if (isIndexError) {
        const fallbackConstraints = this.buildConstraints(filters, false);
        if (cursor) fallbackConstraints.push(startAfter(cursor));
        fallbackConstraints.push(limit(pageSize));
        
        const fallbackQ = query(collection(db, this.collectionName), ...fallbackConstraints);
        const fallbackSnap = await getDocs(fallbackQ);
        
        const docs = fallbackSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        const sortedDocs = [...docs].sort((a: any, b: any) => {
           const tA = a.updatedAt?.seconds || 0;
           const tB = b.updatedAt?.seconds || 0;
           return tB - tA;
        });

        const result = await this.processResults(db, sortedDocs, fallbackSnap, filters, pageSize, startTime);
        
        const indexUrl = this.extractIndexUrl(error.message);
        if (result.diagnostic) {
           result.diagnostic.message = "System using failover mode. Some sorting might be limited.";
           result.diagnostic.indexUrl = indexUrl;
        } else {
           result.diagnostic = {
              success: true,
              filterPass: {},
              message: "Index required for optimal performance. Please click to provision.",
              indexUrl: indexUrl,
              totalDocsInCollection: 0
           };
        }

        return result;
      }

      throw error;
    }
  }

  private extractIndexUrl(msg: string): string | undefined {
     const match = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
     return match ? match[0] : undefined;
  }

  private async processResults(db: Firestore, docs: any[], snap: any, filters: MCQFilters, pageSize: number, startTime: number) {
    let results = docs;
    
    if (filters.searchTerm && filters.searchTerm.trim().length >= 2) {
      const term = this.normalize(filters.searchTerm);
      results = docs.filter(d => 
        this.normalize(d.englishQuestion).includes(term) ||
        this.normalize(d.punjabiQuestion).includes(term) ||
        (d.tags || []).some((t: string) => this.normalize(t).includes(term)) ||
        this.normalize(d.id).includes(term)
      );
    }

    let diagnostic: DiagnosticReport | null = null;
    if (results.length === 0) {
      diagnostic = await this.runDiagnostics(db, filters);
    }

    return {
      data: results,
      lastVisible: snap.docs[snap.docs.length - 1],
      hasMore: snap.docs.length === pageSize,
      diagnostic
    };
  }

  private async runDiagnostics(db: Firestore, filters: MCQFilters): Promise<DiagnosticReport> {
    const colRef = collection(db, this.collectionName);
    const totalSnap = await getCountFromServer(colRef);
    const totalDocs = totalSnap.data().count;

    const report: DiagnosticReport = {
      success: false,
      filterPass: {},
      message: "No items matched the selected criteria in the database.",
      totalDocsInCollection: totalDocs
    };

    const keys: (keyof MCQFilters)[] = ['boardId', 'examId', 'subjectId', 'language', 'status'];
    
    for (const key of keys) {
      const val = filters[key];
      if (val && val !== 'all') {
        const testQ = query(colRef, where(key, "==", val), limit(1));
        const testSnap = await getDocs(testQ);
        report.filterPass[key] = !testSnap.empty;
      }
    }

    return report;
  }
}

export const mcqEngine = new MCQEngine();
