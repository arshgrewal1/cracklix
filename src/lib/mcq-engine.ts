
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
  getCountFromServer
} from 'firebase/firestore';

/**
 * @fileOverview Institutional MCQ Filtering Engine v1.0 [PRODUCTION LOCK].
 * Discards all legacy patching for a deterministic, hierarchy-based query architecture.
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
  totalDocsInCollection: number;
}

class MCQEngine {
  private collectionName = "mcqBank";

  /**
   * Normalization Engine: Sanitizes strings for deterministic comparison.
   */
  public normalize(val: any): string {
    if (!val || typeof val !== 'string') return '';
    return val
      .trim()
      .replace(/\s+/g, ' ')                   // No duplicate spaces
      .replace(/[\t\r\n]/g, ' ')              // No tabs or newlines
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // Normalize single quotes
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // Normalize double quotes
      .replace(/[\u2013\u2014]/g, '-')        // Normalize dashes
      .toLowerCase();
  }

  /**
   * Smart Matching: Validates if two values match after normalization or alias mapping.
   */
  public smartMatch(source: string, target: string): boolean {
    const s = this.normalize(source);
    const t = this.normalize(target);
    if (s === t) return true;

    // OCR/Alias Mapping Logic
    const aliases: Record<string, string[]> = {
      'punjab history & culture': ['punjab history and culture', 'punjab history culture', 'punjab history-culture'],
      'quant': ['quantitative aptitude', 'math', 'mathematics'],
      'reasoning': ['mental ability', 'logical reasoning']
    };

    return aliases[s]?.includes(t) || aliases[t]?.includes(s) || false;
  }

  /**
   * Query Engine: Builds optimized Firestore queries based on priority hierarchy.
   */
  public async fetch(
    db: Firestore, 
    filters: MCQFilters, 
    pageSize: number = 50, 
    cursor?: QueryDocumentSnapshot
  ) {
    const startTime = Date.now();
    const constraints: QueryConstraint[] = [];

    // 1. Apply Priority Constraints (Equality filters first)
    if (filters.boardId && filters.boardId !== 'all') constraints.push(where("boardId", "==", filters.boardId));
    if (filters.examId && filters.examId !== 'all') constraints.push(where("examId", "==", filters.examId));
    if (filters.subjectId && filters.subjectId !== 'all') constraints.push(where("subjectId", "==", filters.subjectId));
    if (filters.language && filters.language !== 'all') constraints.push(where("language", "==", filters.language));
    if (filters.difficulty && filters.difficulty !== 'all') constraints.push(where("difficulty", "==", filters.difficulty));
    if (filters.status && filters.status !== 'all') constraints.push(where("status", "==", filters.status));
    if (filters.questionType && filters.questionType !== 'all') constraints.push(where("questionType", "==", filters.questionType));

    // 2. Add Ordering
    constraints.push(orderBy("updatedAt", "desc"));

    // 3. Pagination
    if (cursor) constraints.push(startAfter(cursor));
    constraints.push(limit(pageSize));

    const q = query(collection(db, this.collectionName), ...constraints);
    
    try {
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      const executionTime = Date.now() - startTime;

      // 4. Client-side Search Refinement (if searchTerm exists)
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

      // 5. Diagnostics if empty
      let diagnostic: DiagnosticReport | null = null;
      if (results.length === 0 && !cursor) {
        diagnostic = await this.runDiagnostics(db, filters);
      }

      console.log(`[MCQ_ENGINE] Query Execution: ${executionTime}ms. Returned ${results.length} nodes.`);

      return {
        data: results,
        lastVisible: snap.docs[snap.docs.length - 1],
        hasMore: snap.docs.length === pageSize,
        diagnostic
      };
    } catch (error: any) {
      console.error("[MCQ_ENGINE_CRITICAL]:", error);
      throw error;
    }
  }

  /**
   * Fallback Engine: Identifies which filter is responsible for zero results.
   */
  private async runDiagnostics(db: Firestore, filters: MCQFilters): Promise<DiagnosticReport> {
    const colRef = collection(db, this.collectionName);
    const totalSnap = await getCountFromServer(colRef);
    const totalDocs = totalSnap.data().count;

    const report: DiagnosticReport = {
      success: false,
      filterPass: {},
      message: "No documents matched the selected criteria.",
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

    const failingKeys = Object.entries(report.filterPass)
      .filter(([_, pass]) => !pass)
      .map(([key]) => key);

    if (failingKeys.length > 0) {
      report.message = `Data exists, but the following filters returned zero matches: ${failingKeys.join(', ')}. Value mismatch detected.`;
    } else if (totalDocs > 0) {
      report.message = "Individual filters passed, but the combined intersection of these values does not exist in any document.";
    }

    return report;
  }
}

export const mcqEngine = new MCQEngine();
